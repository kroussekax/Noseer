# canoTe — Setup & Usage

## Project Structure

```
noseer/
├── canoTe/                 # Frontend (Vite + Vanilla JS + Tailwind)
│   ├── src/
│   │   ├── api/            # API clients (auth, notebooks, chapters, pages, uploads, ai)
│   │   ├── components/     # Shared UI (Header, NavBar, SearchOverlay)
│   │   ├── pages/          # Views (Login, Notes, Notebook, Chapter, Camera, Gallery, Settings)
│   │   ├── utils/          # Camera, preferences, router
│   │   └── styles/         # Tailwind CSS
│   ├── nginx.conf          # Production reverse proxy config
│   └── Dockerfile
├── canoTe-api/             # Backend (FastAPI + SQLAlchemy + PostgreSQL)
│   ├── app/
│   │   ├── routers/        # Endpoints (auth, notebooks, chapters, pages, uploads, ai)
│   │   ├── services/       # AI service abstraction (OpenRouter)
│   │   ├── models.py       # SQLAlchemy ORM (User → Notebook → Chapter → Page → Upload)
│   │   ├── schemas.py      # Pydantic request/response models
│   │   ├── auth.py         # Bcrypt hashing + signed session cookies
│   │   ├── storage.py      # File validation & disk storage
│   │   └── config.py       # Environment-driven settings
│   ├── alembic/            # Database migrations
│   ├── tests/              # Pytest test suite
│   └── Dockerfile
├── docker-compose.yml      # Full stack orchestration
└── .env.example            # Environment template
```

---

## 1. Initial Setup

### Clone and configure

```bash
git clone <repo-url> noseer
cd noseer
cp .env.example .env
```

---

## 2. Server Setup (local, no Docker)

### 2.1 Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib python3-venv
```

Check:

```bash
sudo systemctl status postgresql
```

It should say `active (running)`.

### 2.2 Create the database

Enter PostgreSQL:

```bash
sudo -u postgres psql
```

Run:

```sql
CREATE USER tactile WITH PASSWORD 'your-password-here';
CREATE DATABASE tactile OWNER tactile;
\q
```

Test it:

```bash
psql "postgresql://tactile:your-password-here@localhost/tactile"
```

If you get a `tactile=>` prompt, it works. Exit with `\q`.

### 2.3 Set up Python

```bash
cd ~/noseer/canoTe-api

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

You should now see `(venv)` in your terminal.

### 2.4 Configure .env

```bash
cp .env.example .env
nano .env
```

Put:

```env
DATABASE_URL=postgresql+psycopg2://tactile:your-password-here@localhost/tactile
SECRET_KEY=YOUR_RANDOM_SECRET
ALLOWED_ORIGINS=http://localhost:5173
SECURE_COOKIES=false
UPLOAD_DIR=./uploads
OPENROUTER_API_KEY=sk-or-your-key-here
GEMINI_MODEL=google/gemini-2.0-flash-exp
```

Generate the secret:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
```

Copy that into `SECRET_KEY`.

Also:

```bash
mkdir -p uploads
```

### 2.5 Run the database migrations

With `(venv)` active:

```bash
alembic upgrade head
```

If successful, your tables should now exist.

Check:

```bash
sudo -u postgres psql tactile -c '\dt'
```

### 2.6 Start FastAPI

For testing:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then from another machine, if you're accessing through Tailscale:

```
http://SERVER-TAILSCALE-IP:8000/api/health
```

or:

```
http://SERVER-TAILSCALE-HOSTNAME:8000/api/health
```

You should get:

```json
{"status":"ok"}
```

---

## 3. Frontend Setup

```bash
cd ~/noseer/canoTe

npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` and proxies `/api` and `/uploads` to `localhost:8000`.

---

## 4. HTTPS via Tailscale (for camera access)

The camera requires a **secure context** (`window.isSecureContext`). Plain HTTP on a LAN IP won't work. Use Tailscale with MagicDNS:

### One-time setup

```bash
# Install Tailscale on both server and phone
# Then enable HTTPS certificates:
tailscale cert <your-machine>.<your-tailnet>.ts.net
```

### Run the stack behind a reverse proxy

Use Caddy or Nginx to terminate HTTPS and forward to the containers:

**Caddyfile example:**

```
your-machine.your-tailnet.ts.net {
    reverse_proxy localhost:3001
}
```

```bash
caddy run
```

Now open `https://your-machine.your-tailnet.ts.net` on your phone — the camera will work.

When using HTTPS, set in `.env`:

```env
SECURE_COOKIES=true
```

---

## 5. Using the App

### Core workflow

1. **Register / Login** — create an account or sign in
2. **Create a notebook** — e.g., "Physics"
3. **Create a chapter** — e.g., "Kinematics"
4. **Open the camera** — tap the camera icon in the bottom nav
5. **Take a photo** of your handwritten/printed notes
6. **Tap "Analyze with AI"** — the image is sent to OpenRouter
7. **Review the AI result:**
   - Suggested notebook & chapter
   - Extracted text
   - Detected visual elements (diagrams, equations, etc.)
   - Confidence score
8. **Edit anything** — change notebook, chapter, title, or content
9. **Confirm & Save** — the page is created in your notebook
10. **Reload-safe** — the full hierarchy persists in PostgreSQL

### Notes hierarchy

```
User
└── Notebook
    └── Chapter
        └── Page
            └── Upload (image attachments)
```

### AI behavior

- AI **recommends** a notebook/chapter — it never creates anything without your confirmation
- You can always override the AI's suggestion
- The original photo is always preserved as an upload attachment
- AI processing requires a valid `OPENROUTER_API_KEY` on the server

---

## 6. Running Tests

```bash
cd canoTe-api
source venv/bin/activate
python -m pytest tests/ -v
```

---

## 7. Stopping

```bash
# Dev mode: Ctrl+C in each terminal
```
