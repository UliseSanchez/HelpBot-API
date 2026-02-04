# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port the app runs on (adjust if needed)
EXPOSE 8000

# Define environment variable (optional)
ENV PYTHONUNBUFFERED=1

# Run the application (adjust the command as needed)
CMD ["python", "main.py"]
