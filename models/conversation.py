from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    message = Column(Text)
    role = Column(String)  # 'user' or 'assistant'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())