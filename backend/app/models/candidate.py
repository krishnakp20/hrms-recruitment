from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from sqlalchemy import Enum as SAEnum

class CandidateStatus(str, enum.Enum):
    NEW = "New"
    NOT_REACHABLE = "Not Reachable"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"
    KIV_OTHER_ROLES = "KIV For Other Roles"

class CandidateSource(str, enum.Enum):
    INTERNAL_CAREER_PAGE = "Internal Career Page"
    JOB_PORTAL = "Job Portal"
    SOCIAL_MEDIA = "Social Media"
    CAMPUS_PLACEMENT = "Campus Placement"
    REFERENCE = "Reference"
    WALK_IN = "Walk-in"
    WHATSAPP = "WhatsApp"


class Gender(str, enum.Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"


class EducationShort(str, enum.Enum):
    IXth = "IXth"
    Xth = "Xth"
    XIIth = "XIIth"
    Diploma = "Diploma"
    Graduate = "Graduate"
    Post_Graduate = "Post Graduate"
    Doctorate = "Doctorate"


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=False)
    gender = Column(Enum(Gender), nullable=True)
    location_state = Column(String(255))
    location_city = Column(String(255))
    location_area = Column(String(255))
    location_pincode = Column(String(20))
    education_qualification_short = Column(SAEnum(EducationShort, values_callable=lambda enum: [e.value for e in enum], native_enum=False, validate_strings=True), nullable=True)
    education_qualification_detailed = Column(Text)
    experience_years = Column(String(50))
    experience_details = Column(Text)
    notice_period = Column(Integer)
    current_compensation = Column(Integer)
    expected_compensation = Column(Integer)
    designation = Column(String(255), nullable=True)
    resume_url = Column(String(500))
    cover_letter = Column(Text)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    process = Column(String(255))
    source = Column(SAEnum(CandidateSource, native_enum=False, validate_strings=True), nullable=True)
    source_details = Column(String(255))
    hr_initial_screening_answers = Column(Text)
    f2f_interview_date = Column(Date, nullable=True)
    status = Column(Enum(CandidateStatus), default=CandidateStatus.NEW)
    reason_of_rejection = Column(Text)
    reason_for_kiv_other_roles = Column(Text)
    notes = Column(Text)
    is_in_pool = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_by_user = relationship("User")
    job = relationship("Job")
    applications = relationship("Application", back_populates="candidate")
    whatsapp_communications = relationship("WhatsAppCommunication", back_populates="candidate")
    offer_letter = relationship("OfferLetter", back_populates="candidate")

class WhatsAppCommunication(Base):
    __tablename__ = "whatsapp_communications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    phone_number = Column(String(20), nullable=False)
    message_content = Column(Text)
    message_type = Column(String(50), default="Initial Contact")
    status = Column(String(50), default="Pending")
    sent_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("Candidate", back_populates="whatsapp_communications")



class OfferStatus(enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class OfferLetter(Base):
    __tablename__ = "offer_letters"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    file_path = Column(String, nullable=False)  # PDF path
    status = Column(Enum(OfferStatus), default=OfferStatus.DRAFT)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    signed_at = Column(DateTime(timezone=True),)

    candidate = relationship("Candidate", back_populates="offer_letter")