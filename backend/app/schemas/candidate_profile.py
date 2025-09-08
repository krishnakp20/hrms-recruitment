 # Candidate Profile Field Schemas
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

FieldType = Literal["single_line", "multi_line", "number", "dropdown", "date"]

class CandidateProfileFieldBase(BaseModel):
    field_name: str
    field_type: FieldType   # restricted to allowed types
    is_default: Optional[bool] = False
    is_mandatory: Optional[bool] = False

class CandidateProfileFieldCreate(CandidateProfileFieldBase):
    pass

class CandidateProfileFieldUpdate(CandidateProfileFieldBase):
    pass

class CandidateProfileFieldOut(CandidateProfileFieldBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

