from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, story, chapter, branch
from app.routers import users, stories, chapters, branches, auth, review

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kinyurite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://kinyurite.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stories.router)
app.include_router(chapters.router)
app.include_router(branches.router)
app.include_router(review.router)


@app.get("/")
def root():
    return {"message": "Welcome to Kinyurite"}