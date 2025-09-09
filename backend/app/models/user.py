from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    HR_SPOC = "HR_SPOC"
    EMPLOYER = "EMPLOYER"
    MANAGER = "MANAGER"
    RECRUITER = "RECRUITER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.EMPLOYER)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_jobs = relationship("Job", foreign_keys="Job.created_by")
    approved_jobs = relationship("Job", foreign_keys="Job.approved_by")
    recruited_jobs = relationship("Job", foreign_keys="Job.recruiter_id")
    created_candidates = relationship("Candidate", foreign_keys="Candidate.created_by") 



 # Settings fields
    # role = Column(Enum(UserRole), default=UserRole.CANDIDATE, nullable=False)
    # is_active = Column(Boolean, default=True)
    # is_superuser = Column(Boolean, default=False)

    # created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime(timezone=True), onupdate=func.now())