"""
OpenRouter implementation of the AI service.
Uses OpenRouter's OpenAI-compatible chat completions API.
"""
import json
import logging
import httpx

from ..config import settings
from .ai import AIService

logger = logging.getLogger(__name__)


class GeminiService(AIService):
    """AI service backed by OpenRouter's API."""

    def __init__(self):
        if not settings.OPENROUTER_API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY is not configured")
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.GEMINI_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def analyze_note(
        self,
        image_bytes: bytes,
        mime_type: str,
        notebook_names: list[str],
        chapter_names: list[str] | None = None,
    ) -> dict:
        import base64

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

        # Encode image as base64
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        image_url = f"data:{mime_type};base64,{image_b64}"

        # Build request
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

        # Call OpenRouter
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                self.base_url,
                json=payload,
                headers=headers,
            )

        if response.status_code != 200:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            raise RuntimeError(f"AI service returned status {response.status_code}")

        # Parse response
        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            result = json.loads(content)
        except (KeyError, json.JSONDecodeError, IndexError) as e:
            logger.error(f"Failed to parse OpenRouter response: {e}")
            raise RuntimeError("Invalid response from AI service") from e

        return result
