"""
AI service abstraction.
Allows swapping the VLM provider (e.g. OpenRouter) without rewriting the API layer.
"""
from abc import ABC, abstractmethod


class AIServiceError(Exception):
    """
    Raised when the upstream AI provider fails.

    The message is safe to return to the client — it must never contain
    API keys or other secrets.
    """

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class AIService(ABC):
    @abstractmethod
    async def analyze_note(
        self,
        image_bytes: bytes,
        mime_type: str,
        notebook_names: list[str],
        chapter_names: list[str] | None = None,
    ) -> dict:
        """
        Analyze a note image and return structured analysis.

        Args:
            image_bytes: Raw image data
            mime_type: MIME type of the image
            notebook_names: List of existing notebook names
            chapter_names: List of existing chapter names (for the suggested notebook)

        Returns:
            dict with keys: title, suggested_notebook, suggested_notebook_exists,
            suggested_chapter, suggested_chapter_exists, extracted_text,
            visual_elements, confidence
        """
        pass
