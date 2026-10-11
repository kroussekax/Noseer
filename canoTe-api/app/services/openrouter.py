"""
OpenRouter implementation of the AI service.
Uses OpenRouter's OpenAI-compatible chat completions API.

Supports a model rotation: when the primary model fails (free-tier rate
limit, provider outage, unusable output), the next model in the list is
tried automatically.
"""
import asyncio
import base64
import json
import logging
import re

import httpx

from ..config import settings
from .ai import AIService, AIServiceError

logger = logging.getLogger(__name__)

# Transient upstream failures that are worth retrying.
RETRYABLE_STATUS = {429, 500, 502, 503, 529}
# Small per-model budget: rotation across models matters more than
# hammering one exhausted free pool.
MAX_ATTEMPTS_PER_MODEL = 2
BASE_BACKOFF_SECONDS = 2.0
MAX_BACKOFF_SECONDS = 30.0
# Upper bound on cumulative sleeping across ALL models, so one API call
# never hangs the request for minutes.
MAX_TOTAL_WAIT = 25.0

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def _parse_retry_after(response: httpx.Response) -> float | None:
    """Parse the Retry-After header (delta-seconds) if present and numeric."""
    value = response.headers.get("retry-after")
    if value is None:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        return None


def _extract_error_details(response: httpx.Response) -> tuple[str, str]:
    """
    Extract (message, limit_source) from an OpenRouter error body.

    Both are safe to log — OpenRouter error bodies never contain the API key.
    """
    try:
        err = response.json().get("error", {})
        message = str(err.get("message", ""))[:300]
        metadata = err.get("metadata") or {}
        limit_source = str(metadata.get("limit_source", "unknown")) or "unknown"
        return message, limit_source
    except Exception:
        return "", "unknown"


def _log_failure_details(response: httpx.Response) -> None:
    """Log safe diagnostics for a failed OpenRouter response (no keys, no image data)."""
    message, limit_source = _extract_error_details(response)
    headers = response.headers
    logger.warning(
        "OpenRouter %s: message=%r limit_source=%s retry_after=%s "
        "ratelimit_remaining=%s ratelimit_limit=%s ratelimit_reset=%s",
        response.status_code,
        message,
        limit_source,
        headers.get("retry-after"),
        headers.get("x-ratelimit-remaining-requests"),
        headers.get("x-ratelimit-limit-requests"),
        headers.get("x-ratelimit-reset"),
    )


def _parse_model_json(content: str):
    """
    Parse JSON out of raw model output.

    Tolerates common VLM quirks:
    - markdown code fences (```json ... ```)
    - a single-element array wrapping the object ([{...}])
    """
    text = content.strip()
    fenced = _FENCE_RE.search(text)
    if fenced:
        text = fenced.group(1)
    result = json.loads(text)
    # Some models wrap the result in a one-element array
    while isinstance(result, list) and len(result) == 1:
        result = result[0]
    return result


def _parse_success(response: httpx.Response) -> dict:
    """Parse a 200 response into the analysis dict, or raise AIServiceError."""
    try:
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        # Reasoning models sometimes return 200 with null/empty content
        # (e.g. when all tokens went to reasoning). Treat as unusable.
        if not isinstance(content, str) or not content.strip():
            raise ValueError("empty or non-string content")
        result = _parse_model_json(content)
    except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse OpenRouter response: {e}")
        raise AIServiceError(
            "AI service returned an invalid response. Please try again."
        ) from e

    if not isinstance(result, dict):
        logger.error(
            f"OpenRouter response is not a JSON object: {type(result).__name__}"
        )
        raise AIServiceError(
            "AI service returned an invalid response. Please try again."
        )

    return result


class OpenRouterService(AIService):
    """AI service backed by OpenRouter's API, with automatic model fallback."""

    def __init__(self):
        if not settings.OPENROUTER_API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY is not configured")
        self.api_key = settings.OPENROUTER_API_KEY
        self.models = self._parse_models()
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        # Cumulative sleep across models (see MAX_TOTAL_WAIT)
        self._used_wait = 0.0
        self._backoff_step = 0

    @staticmethod
    def _parse_models() -> list[str]:
        """Primary AI_MODEL plus AI_FALLBACK_MODELS, in order, deduplicated."""
        raw = f"{settings.AI_MODEL},{settings.AI_FALLBACK_MODELS}"
        models: list[str] = []
        for m in raw.split(","):
            m = m.strip()
            if m and m not in models:
                models.append(m)
        return models

    async def analyze_note(
        self,
        image_bytes: bytes,
        mime_type: str,
        notebook_names: list[str],
        chapter_names: list[str] | None = None,
    ) -> dict:
        # Build context
        notebooks_str = ", ".join(notebook_names) if notebook_names else "(none)"
        chapters_str = ", ".join(chapter_names) if chapter_names else "(none)"

        prompt = f"""You are an AI assistant that analyzes photos of handwritten or printed notes.

The user has the following notebooks: {notebooks_str}

{f"The selected notebook has the following chapters: {chapters_str}" if chapter_names else ""}

Analyze the image and return a JSON object with these exact fields:
- title: A concise title for the note (max 100 chars)
- suggested_notebook: The most appropriate notebook name from the list above, or a new name if none fit
- suggested_notebook_exists: true if the suggested notebook exists in the list above, false otherwise
- suggested_chapter: The most appropriate chapter name (or a new one if none fit)
- suggested_chapter_exists: true if the suggested chapter exists in the chapter list, false otherwise
- extracted_text: The text extracted from the image. Preserve meaningful formatting. Do NOT hallucinate missing text. If text is unreadable, say "[unreadable]".
- visual_elements: Array of objects with keys: type (diagram|graph|table|equation|drawing|chart|illustration|other), description, bounding_box (object with x, y, width, height based on original image dimensions, or null if unknown)
- confidence: A float between 0 and 1 indicating overall confidence

Return ONLY valid JSON. No markdown, no explanation."""

        # Encode image as base64 data URI
        image_b64 = base64.b64encode(image_bytes).decode("ascii")
        image_url = f"data:{mime_type};base64,{image_b64}"

        # Build request (OpenAI-compatible chat completions format)
        payload: dict = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            "max_tokens": 4096,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "canoTe",
        }

        last_error: AIServiceError | None = None
        # Any non-401/403 response proves the key itself is valid, so a later
        # 401 is model-level gating (BYOK/special access), not a broken key.
        key_validated = False

        for index, model in enumerate(self.models):
            has_next = index < len(self.models) - 1

            try:
                response = await self._post_with_retries(model, payload, headers)
            except AIServiceError as e:
                # Network failure / timeout after this model's retries
                last_error = e
                if has_next:
                    logger.warning(
                        f"Model {model} failed ({e}); "
                        f"falling back to {self.models[index + 1]}"
                    )
                    continue
                raise last_error

            if response.status_code not in (401, 403):
                key_validated = True

            # 401/403 with no prior proof the key works = broken/missing key.
            # Fail immediately — rotating models cannot fix that.
            # But if an earlier model authenticated fine (e.g. returned 429),
            # this 401 is the model rejecting access for this account: skip it.
            if response.status_code in (401, 403):
                if key_validated and has_next:
                    _log_failure_details(response)
                    logger.warning(
                        f"Model {model} rejected access (401/403) but the API key "
                        f"is valid — model likely requires special access. "
                        f"Skipping to {self.models[index + 1]}"
                    )
                    continue
                if key_validated and not has_next:
                    # Last model gated too — surface the earlier real error
                    raise last_error or AIServiceError(
                        "AI service authentication failed. Check OPENROUTER_API_KEY on the server."
                    )
                raise AIServiceError(
                    "AI service authentication failed. Check OPENROUTER_API_KEY on the server."
                )

            # Account-level failures — the same key is used for every model,
            # so switching models cannot help. Fail immediately.
            if response.status_code == 402:
                raise AIServiceError(
                    "AI service credit limit reached. Add credits on OpenRouter or lower max_tokens."
                )

            if response.status_code == 429:
                _log_failure_details(response)
                last_error = self._rate_limit_error(response)
                if has_next:
                    logger.warning(
                        f"Model {model} rate-limited; "
                        f"falling back to {self.models[index + 1]}"
                    )
                    continue
                raise last_error

            if response.status_code != 200:
                _log_failure_details(response)
                last_error = AIServiceError(
                    "AI service is temporarily unavailable. Please try again."
                )
                if has_next:
                    logger.warning(
                        f"Model {model} returned {response.status_code}; "
                        f"falling back to {self.models[index + 1]}"
                    )
                    continue
                raise last_error

            # 200 — parse; a different model may format better, so treat
            # unusable output as fallback-worthy too.
            try:
                return _parse_success(response)
            except AIServiceError as e:
                last_error = e
                if has_next:
                    logger.warning(
                        f"Model {model} returned unusable output; "
                        f"falling back to {self.models[index + 1]}"
                    )
                    continue
                raise last_error

        raise last_error or AIServiceError("AI service request failed. Please try again.")

    @staticmethod
    def _rate_limit_error(response: httpx.Response) -> AIServiceError:
        _, limit_source = _extract_error_details(response)
        if limit_source == "upstream_provider_shared_pool":
            return AIServiceError(
                "The AI model's free capacity is temporarily exhausted "
                "(shared across all free users). Please wait a minute and "
                "try again.",
                status_code=429,
            )
        return AIServiceError(
            "AI service is rate-limited. Please try again shortly.",
            status_code=429,
        )

    async def _post_with_retries(
        self, model: str, payload: dict, headers: dict
    ) -> httpx.Response:
        """POST one model to OpenRouter, retrying transient failures with backoff."""
        for attempt in range(1, MAX_ATTEMPTS_PER_MODEL + 1):
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        self.base_url,
                        json={**payload, "model": model},
                        headers=headers,
                    )
            except httpx.TimeoutException as e:
                logger.warning(
                    f"OpenRouter request timed out for {model} "
                    f"(attempt {attempt}/{MAX_ATTEMPTS_PER_MODEL})"
                )
                if attempt < MAX_ATTEMPTS_PER_MODEL and await self._wait_backoff(None):
                    continue
                raise AIServiceError(
                    "AI service timed out. Please try again.", status_code=504
                ) from e
            except httpx.HTTPError as e:
                logger.warning(
                    f"OpenRouter request failed for {model}: {e} "
                    f"(attempt {attempt}/{MAX_ATTEMPTS_PER_MODEL})"
                )
                if attempt < MAX_ATTEMPTS_PER_MODEL and await self._wait_backoff(None):
                    continue
                raise AIServiceError(
                    "Could not reach the AI service. Please try again."
                ) from e

            if response.status_code in RETRYABLE_STATUS and attempt < MAX_ATTEMPTS_PER_MODEL:
                _log_failure_details(response)
                retry_after = _parse_retry_after(response)

                # A long cool-down is pointless for an interactive request —
                # let the caller move on (next model or clear error).
                if retry_after is not None and retry_after > MAX_BACKOFF_SECONDS:
                    logger.warning(
                        f"OpenRouter {response.status_code} Retry-After="
                        f"{retry_after:.0f}s exceeds {MAX_BACKOFF_SECONDS:.0f}s cap, "
                        "not retrying"
                    )
                    return response

                if not await self._wait_backoff(retry_after):
                    # Wait budget exhausted — surface this response to the caller
                    return response

                logger.warning(
                    f"OpenRouter returned {response.status_code} for {model} "
                    f"(attempt {attempt}/{MAX_ATTEMPTS_PER_MODEL}), retrying"
                )
                continue

            return response

        raise AIServiceError("AI service request failed. Please try again.")

    async def _wait_backoff(self, retry_after: float | None) -> bool:
        """
        Sleep for the backoff delay. Returns False (and skips the sleep)
        when Retry-After is given or the cumulative wait budget is used up.
        """
        if retry_after is not None:
            delay = retry_after
        else:
            delay = BASE_BACKOFF_SECONDS * (2 ** self._backoff_step)
        if self._used_wait + delay > MAX_TOTAL_WAIT:
            logger.warning(
                f"Wait budget exhausted ({self._used_wait + delay:.0f}s > "
                f"{MAX_TOTAL_WAIT:.0f}s), skipping further waits"
            )
            return False
        self._used_wait += delay
        self._backoff_step += 1
        await asyncio.sleep(delay)
        return True
