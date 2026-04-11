# Kinyurite

A collaborative storytelling platform where lead authors create stories and chapters, and contributors propose alternative versions (branches) for review and merging.

## Tech Stack

**Backend:** Python · FastAPI · PostgreSQL · SQLAlchemy · JWT auth  
**Frontend:** React 19 · React Router v7 · Axios · Vite

## Features

- Role-based access: `lead_author` and `contributor` roles
- Lead authors create and manage stories and chapters
- Contributors submit alternative chapter branches for review
- Branch workflow: `DRAFT → SUBMITTED → UNDER_REVIEW → MERGED / REJECTED`

## Project Structure

```
inkflow/
├── app/
│   ├── main.py          # FastAPI app entry point
│   ├── auth.py          # JWT + bcrypt auth
│   ├── database.py      # SQLAlchemy setup
│   ├── models/          # ORM models (user, story, chapter, branch)
│   ├── routers/         # Route handlers (auth, users, stories, chapters, branches)
│   └── schemas/         # Pydantic request/response schemas
├── frontend/
│   └── src/
│       ├── pages/       # Login, Register, Stories, StoryDetail
│       ├── components/  # Navbar
│       └── api/         # Axios client with JWT interceptor
├── requirements.txt
└── .env
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<user>@localhost:5432/kinyurite
SECRET_KEY=<your-secret-key>
```

### Backend

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register (role: `lead_author` or `contributor`) |
| POST | `/auth/login` | Login — returns JWT access token |
| GET | `/auth/me` | Get current user profile |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stories/` | List all stories |
| POST | `/stories/` | Create story *(lead_author only)* |
| GET | `/stories/{id}` | Get story details |
| DELETE | `/stories/{id}` | Delete story *(lead_author only)* |

### Chapters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stories/{id}/chapters/` | List chapters |
| POST | `/stories/{id}/chapters/` | Create chapter *(lead_author only)* |
| GET | `/stories/{id}/chapters/{chapterId}` | Get chapter |
| PATCH | `/stories/{id}/chapters/{chapterId}` | Update chapter *(lead_author only)* |

### Branches

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chapters/{id}/branches/` | Submit a branch *(contributor only)* |
| GET | `/chapters/{id}/branches/` | List branches *(lead_author only)* |
| PATCH | `/chapters/{id}/branches/{branchId}/status` | Update branch status |
