import base64
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from crud import get_messages, save_message
from config import settings
from services.ai_service import ai_service
from services.chatbot_service import message_handler

app = FastAPI(title="ChatGPT API Wrapper", description="API to interact with ChatGPT and save conversation history")


# CONFIGURACIÓN DE CORS -
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # El puerto por defecto de Vite/React
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, etc.
    allow_headers=["*"], # Permite todos los headers
)
class ChatRequest(BaseModel):
    user_id: str
    message: str
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = None

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get conversation history
        history = get_messages(db, request.user_id)

        # Save user message
        save_message(db, request.user_id, "user", request.message)

        context = "\n".join([msg["content"] for msg in history if msg["role"] == "assistant"])

        image_bytes = base64.b64decode(request.image_base64) if request.image_base64 else None
        result = message_handler(request.message, context, image_bytes, request.image_mime_type)

        if result["action"] == "redirect_sat_citas":
            return {"reply": "Redirigiendo a la página de citas del SAT...", "redirect_url": "https://citas.sat.gob.mx/"}

        reply = result["reply"]
        save_message(db, request.user_id, "assistant", reply)
        return {"reply": reply, "popup_url": result["popup_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: str, db: Session = Depends(get_db)):
    messages = get_messages(db, user_id)
    return {"history": messages}