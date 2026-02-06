from sqlalchemy.orm import Session
from models.message import Message
from typing import List

def get_messages(db: Session, user_id: str) -> List[dict]:
    messages = db.query(Message).filter(Message.user_id == user_id).order_by(Message.timestamp).all()
    return [{"role": msg.role, "content": msg.content} for msg in messages]

def save_message(db: Session, user_id: str, role: str, content: str):
    db_message = Message(user_id=user_id, role=role, content=content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message