from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.branch import BranchStatus

class BranchCreate(BaseModel):
    body: str

class BranchStatusUpdate(BaseModel):
    status: BranchStatus
    feedback: Optional[str] = None

# feedback is null at creation time — frontend should conditionally render it
class BranchResponse(BaseModel):
    id: UUID
    body: str
    status: BranchStatus
    feedback: Optional[str]
    chapter_id: UUID
    contributor_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}