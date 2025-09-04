from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class CandidateStatus(str, enum.Enum):
    NEW = "New"
    SHORTLISTED = "Shortlisted"
    INTERVIEWED = "Interviewed"
    REJECTED = "Rejected"
    HIRED = "Hired"
    POOL = "Pool"

class CandidateSource(str, enum.Enum):
    INTERNAL_CAREER_PAGE = "Internal Career Page"
    JOB_PORTAL = "Job Portal"
    SOCIAL_MEDIA = "Social Media"
    CAMPUS_PLACEMENT = "Campus Placement"
    REFERENCE = "Reference"
    WALK_IN = "Walk-in"
    WHATSAPP = "WhatsApp"
    MANUAL_ENTRY = "Manual Entry"

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    location_state = Column(String(255))
    location_city = Column(String(255))
    location_area = Column(String(255))
    location_pincode = Column(String(20))
    education_qualification_short = Column(String(255))
    education_qualification_detailed = Column(Text)
    experience_years = Column(Integer)
    experience_details = Column(Text)
    notice_period = Column(Integer)
    current_compensation = Column(Integer)
    expected_compensation = Column(Integer)
    resume_url = Column(String(500))
    cover_letter = Column(Text)
    source = Column(Enum(CandidateSource), default=CandidateSource.MANUAL_ENTRY)
    source_details = Column(String(255))
    status = Column(Enum(CandidateStatus), default=CandidateStatus.NEW)
    notes = Column(Text)
    is_in_pool = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_by_user = relationship("User")
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