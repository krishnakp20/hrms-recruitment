from typing import List, Optional
from datetime import datetime
from fastapi import status
from pydantic import BaseModel
from app.models.interview import RoundType

# -----------------------
# Pydantic schemas
# -----------------------
class QuestionBase(BaseModel):
    id: int
    job_id: int
    text: str
    competency: Optional[str]
    expected_points: Optional[List[str]] = []
    weight: Optional[float]

class QuestionInstanceOut(BaseModel):
    id: int
    job_id: int
    question_id: str
    candidate_answer: str
    answer_text: Optional[str] = None
    score_1_5: Optional[int] = None
    rationale: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

class InterviewRoundOut(BaseModel):
    id: int
    round_type: str
    result_pct: Optional[float] = None
    question_instances: List[QuestionInstanceOut] = []

    class Config:
        orm_mode = True

class InterviewOut(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    status: str
    final_pct: Optional[float] = None
    rounds: List[InterviewRoundOut] = []

    class Config:
        orm_mode = True

class StartInterviewReq(BaseModel):
    candidate_id: int
    job_id: int
    template_name: Optional[str] = None

class AnswerReq(BaseModel):
    question_instance_id: int
    answer_text: str


class AnswerSchema(BaseModel):
    question_id: int
    score: float
    remarks: Optional[str] = None

class SubmitRoundSchema(BaseModel):
    round_type: str
    answers: List[AnswerSchema]


class RoundStartRequest(BaseModel):
    round_type: RoundType


class QuestionCreate(BaseModel):
    round_type: RoundType
    text: str
    competency: Optional[str] = None
    expected_points: List[str] = []
    weight: float = 1.0

class QuestionResponse(QuestionCreate):
    id: int
    class Config:
        orm_mode = True