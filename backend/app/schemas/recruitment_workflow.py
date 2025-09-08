
# schemas/recruitment_workflow.py
from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import json

class RecruitmentWorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[dict]  
    is_active: Optional[bool] = True

    # convert DB string → list
    @field_validator("steps", mode="before")
    @classmethod
    def steps_json_to_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

class RecruitmentWorkflowCreate(RecruitmentWorkflowBase):
    pass

class RecruitmentWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[dict]] = None
    is_active: Optional[bool] = None

class RecruitmentWorkflowOut(RecruitmentWorkflowBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
