from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.story import Story
from app.models.user import User
from app.schemas.story import StoryCreate, StoryResponse
from app.auth import require_lead_author
from typing import List
import uuid

router = APIRouter(prefix="/stories", tags=["Stories"])

@router.post("/", response_model=StoryResponse, status_code=201)
def create_story(story: StoryCreate, db: Session = Depends(get_db), current_user: User = Depends(require_lead_author)):
    new_story = Story(
        id=uuid.uuid4(),
        title=story.title,
        description=story.description,
        genre=story.genre,
        lead_author_id=current_user.id
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
    return new_story

@router.get("/", response_model=List[StoryResponse])
def get_stories(db: Session = Depends(get_db)):
    stories = db.query(Story).all()
    return stories

@router.get("/{story_id}", response_model=StoryResponse)
def get_story(story_id: uuid.UUID, db: Session = Depends(get_db)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

@router.delete("/{story_id}", status_code=204)
def delete_story(story_id: uuid.UUID, db: Session = Depends(get_db),  current_user: User = Depends(require_lead_author)):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(story)
    db.commit()
    return None