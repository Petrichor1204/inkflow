from fastapi import FastAPI
from app.database import engine, Base
from app.models import user, story, chapter, branch
from app.routers import users 

Base.metadata.create_all(bind=engine)

app = FastAPI(title="InkFlow API")

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to InkFlow"}