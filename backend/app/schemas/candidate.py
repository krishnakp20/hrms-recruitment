from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.candidate import CandidateStatus, CandidateSource
from .user import User

class CandidateBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: str
    gender: Optional[str] = None
    location_state: Optional[str] = None
    location_city: Optional[str] = None
    location_area: Optional[str] = None
    location_pincode: Optional[str] = None
    education_qualification_short: Optional[str] = None
    education_qualification_detailed: Optional[str] = None
    experience_years: Optional[str] = None
    experience_details: Optional[str] = None
    notice_period: Optional[int] = None
    current_compensation: Optional[int] = None
    expected_compensation: Optional[int] = None
    designation: Optional[str] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    job_id: Optional[int] = None
    process: Optional[str] = None
    source: Optional[CandidateSource] = None
    source_details: Optional[str] = None
    hr_initial_screening_answers: Optional[str] = None
    status: CandidateStatus = CandidateStatus.NEW
    reason_of_rejection: Optional[str] = None
    reason_for_kiv_other_roles: Optional[str] = None
    notes: Optional[str] = None
    is_in_pool: bool = False

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    location_state: Optional[str] = None
    location_city: Optional[str] = None
    location_area: Optional[str] = None
    location_pincode: Optional[str] = None
    education_qualification_short: Optional[str] = None
    education_qualification_detailed: Optional[str] = None
    experience_years: Optional[str] = None
    experience_details: Optional[str] = None
    notice_period: Optional[int] = None
    current_compensation: Optional[int] = None
    expected_compensation: Optional[int] = None
    designation: Optional[str] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    job_id: Optional[int] = None
    process: Optional[str] = None
    source: Optional[CandidateSource] = None
    source_details: Optional[str] = None
    hr_initial_screening_answers: Optional[str] = None
    status: Optional[CandidateStatus] = None
    reason_of_rejection: Optional[str] = None
    reason_for_kiv_other_roles: Optional[str] = None
    notes: Optional[str] = None
    is_in_pool: Optional[bool] = None

class Candidate(CandidateBase):
    id: int
    first_name: str
    last_name: Optional[str]
    email: Optional[str]
    experience_years: Optional[str]
    phone: Optional[str] = None
    created_by: Optional[int] = None
    created_by_user: Optional[User] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WhatsAppCommunicationBase(BaseModel):
    candidate_id: int
    phone_number: str
    message_content: Optional[str] = None
    message_type: str = "Initial Contact"
    status: str = "Pending"

class WhatsAppCommunicationCreate(WhatsAppCommunicationBase):
    pass

class WhatsAppCommunicationUpdate(BaseModel):
    phone_number: Optional[str] = None
    message_content: Optional[str] = None
    message_type: Optional[str] = None
    status: Optional[str] = None

class WhatsAppCommunication(WhatsAppCommunicationBase):
    id: int
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 