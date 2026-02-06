# ChatGPT API Wrapper

This is a FastAPI-based API that connects users to ChatGPT via OpenAI's API and saves conversation history in a PostgreSQL database.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/UliseSanchez/HelpBot.git
cd HelpBot
```

### 2. Set up the database with Docker Compose

If you want to use PostgreSQL with Docker Compose:

```bash
docker-compose up -d db
```

This will start a PostgreSQL database as defined in `docker-compose.yaml`.

Update your `.env` file with the correct `DATABASE_URL` for PostgreSQL:
```
DATABASE_URL=postgresql://postgres:chatbotpostgres@localhost:5432/chatbot
```

### 3. Create and activate a virtual environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# Or
source venv/bin/activate  # Linux/Mac
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Update `.env` with your database credentials and OpenAI API key

## Create database tables (Alembic migrations recommended)

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

## Run the server

```bash
uvicorn main:app --reload
```

## API Endpoints

- `POST /chat`: Send a message to ChatGPT. Body: `{"user_id": "string", "message": "string"}`
- `GET /history/{user_id}`: Get conversation history for a user.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key. To get it you should login into your openai account onto platform.openai.com
- `DATABASE_URL`: PostgreSQL connection string.
