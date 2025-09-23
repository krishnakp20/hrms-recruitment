from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.models.job import JobStatus, JobType, LocationType
from app.models.interview import RoundType
from .user import User


class DepartmentBase(BaseModel):
    name: str
    sub_department: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    sub_department: Optional[str] = None

class Department(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    position_title: str
    position_code: str
    level: Optional[str] = None
    grade: Optional[str] = None
    department_id: Optional[int] = None
    sub_department: Optional[str] = None
    branch: Optional[str] = None
    process: Optional[str] = None
    reporting_to_title: Optional[str] = None
    reporting_to_manager: Optional[str] = None
    location_type: LocationType = LocationType.ONSITE
    location_details: Optional[str] = None
    required_skills: Optional[str] = None
    experience_level: Optional[str] = None
    job_description: Optional[str] = None
    job_specification: Optional[str] = None
    number_of_vacancies: int = 1
    compensation_min: Optional[int] = None
    compensation_max: Optional[int] = None
    employment_type: JobType
    hiring_deadline: Optional[date] = None
    approval_authority: Optional[str] = None
    recruiter_id: Optional[int] = None
    workflow_template_id: Optional[int] = None
    recruitment_agency_id: Optional[int] = None
    status: JobStatus = JobStatus.DRAFT
    is_remote: bool = False
    is_published: bool = False

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    position_title: Optional[str] = None
    position_code: Optional[str] = None
    level: Optional[str] = None
    grade: Optional[str] = None
    department_id: Optional[int] = None
    sub_department: Optional[str] = None
    branch: Optional[str] = None
    process: Optional[str] = None
    reporting_to_title: Optional[str] = None
    reporting_to_manager: Optional[str] = None
    location_type: Optional[LocationType] = None
    location_details: Optional[str] = None
    required_skills: Optional[str] = None
    experience_level: Optional[str] = None
    job_description: Optional[str] = None
    job_specification: Optional[str] = None
    number_of_vacancies: Optional[int] = None
    compensation_min: Optional[int] = None
    compensation_max: Optional[int] = None
    employment_type: Optional[JobType] = None
    hiring_deadline: Optional[date] = None
    approval_authority: Optional[str] = None
    recruiter_id: Optional[int] = None
    workflow_template_id: Optional[int] = None
    recruitment_agency_id: Optional[int] = None
    status: Optional[JobStatus] = None
    is_remote: Optional[bool] = None

class Job(JobBase):
    id: int
    position_title: str
    position_code: str
    pool_candidate_count: int = 0
    department: Optional[Department] = None
    employment_type: Optional[str] = None
    created_by_user: Optional[User] = None
    created_by: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



class RecruitmentWorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    steps: Optional[str] = None
    is_active: bool = True

class RecruitmentWorkflowCreate(RecruitmentWorkflowBase):
    pass

class RecruitmentWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[str] = None
    is_active: Optional[bool] = None

class RecruitmentWorkflow(RecruitmentWorkflowBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecruitmentAgencyBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    is_active: bool = True

class RecruitmentAgencyCreate(RecruitmentAgencyBase):
    pass

class RecruitmentAgencyUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None

class RecruitmentAgency(RecruitmentAgencyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobPostingChannelBase(BaseModel):
    job_id: int
    channel_type: str
    channel_name: Optional[str] = None
    posting_url: Optional[str] = None
    status: str = "Pending"

class JobPostingChannelCreate(JobPostingChannelBase):
    pass

class JobPostingChannelUpdate(BaseModel):
    channel_type: Optional[str] = None
    channel_name: Optional[str] = None
    posting_url: Optional[str] = None
    status: Optional[str] = None

class JobPostingChannel(JobPostingChannelBase):
    id: int
    posted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



class QuestionBankCreate(BaseModel):
    round_type: RoundType
    text: str
    competency: str | None = None
    expected_points: list[str] = []
    default_weight: float = 1.0

class QuestionBankRead(QuestionBankCreate):
    id: int
    active: bool
    class Config:
        orm_mode = True

class JobQuestionAttachItem(BaseModel):
    bank_question_id: int
    weight: float | None = None

class JobQuestionRead(BaseModel):
    id: int  # job_question id
    bank_question_id: int
    round_type: RoundType
    text: str
    competency: str | None
    expected_points: list[str]
    weight: float
    display_order: int
    class Config:
        orm_mode = True