"""
OpenRouter implementation of the AI service.
Uses OpenRouter's OpenAI-compatible chat completions API.
"""
import asyncio
import base64
import json
import logging

import httpx

from ..config import settings
from .ai import AIService, AIServiceError

logger = logging.getLogger(__name__)

# Transient upstream failures that are worth retrying.
RETRYABLE_STATUS = {429, 500, 502, 503, 529}
MAX_ATTEMPTS = 3
BASE_BACKOFF_SECONDS = 2.0


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
            raise AIServiceError(
                "AI service is rate-limited. Please try again shortly.", status_code=429
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
            result = json.loads(content)
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
            logger.error(f"Failed to parse OpenRouter response: {e}")
            raise AIServiceError(
                "AI service returned an invalid response. Please try again."
            ) from e

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
                logger.warning(
                    f"OpenRouter returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_ATTEMPTS}), retrying"
                )
                await asyncio.sleep(BASE_BACKOFF_SECONDS * attempt)
                continue

            return response

        raise AIServiceError("AI service request failed. Please try again.")
