from database import Base, engine
from models.message import Message
from models.conversation import Conversation

# Create all tables
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")