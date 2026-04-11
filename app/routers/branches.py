from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.branch import ChapterBranch, BranchStatus, is_valid_transition
from app.models.chapter import Chapter
from app.models.story import Story
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchStatusUpdate, BranchResponse
from app.auth import require_contributor, require_lead_author, get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/chapters/{chapter_id}/branches", tags=["Branches"])

# MVP: only contributors can create branches
# future consideration: allow lead authors to branch their own chapters
# for drafting alternate story directions before review
@router.post("/", response_model=BranchResponse, status_code=201)
def create_branch(chapter_id: uuid.UUID, branch: BranchCreate, db: Session = Depends(get_db), current_user: User = Depends(require_contributor)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    new_branch = ChapterBranch(
        id=uuid.uuid4(),
        body=branch.body,
        status=BranchStatus.DRAFT,
        chapter_id=chapter_id,
        contributor_id=current_user.id
    )
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch

@router.get("/", response_model=List[BranchResponse])
def get_branches(chapter_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(require_lead_author)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter.branches

@router.patch("/{branch_id}/status", response_model=BranchResponse)
def update_branch_status(chapter_id: uuid.UUID, branch_id: uuid.UUID, update: BranchStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    branch = db.query(ChapterBranch).filter(
        ChapterBranch.id == branch_id,
        ChapterBranch.chapter_id == chapter_id
    ).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    if not is_valid_transition(branch.status, update.status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {branch.status.value} to {update.status.value}"
        )

    # contributor can only submit their own branch
    if update.status == BranchStatus.SUBMITTED:
        if current_user.role != "contributor":
            raise HTTPException(status_code=403, detail="Only contributors can submit a branch")
        if branch.contributor_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only submit your own branch")

    # everything after submitted requires lead author
    elif update.status in [BranchStatus.UNDER_REVIEW, BranchStatus.MERGED, BranchStatus.REJECTED]:
        if current_user.role != "lead_author":
            raise HTTPException(status_code=403, detail="Only lead authors can perform this action")
        story = db.query(Story).filter(Story.id == chapter.story_id).first()
        if story.lead_author_id != current_user.id:
            raise HTTPException(status_code=403, detail="You don't own this story")

    branch.status = update.status
    if update.feedback:
        branch.feedback = update.feedback

    db.commit()
    db.refresh(branch)
    return branch

@router.get("/review/pending", tags=["Branches"])
def get_pending_branches(db: Session = Depends(get_db), current_user: User = Depends(require_lead_author)):
    stories = db.query(Story).filter(Story.lead_author_id == current_user.id).all()
    story_ids = [s.id for s in stories]
    
    chapters = db.query(Chapter).filter(Chapter.story_id.in_(story_ids)).all()
    chapter_ids = [c.id for c in chapters]
    
    branches = db.query(ChapterBranch).filter(
        ChapterBranch.chapter_id.in_(chapter_ids),
        ChapterBranch.status.in_([BranchStatus.SUBMITTED, BranchStatus.UNDER_REVIEW])
    ).all()

    result = []
    chapter_map = {c.id: c for c in chapters}
    story_map = {s.id: s for s in stories}

    for branch in branches:
        chapter = chapter_map[branch.chapter_id]
        story = story_map[chapter.story_id]
        result.append({
            "branch_id": branch.id,
            "branch_status": branch.status.value,
            "branch_body": branch.body,
            "branch_created_at": branch.created_at,
            "branch_updated_at": branch.updated_at,
            "contributor_id": branch.contributor_id,
            "chapter_id": chapter.id,
            "chapter_title": chapter.title,
            "chapter_body": chapter.body,
            "story_id": story.id,
            "story_title": story.title,
            "feedback": branch.feedback
        })

    return result