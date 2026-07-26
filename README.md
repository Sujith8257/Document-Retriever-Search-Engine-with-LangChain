# Document Retriever & Search Engine (RAG)

A modern, print-style **Retrieval-Augmented Generation (RAG)** application. This platform allows users to upload documents (PDF and CSV format), run them through an extraction, chunking, and embedding generation pipeline, index them into **MongoDB Atlas Vector Search**, and query them in natural language.

---

## Key Features

- **Ingestion Pipeline**: Processes `.pdf` and `.csv` uploads, extracting text, splitting into chunks, and generating sentence vectors.
- **Progressive Loader UI**: Displays real-time pipeline status (Parsing $\rightarrow$ Chunking $\rightarrow$ Embedding $\rightarrow$ MongoDB indexing).
- **Vector Search**: Leverages MongoDB Atlas Vector Search pipelines for semantic text comparisons.
- **Hugging Face Inference**: Integrates with OpenAI-compatible Hugging Face inference routers (`gpt-oss-120b:cerebras`) for context-driven answer synthesis.
- **Minimalist UX**: Features a premium, print-like layout with responsive styling and a responsive Light (Warm Print) / Dark (Midnight Ink) toggle switch.
- **Flexible Deployments**: Supports switching between a cloud-deployed backend and local instances via a toggle in the UI.

---

## Project Directory Structure

```text
├── BACKEND/
│   ├── app.py                  # Flask API Entry point
│   ├── getFiles.py             # Route handlers (/uploadFiles & /uploadQuery)
│   ├── fileLoader.py           # LangChain PDF chunking loader
│   ├── getCsvFiles.py          # LangChain CSV chunking loader
│   ├── loadModel.py            # SentenceTransformers loader (all-MiniLM-L6-V2)
│   ├── generatingEmbedding.py  # Coordinates embedding generation
│   ├── mongoDb.py              # MongoDB insertion & indexing trigger
│   ├── indexModel.py           # MongoDB SearchIndexModel definition
│   ├── vectorSearch.py         # MongoDB $vectorSearch query aggregation
│   └── requirements.txt        # Python dependencies list
│
├── FRONTEND/
│   ├── src/
│   │   ├── upload/
│   │   │   └── Upload.jsx      # Stage, drag-drop, and ingestion loader component
│   │   ├── Response/
│   │   │   └── Response.jsx    # Search input, citations list, and reset component
│   │   ├── App.jsx             # Core router and theme context toggles
│   │   ├── index.css           # Styling tokens and minimalist layouts
│   │   └── main.jsx            # React root mount
│   ├── index.html              # Custom fonts and document metadata
│   └── package.json            # Node project configuration
│
└── main.py                     # Root stub file
```

---

## Technical Specifications

- **Text Chunking**: LangChain `RecursiveCharacterTextSplitter` configured with a target `chunk_size` of `400` characters and `20` characters `overlap`.
- **Embeddings Model**: `SentenceTransformer` utilizing the `"all-MiniLM-L6-V2"` model (maps strings to 384-dimensional vector outputs).
- **Index Dimensions**: 384 dimensions using **Cosine Similarity** mapping.
- **Pre-Filtering**: Index filters search bounds to documents matching a specific `file_id` session, avoiding cross-pollination of document namespaces.

---

## Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Python 3.9+**
- **Node.js 18+ & npm**
- **MongoDB Atlas Cluster** (with Vector Search indexing capabilities)
- **Hugging Face API Token**

---

### 1. Backend Server Configuration

1. Navigate to the backend folder:
   ```bash
   cd BACKEND
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `BACKEND` directory with the following variables:
   ```env
   MongodbApi=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   openAiApi=your_hugging_face_inference_key
   ```
5. Start the development server (runs by default on `http://127.0.0.1:5000`):
   ```bash
   python app.py
   ```

---

### 2. Frontend React Configuration

1. Navigate to the frontend folder:
   ```bash
   cd ../FRONTEND
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local address (e.g., `http://localhost:5173`) in your web browser.

---

## How It Works

1. **Upload & Embed**:
   - When files are dropped in, they are staged.
   - Clicking upload sends the files to the `/uploadFiles` API endpoint.
   - The document loaders read the text and slice them into chunks.
   - Vectors are created, matched to a generated random 6-character session ID (`file_id`), indexed in MongoDB Atlas, and saved.
2. **Retrieve & Answer**:
   - The user inputs a query.
   - The backend encodes the query into a vector representation.
   - A MongoDB Atlas aggregation query searches matching vectors (filtered by the session ID).
   - Top-scoring text matches are combined as context inside an LLM prompt.
   - The language model synthesizes the final reply, returning it alongside source documents.
