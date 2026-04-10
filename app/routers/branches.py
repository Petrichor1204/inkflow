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