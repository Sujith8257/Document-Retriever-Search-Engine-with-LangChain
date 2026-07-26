# Backend

Flask API for document ingestion, embedding, vector search, and RAG query generation.

See the [main README](../README.md) for full setup instructions, architecture, and API documentation.

## Quick start

```bash
cd BACKEND
uv sync          # or: pip install -r requirements.txt
cp .env.example .env
# Add your MongoDB Atlas URI and Hugging Face token to .env
uv run python app.py
```

Server runs at **http://localhost:5000**.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MongodbApi` | Yes | MongoDB Atlas connection string |
| `openAiApi` | Yes | Hugging Face API token |

Copy `.env.example` to `.env` before starting the server.
