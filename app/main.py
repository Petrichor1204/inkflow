from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.database import engine, Base
from app.models import user, story, chapter, branch
from app.routers import users, stories, chapters, branches, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="InkFlow API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stories.router)
app.include_router(chapters.router)
app.include_router(branches.router)


@app.get("/")
def root():
    return {"message": "Welcome to InkFlow"}