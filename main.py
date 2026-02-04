from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import openai
from database import get_db
from crud import get_messages, save_message
from config import settings

openai.api_key = settings.openai_api_key

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
        
        # Prepare messages for OpenAI
        messages = history + [{"role": "user", "content": request.message}]
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        
        reply = response.choices[0].message.content
        
        # Save assistant message
        save_message(db, request.user_id, "assistant", reply)
        
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: str, db: Session = Depends(get_db)):
    messages = get_messages(db, user_id)
    return {"history": messages}