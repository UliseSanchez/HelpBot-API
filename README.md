# ChatGPT API Wrapper

This is a FastAPI-based API that connects users to ChatGPT via OpenAI's API and saves conversation history in a PostgreSQL database.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```


2. Set up PostgreSQL database:
   - Create a database named `chatbot_db` (or update `.env` accordingly).
   - Update `.env` with your database credentials and OpenAI API key.

3. Create database tables (Alembic migrations recommended):
   - Initialize Alembic (first time only):
     ```bash
     alembic init alembic
     ```
   - Generate migration for your models:
     ```bash
     alembic revision --autogenerate -m "create tables"
     ```
   - Apply migrations to create tables:
     ```bash
     alembic upgrade head
     ```
   - Alternatively, you can use:
     ```bash
     python create_tables.py
     ```

4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- `POST /chat`: Send a message to ChatGPT. Body: `{"user_id": "string", "message": "string"}`
- `GET /history/{user_id}`: Get conversation history for a user.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key. To get it you should login into your openai account onto platform.openai.com
- `DATABASE_URL`: PostgreSQL connection string.
