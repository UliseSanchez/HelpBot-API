#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
    sleep 1
done

echo "Database is ready. Starting the application..."
alembic upgrade head

exec uvicorn main:app --host 0.0.0.0 --port 8000