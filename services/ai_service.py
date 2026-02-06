from google import genai
from config import settings

class AIService:
    def __init__(self, system_prompt: str):
        self.client = genai.Client()
        self.system_prompt = system_prompt
        self.model = settings.model_name
    
    def ask(self, user_message: str, context: str = "") -> str:
        full_context = context + "\n\n" + user_message if context else user_message
        prompt = self.system_prompt + "\n\n" + full_context
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )
        return response.text


SYSTEM_PROMPT = """Eres un asistente útil y
amigable que ayuda a adultos mayores con tramites del gobierno de Mexico.
Usa un lenguaje sencillo, frases cortas y ejemplos claros.
No inventes información. Si no sabes la respuesta, di que no lo sabes.
"""

ai_service = AIService(SYSTEM_PROMPT)