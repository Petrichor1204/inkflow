from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.branch import ChapterBranch, BranchStatus, is_valid_transition
from app.models.chapter import Chapter
from app.models.story import Story
from app.models.user import User
from app.schemas.branch import BranchStatusUpdate, BranchResponse
from app.auth import require_lead_author
from typing import List

router = APIRouter(prefix="/review", tags=["Review"])

@router.get("/pending")
def get_pending_branches(db: Session = Depends(get_db), current_user: User = Depends(require_lead_author)):
    stories = db.query(Story).filter(Story.lead_author_id == current_user.id).all()
    story_ids = [s.id for s in stories]

    chapters = db.query(Chapter).filter(Chapter.story_id.in_(story_ids)).all()
    chapter_ids = [c.id for c in chapters]

    branches = db.query(ChapterBranch).filter(
        ChapterBranch.chapter_id.in_(chapter_ids),
        ChapterBranch.status.in_([BranchStatus.SUBMITTED, BranchStatus.UNDER_REVIEW])
    ).all()

    chapter_map = {c.id: c for c in chapters}
    story_map = {s.id: s for s in stories}

    result = []
    for branch in branches:
        chapter = chapter_map[branch.chapter_id]
        story = story_map[chapter.story_id]
        result.append({
            "branch_id": str(branch.id),
            "branch_status": branch.status.value,
            "branch_body": branch.body,
            "branch_updated_at": branch.updated_at,
            "contributor_id": str(branch.contributor_id),
            "chapter_id": str(chapter.id),
            "chapter_title": chapter.title,
            "chapter_body": chapter.body,
            "story_id": str(story.id),
            "story_title": story.title,
            "feedback": branch.feedback
        })

    return result

@router.patch("/{branch_id}")
def review_branch(branch_id: str, update: BranchStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_lead_author)):
    branch = db.query(ChapterBranch).filter(ChapterBranch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    chapter = db.query(Chapter).filter(Chapter.id == branch.chapter_id).first()
    story = db.query(Story).filter(Story.id == chapter.story_id).first()

    if story.lead_author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this story")

    if not is_valid_transition(branch.status, update.status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {branch.status.value} to {update.status.value}"
        )

    branch.status = update.status
    if update.feedback:
        branch.feedback = update.feedback

    db.commit()
    db.refresh(branch)
    return {"status": branch.status.value, "feedback": branch.feedback}