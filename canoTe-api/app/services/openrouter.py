"""
OpenRouter implementation of the AI service.
Uses OpenRouter's OpenAI-compatible chat completions API.
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
MAX_ATTEMPTS = 3
BASE_BACKOFF_SECONDS = 2.0
MAX_BACKOFF_SECONDS = 30.0

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


class OpenRouterService(AIService):
    """AI service backed by OpenRouter's API."""

    def __init__(self):
        if not settings.OPENROUTER_API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY is not configured")
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

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
        payload = {
            "model": self.model,
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

        response = await self._post_with_retries(payload, headers)

        # Map upstream failures to safe, actionable errors
        if response.status_code in (401, 403):
            raise AIServiceError(
                "AI service authentication failed. Check OPENROUTER_API_KEY on the server."
            )
        if response.status_code == 402:
            raise AIServiceError(
                "AI service credit limit reached. Add credits on OpenRouter or lower max_tokens."
            )
        if response.status_code == 429:
            _, limit_source = _extract_error_details(response)
            if limit_source == "upstream_provider_shared_pool":
                raise AIServiceError(
                    "The AI model's free capacity is temporarily exhausted "
                    "(shared across all free users). Please wait a minute and "
                    "try again.",
                    status_code=429,
                )
            raise AIServiceError(
                "AI service is rate-limited. Please try again shortly.",
                status_code=429,
            )
        if response.status_code >= 500:
            raise AIServiceError(
                "AI service is temporarily unavailable. Please try again."
            )
        if response.status_code != 200:
            logger.error(
                f"OpenRouter API error: {response.status_code} - {response.text}"
            )
            raise AIServiceError(
                f"AI service returned unexpected status {response.status_code}."
            )

        # Parse response
        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            result = _parse_model_json(content)
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
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

    async def _post_with_retries(
        self, payload: dict, headers: dict
    ) -> httpx.Response:
        """POST to OpenRouter, retrying transient failures with linear backoff."""
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        self.base_url, json=payload, headers=headers
                    )
            except httpx.TimeoutException as e:
                logger.warning(
                    f"OpenRouter request timed out (attempt {attempt}/{MAX_ATTEMPTS})"
                )
                if attempt < MAX_ATTEMPTS:
                    await asyncio.sleep(BASE_BACKOFF_SECONDS * attempt)
                    continue
                raise AIServiceError(
                    "AI service timed out. Please try again.", status_code=504
                ) from e
            except httpx.HTTPError as e:
                logger.warning(
                    f"OpenRouter request failed: {e} (attempt {attempt}/{MAX_ATTEMPTS})"
                )
                if attempt < MAX_ATTEMPTS:
                    await asyncio.sleep(BASE_BACKOFF_SECONDS * attempt)
                    continue
                raise AIServiceError(
                    "Could not reach the AI service. Please try again."
                ) from e

            if response.status_code in RETRYABLE_STATUS and attempt < MAX_ATTEMPTS:
                _log_failure_details(response)
                retry_after = _parse_retry_after(response)

                # A long cool-down is pointless for an interactive request —
                # fail fast and let the user retry later instead of hanging.
                if retry_after is not None and retry_after > MAX_BACKOFF_SECONDS:
                    logger.warning(
                        f"OpenRouter {response.status_code} Retry-After="
                        f"{retry_after:.0f}s exceeds {MAX_BACKOFF_SECONDS:.0f}s cap, "
                        "not retrying"
                    )
                    return response

                # Respect Retry-After when given, otherwise exponential backoff.
                delay = (
                    retry_after
                    if retry_after is not None
                    else BASE_BACKOFF_SECONDS * (2 ** (attempt - 1))
                )
                delay = min(delay, MAX_BACKOFF_SECONDS)
                logger.warning(
                    f"OpenRouter returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_ATTEMPTS}), retrying in {delay:.0f}s"
                )
                await asyncio.sleep(delay)
                continue

            if response.status_code != 200:
                _log_failure_details(response)

            return response

        raise AIServiceError("AI service request failed. Please try again.")
