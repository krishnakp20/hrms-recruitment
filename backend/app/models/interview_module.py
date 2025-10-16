from sqlalchemy import (
    Column, Integer, String, Text, Enum, ForeignKey, DateTime, Boolean, Float, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base




class InterviewRoundTemplate(Base):
    __tablename__ = "interview_round_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g., "HR Round", "Manager Round", "Head Round"
    description = Column(Text)
    order = Column(Integer, default=1)  # to define sequence
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())



class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    round_id = Column(Integer, ForeignKey("interview_round_templates.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    max_score = Column(Integer, default=5)  # per question max
    weightage = Column(Float, default=1.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    job = relationship("Job", backref="interview_questions")
    round = relationship("InterviewRoundTemplate", backref="questions")



class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    round_id = Column(Integer, ForeignKey("interview_round_templates.id"), nullable=False)
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True))
    conducted_at = Column(DateTime(timezone=True))
    overall_feedback = Column(Text)
    overall_score = Column(Float)
    status = Column(Enum("SCHEDULED", "COMPLETED", "CANCELLED", name="interview_status"), default="SCHEDULED")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("Application", backref="interview_sessions")
    round = relationship("InterviewRoundTemplate")
    interviewer = relationship("User")



class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False)
    score = Column(Float, nullable=True)
    feedback = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    session = relationship("InterviewSession", backref="responses")
    question = relationship("InterviewQuestion")
