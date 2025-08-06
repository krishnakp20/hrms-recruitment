from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.application import ApplicationStatus

class ApplicationBase(BaseModel):
    candidate_id: int
    job_id: int
    status: ApplicationStatus = ApplicationStatus.APPLIED
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    notes: Optional[str] = None
    recruiter_notes: Optional[str] = None
    interview_scheduled_at: Optional[datetime] = None
    interview_conducted_at: Optional[datetime] = None
    interview_feedback: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    notes: Optional[str] = None
    recruiter_notes: Optional[str] = None
    interview_scheduled_at: Optional[datetime] = None
    interview_conducted_at: Optional[datetime] = None
    interview_feedback: Optional[str] = None

class Application(ApplicationBase):
    id: int
    applied_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 