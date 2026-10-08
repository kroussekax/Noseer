# canoTe

AI-assisted note capture and organization system for converting photographed notes into structured, persistent digital documents.

canoTe combines camera-based input, multimodal AI processing, structured extraction, hierarchical organization, and persistent storage into a single full-stack application.

---

## Overview

canoTe is designed around the following workflow:

```text
Image Capture
     |
     v
Image Upload
     |
     v
FastAPI Backend
     |
     v
Multimodal AI Analysis
     |
     +-------------------+
     |                   |
     v                   v
Text Extraction    Visual Analysis
     |                   |
     +---------+---------+
               |
               v
       Structured Result
               |
               v
       User Verification
               |
               v
      Notebook / Chapter
               |
               v
             Page
               |
               v
          PostgreSQL
```

The system intentionally separates **AI inference** from **database mutation**. AI produces recommendations and extracted data; the backend performs persistence only after user confirmation.

---

## Core Features

### Image-Based Note Capture

The frontend uses the browser's camera APIs to capture notes directly from supported devices.

The original image is uploaded to the backend and retained as the source document.

Supported input can include:

* Handwritten notes
* Printed documents
* Whiteboards
* Diagrams
* Graphs
* Tables
* Equations

### Multimodal AI Processing

The backend sends the uploaded image to a multimodal AI provider through OpenRouter.

The AI is responsible for:

* OCR / text extraction
* Page title generation
* Subject identification
* Notebook recommendation
* Chapter recommendation
* Visual element identification
* Basic semantic classification

The AI response is returned as structured data rather than unstructured text.

### Hierarchical Organization

Documents are organized using a persistent hierarchy:

```text
User
 |
 +-- Notebook
      |
      +-- Chapter
           |
           +-- Page
                |
                +-- Upload
```

Example:

```text
Physics
├── Kinematics
│   ├── Uniform Motion
│   └── Acceleration
│
└── Dynamics
    ├── Newton's Laws
    └── Friction
```

### User-Controlled AI

AI does not directly modify the user's organization.

The processing pipeline is:

```text
AI Recommendation
       |
       v
User Review
       |
       +---- Modify
       |
       +---- Reject
       |
       +---- Confirm
              |
              v
        Database Mutation
```

This prevents incorrect AI classifications from silently altering existing data.

---

# Architecture

## Frontend

The frontend is built with:

* Vite
* Vanilla JavaScript
* HTML
* CSS
* Tailwind-based styling

Responsibilities:

* Camera access
* Image capture
* Upload handling
* AI processing state
* Displaying AI recommendations
* Notebook/chapter selection
* Page editing
* Autosave
* API communication

The frontend does not communicate directly with the AI provider or PostgreSQL.

---

## Backend

The backend is implemented using:

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Alembic

Responsibilities:

* Authentication
* Authorization
* File validation
* Upload storage
* AI communication
* AI response validation
* Notebook/chapter/page APIs
* Database transactions
* Ownership enforcement

The backend acts as the trust boundary between the frontend, AI provider, and database.

---

## Database

PostgreSQL is used for persistent application data.

Core tables:

```text
users
notebooks
chapters
pages
uploads
```

Relationships:

```text
users
  |
  +-- notebooks
        |
        +-- chapters
              |
              +-- pages
                    |
                    +-- uploads
```

Foreign keys enforce the hierarchy and cascading behavior.

Ordering is handled using a `position` field for notebooks' child resources such as chapters and pages.

---

# AI Architecture

The AI provider is accessed exclusively from the backend.

```text
Frontend
   |
   | POST /api/ai/analyze
   v
FastAPI
   |
   | Image + Context
   v
OpenRouter
   |
   v
Vision Model
   |
   | Structured Response
   v
FastAPI
   |
   | Pydantic Validation
   v
Frontend
```

The provider is isolated behind a service layer so that the model can be replaced without changing the rest of the application.

---

## AI Input

The AI receives:

1. The uploaded image
2. Existing notebook names
3. Relevant chapter names
4. Instructions defining the required output schema

The system avoids sending unnecessary database content to the model.

For notebook classification:

```text
Image
+
Notebook names
```

For chapter classification:

```text
Image
+
Selected notebook
+
Chapter names
```

---

## AI Output

A typical response has the following structure:

```json
{
  "title": "Uniform Motion",
  "suggested_notebook": "Physics",
  "suggested_notebook_exists": true,
  "suggested_chapter": "Kinematics",
  "suggested_chapter_exists": true,
  "extracted_text": "Velocity is defined as...",
  "visual_elements": [
    {
      "type": "diagram",
      "description": "A velocity vector diagram",
      "bounding_box": {
        "x": 120,
        "y": 240,
        "width": 500,
        "height": 300
      }
    }
  ],
  "confidence": 0.91
}
```

AI responses are validated using Pydantic before being returned to the frontend.

Malformed or unexpected responses are rejected rather than being persisted directly.

---

# API

Representative API endpoints:

```text
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/auth/csrf

GET    /api/notebooks
POST   /api/notebooks
PATCH  /api/notebooks/{id}
DELETE /api/notebooks/{id}

GET    /api/notebooks/{id}/chapters
POST   /api/notebooks/{id}/chapters

GET    /api/chapters/{id}
PATCH  /api/chapters/{id}
DELETE /api/chapters/{id}

GET    /api/chapters/{id}/pages
POST   /api/chapters/{id}/pages

GET    /api/pages/{id}
PATCH  /api/pages/{id}
DELETE /api/pages/{id}

GET    /api/pages/{id}/uploads
POST   /api/pages/{id}/uploads

POST   /api/ai/analyze
```

AI analysis and persistence are intentionally separate operations.

---

# Authentication and Authorization

Authentication uses signed HTTP-only session cookies.

Security properties include:

* HTTP-only cookies
* SameSite protection
* Secure cookies in production
* CSRF protection for state-changing requests
* Argon2id password hashing
* Server-side ownership validation

The backend never trusts resource IDs provided by the client without verifying ownership.

For example:

```text
User A
  |
  +-- Notebook A
        |
        +-- Chapter A

User B
  |
  +-- Notebook B
```

User A cannot access or modify User B's resources simply by submitting User B's UUID.

---

# File Storage

Uploaded images are stored separately from relational metadata.

PostgreSQL stores metadata such as:

```text
upload_id
user_id
page_id
storage_key
mime_type
file_size
created_at
```

The actual image is stored in the configured upload storage.

The original image is preserved rather than replaced by AI-generated content.

---

# Docker Architecture

Development and deployment use Docker Compose.

```text
Docker Compose
|
+-- PostgreSQL
|
+-- FastAPI
|
+-- Frontend
```

The API connects to PostgreSQL through the Docker service name:

```text
db:5432
```

rather than:

```text
localhost:5432
```

Database data and uploaded files are stored in Docker volumes.

Example:

```yaml
volumes:
  postgres_data:
  uploads_data:
```

---

# Environment Configuration

Secrets are stored outside the source tree.

Example:

```env
DB_PASSWORD=...
SECRET_KEY=...
OPENROUTER_API_KEY=...
AI_MODEL=openrouter/free
ALLOWED_ORIGINS=http://localhost:5173
SECURE_COOKIES=false
```

Production secrets must not be committed to Git.

The OpenRouter API key is only available to the backend container.

---

# Local Development

## Backend

```bash
cd canoTe-api

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

Run the development server:

```bash
uvicorn app.main:app --reload
```

---

## Database

Using Docker Compose:

```bash
docker compose up -d db
```

Run migrations:

```bash
alembic upgrade head
```

---

## Full Stack

Start the services:

```bash
docker compose up -d
```

Check service status:

```bash
docker compose ps
```

Inspect API logs:

```bash
docker compose logs -f api
```

Check the health endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# Project Structure

```text
canoTe/
|
├── canoTe-api/
│   |
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── ai.py
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── uploads/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
│
├── canoTe-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# Persistence Model

canoTe does not rely on browser storage as the primary source of truth.

The database is authoritative.

```text
Frontend State
      |
      v
API Request
      |
      v
PostgreSQL
      |
      v
API Response
      |
      v
Frontend State
```

After a browser refresh, the frontend reconstructs the notebook hierarchy from the API.

This ensures that:

```text
Browser refresh
API restart
Container restart
```

do not cause notebook, chapter, or page data to disappear.

---

# Camera Requirements

Browser camera access requires a secure context.

Supported environments include:

```text
localhost
HTTPS
```

For remote development, Tailscale HTTPS can provide the required secure context.

The frontend handles common camera errors including:

```text
NotAllowedError
NotFoundError
NotReadableError
```

Camera tracks are stopped when the camera session ends or is restarted.

---

# AI Provider Abstraction

The AI integration is intentionally separated from the rest of the backend.

Conceptually:

```python
class AIService:
    async def analyze_note(...):
        ...
```

The application can therefore move between providers without changing the API contract.

Current provider:

```text
OpenRouter
```

Current model configuration:

```text
openrouter/free
```

A different multimodal model can be selected through configuration without changing the frontend workflow.

---

# Design Principles

## AI Is Not the Source of Truth

AI output is treated as untrusted input.

```text
AI
 |
 v
Validation
 |
 v
User
 |
 v
Backend
 |
 v
Database
```

## Database Is the Source of Truth

Notebook, chapter, page, and upload relationships are persisted in PostgreSQL.

## Backend Is the Security Boundary

Credentials, authorization, AI API calls, and database operations remain server-side.

## Provider Independence

The application should not be tightly coupled to a single AI provider.

## Minimal Infrastructure

The system intentionally avoids unnecessary infrastructure such as:

* Redis
* Message queues
* Vector databases
* Agent frameworks
* Local model serving
* Complex RAG pipelines

The initial architecture is intentionally small:

```text
Vite
+
FastAPI
+
PostgreSQL
+
OpenRouter
+
Docker
```

---

# Current Development Status

Implemented:

* FastAPI backend
* PostgreSQL persistence
* SQLAlchemy models
* Alembic migrations
* Notebook hierarchy
* Chapter hierarchy
* Page hierarchy
* Upload storage
* Authentication
* Camera capture
* Docker Compose
* AI service architecture
* Multimodal AI processing
* Structured AI responses
* AI notebook/chapter recommendations
* User confirmation workflow

Planned:

* Improved OCR formatting
* Advanced visual element extraction
* Full-text note search
* Semantic search
* Rich page editing
* Additional AI providers
* Optional local AI inference

---

# Development Priorities

The project prioritizes correctness of the data hierarchy and user control over automation.

The intended processing model is:

```text
Capture
  ↓
Analyze
  ↓
Recommend
  ↓
Review
  ↓
Confirm
  ↓
Persist
```

Rather than:

```text
Capture
  ↓
AI
  ↓
Automatically modify database
```

This keeps AI assistance reversible and prevents model errors from corrupting the user's organization.

---

# License

Add the project's license here.

---

## Project Summary

canoTe is a full-stack AI-assisted document organization system that combines:

```text
Camera Input
+
Multimodal AI
+
Structured Extraction
+
Hierarchical Organization
+
Persistent Storage
+
User Verification
```

The system is designed to make photographed notes machine-readable and easier to organize while maintaining a conventional, auditable backend architecture.

