from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from crud import get_messages, save_message
from config import settings
from services.ai_service import ai_service
from services.chatbot_service import message_handler

app = FastAPI(title="ChatGPT API Wrapper", description="API to interact with ChatGPT and save conversation history")

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get conversation history
        history = get_messages(db, request.user_id)

        # Save user message
        save_message(db, request.user_id, "user", request.message)

        # Optionally, you can pass the history as context
        context = "\n".join([msg["content"] for msg in history if msg["role"] == "assistant"])
        reply = ai_service.ask(request.message, context)
        #Redirect to the government page
        result = message_handler(request.message, context)
        if result["action"] == "redirect_sat_citas":
            return RedirectResponse(url="https://citas.sat.gob.mx/")
   

        # Save assistant message
        save_message(db, request.user_id, "assistant", reply)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: str, db: Session = Depends(get_db)):
    messages = get_messages(db, user_id)
    return {"history": messages}