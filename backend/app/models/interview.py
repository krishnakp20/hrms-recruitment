from sqlalchemy import (
    Column, Integer, String, Text, Enum, ForeignKey, DateTime, Boolean, Float, func
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from app.core.database import Base
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.mysql import JSON


# ----- ENUMS -----
class RoundType(str, enum.Enum):
    HR = "HR"
    Manager = "Manager"
    Executive = "Executive"  # COO / CEO

# ----- MODELS -----
class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    scheduled_at = Column(DateTime, server_default=func.now())
    status = Column(String(50), default="Scheduled")
    final_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    rounds = relationship("InterviewRound", back_populates="interview")
    candidate = relationship("Candidate", backref="interviews")
    job = relationship("Job", backref="interviews")


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    round_type = Column(Enum(RoundType), nullable=False)
    interviewer_id = Column(Integer, ForeignKey("users.id"))  # HR, Manager, etc.
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)
    result_pct = Column(Float, default=0.0)  # % score for this round

    interview = relationship("Interview", back_populates="rounds")
    questions = relationship("QuestionInstance", back_populates="round")
    answers = relationship("InterviewAnswer", back_populates="round")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    round_type = Column(Enum(RoundType), nullable=False)
    text = Column(Text, nullable=False)
    competency = Column(String(255), nullable=True)
    expected_points = Column(JSON, default=[])
    weight = Column(Float, default=1.0)  # importance weight

    # Example: HR question, Manager technical Qs etc.

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"
    id = Column(Integer, primary_key=True, index=True)
    round_id = Column(Integer, ForeignKey("interview_rounds.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id"), nullable=False)
    score = Column(Float, default=0.0)   # % score for this question
    remarks = Column(Text)
    round = relationship("InterviewRound", back_populates="answers")


class QuestionInstance(Base):
    """
    Stores the actual asked Q + candidate’s answer in that interview round
    """
    __tablename__ = "question_instances"

    id = Column(Integer, primary_key=True, index=True)
    round_id = Column(Integer, ForeignKey("interview_rounds.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    asked_text = Column(Text, nullable=False)  # snapshot of Q asked
    answer_text = Column(Text, nullable=True)
    score_1_5 = Column(Integer, nullable=True)  # discrete score (1–5)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    is_correct = Column(Boolean, default=False)

    round = relationship("InterviewRound", back_populates="questions")
    question = relationship("Question")
