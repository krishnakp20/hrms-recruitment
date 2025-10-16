from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, Date, ForeignKey, Float, func
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.interview import RoundType
from sqlalchemy.dialects.mysql import JSON


class JobStatus(str, enum.Enum):
    DRAFT = "Draft"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    ACTIVE = "Active"
    CLOSED = "Closed"
    ARCHIVED = "Archived"

class JobType(str, enum.Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    MANAGEMENT_TRAINEE = "Management Trainee"
    INTERNSHIP = "Internship"

class LocationType(str, enum.Enum):
    ONSITE = "onsite"
    REMOTE = "remote"
    HYBRID = "hybrid"

class Branch(enum.Enum):
    TRAPEZOID_NOIDA = "Trapezoid Noida"
    OKAYA_NOIDA = "Okaya Noida"
    NEELKANTH_AHMEDABAD = "Neelkanth Ahmedabad"
    JALDARSHAN_AHMEDABAD = "Jaldarshan Ahmedabad"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    position_title = Column(String(255), nullable=False)
    position_code = Column(String(100), unique=True, nullable=False)
    level = Column(String(100))
    grade = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"))
    sub_department = Column(String(255))
    branch = Column(Enum(Branch), nullable=True)
    process = Column(Text)
    reporting_to_title = Column(String(255))
    reporting_to_manager = Column(String(255))
    location_type = Column(Enum(LocationType), default=LocationType.ONSITE)
    location_details = Column(String(255))
    required_skills = Column(Text)
    experience_level = Column(String(255))
    job_description = Column(Text)
    job_specification = Column(Text)
    number_of_vacancies = Column(Integer, default=1)
    compensation_min = Column(Integer)
    compensation_max = Column(Integer)
    employment_type = Column(Enum(JobType), nullable=False)
    hiring_deadline = Column(Date)
    approval_authority = Column(String(255))
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    workflow_template_id = Column(Integer, ForeignKey("recruitment_workflows.id"))
    recruitment_agency_id = Column(Integer, ForeignKey("recruitment_agencies.id"))
    status = Column(Enum(JobStatus), default=JobStatus.DRAFT)
    is_remote = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    department = relationship("Department", back_populates="jobs")
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    workflow_template = relationship("RecruitmentWorkflow")
    recruitment_agency = relationship("RecruitmentAgency")
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    applications = relationship("Application", back_populates="job")
    posting_channels = relationship("JobPostingChannel", back_populates="job")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sub_department = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    jobs = relationship("Job", back_populates="department")

class RecruitmentWorkflow(Base):
    __tablename__ = "recruitment_workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    steps = Column(Text)  # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RecruitmentAgency(Base):
    __tablename__ = "recruitment_agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    website = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class JobPostingChannel(Base):
    __tablename__ = "job_posting_channels"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    channel_type = Column(String(255), nullable=False)
    channel_name = Column(String(255))
    posting_url = Column(String(500))
    posted_at = Column(DateTime(timezone=True))
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="posting_channels")



class QuestionBank(Base):
    __tablename__ = "question_bank"
    id = Column(Integer, primary_key=True)
    round_type = Column(Enum(RoundType), nullable=False)   # HR | Manager | Executive
    text = Column(Text, nullable=False)
    competency = Column(String(255))
    expected_points = Column(JSON, default=[])
    default_weight = Column(Float, default=1.0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JobQuestion(Base):
    __tablename__ = "job_questions"
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    bank_question_id = Column(Integer, ForeignKey("question_bank.id"), nullable=False)
    weight = Column(Float, nullable=False, default=1.0)    # override allowed
    display_order = Column(Integer, default=0)

    job = relationship("Job", backref="job_questions")
    bank_question = relationship("QuestionBank")