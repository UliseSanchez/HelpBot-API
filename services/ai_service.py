from google import genai
from google.genai import types
from config import settings

class AIService:
    def __init__(self, system_prompt: str):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.system_prompt = system_prompt
        self.model = settings.model_name

    def ask(self, user_message: str, context: str = "", image_bytes: bytes = None, image_mime_type: str = None) -> str:
        full_context = context + "\n\n" + user_message if context else user_message
        prompt = self.system_prompt + "\n\n" + full_context

        if image_bytes:
            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=image_mime_type or "image/jpeg"),
                types.Part.from_text(text=prompt),
            ]
        else:
            contents = prompt

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents
        )
        return response.text


SYSTEM_PROMPT = """Eres un asistente útil y
amigable que ayuda a adultos mayores con tramites del gobierno de Mexico.
Usa un lenguaje sencillo, frases cortas y ejemplos claros.
No inventes información. Si no sabes la respuesta, di que no lo sabes.
"""

ai_service = AIService(SYSTEM_PROMPT)