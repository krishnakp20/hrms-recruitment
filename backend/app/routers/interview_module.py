from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.interview_module import InterviewRoundTemplate, InterviewQuestion, InterviewSession, InterviewResponse
from app.models.job import Job
from app.models.application import Application
from app.models.candidate import Candidate
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()
# -----------------------
# Pydantic Schemas
# -----------------------



class JobResponse(BaseModel):
    id: int
    position_title: str
    position_code: str

    class Config:
        orm_mode = True


class InterviewRoundResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    order: int

    class Config:
        orm_mode = True


class InterviewQuestionCreateSingle(BaseModel):
    question_text: str
    max_score: int = 5
    weightage: float = 1.0


class InterviewQuestionCreateBulk(BaseModel):
    job_id: int
    round_id: int
    questions: List[InterviewQuestionCreateSingle]


class InterviewQuestionUpdate(BaseModel):
    question_text: str = None
    max_score: int = None
    weightage: float = None


class InterviewQuestionResponse(BaseModel):
    id: int
    job_id: int
    round_id: int
    question_text: str
    max_score: int
    weightage: float
    round: InterviewRoundResponse

    class Config:
        orm_mode = True





# -----------------------
# CRUD Endpoints
# -----------------------

@router.get("/jobs/", response_model=List[JobResponse])
def get_interview_jobs(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    jobs = db.query(Job).all()
    return jobs


@router.get("/interview-rounds/", response_model=List[InterviewRoundResponse])
def get_interview_rounds(db: Session = Depends(get_db)):
    rounds = db.query(InterviewRoundTemplate).order_by(InterviewRoundTemplate.order).all()
    return rounds


# Get all questions
@router.get("/interview-questions/", response_model=List[InterviewQuestionResponse])
def get_all_questions(db: Session = Depends(get_db)):
    questions = db.query(InterviewQuestion).order_by(InterviewQuestion.id.desc()).all()
    return questions


# Get question by ID
@router.get("/interview-questions/{question_id}", response_model=InterviewQuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")
    return question


# Create new question
@router.post("/interview-questions/bulk-create", response_model=List[InterviewQuestionResponse])
def create_questions_bulk(payload: InterviewQuestionCreateBulk, db: Session = Depends(get_db)):
    if not payload.questions:
        raise HTTPException(status_code=400, detail="No questions provided")

    new_questions = []
    for q in payload.questions:
        question = InterviewQuestion(
            job_id=payload.job_id,
            round_id=payload.round_id,
            question_text=q.question_text,
            max_score=q.max_score,
            weightage=q.weightage,
            created_at=func.now(),
            updated_at=func.now()
        )
        db.add(question)
        new_questions.append(question)

    db.commit()
    for question in new_questions:
        db.refresh(question)

    return new_questions


# Update question
@router.put("/interview-questions/{question_id}", response_model=InterviewQuestionResponse)
def update_question(question_id: int, question_update: InterviewQuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    if question_update.question_text is not None:
        question.question_text = question_update.question_text
    if question_update.max_score is not None:
        question.max_score = question_update.max_score
    if question_update.weightage is not None:
        question.weightage = question_update.weightage

    question.updated_at = func.now()
    db.commit()
    db.refresh(question)
    return question


# Delete question
@router.delete("/interview-questions/{question_id}", response_model=dict)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    db.delete(question)
    db.commit()
    return {"message": "Interview question deleted successfully"}



@router.get("/interview-questions/job/{job_id}/round/{round_id}", response_model=List[InterviewQuestionResponse])
def get_questions_by_job_and_round(job_id: int, round_id: int, db: Session = Depends(get_db)):
    questions = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.job_id == job_id,
            InterviewQuestion.round_id == round_id
        )
        .all()
    )
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this job and round")
    return questions



# ---------- INTERVIEW RESPONSE ----------
class InterviewResponseBase(BaseModel):
    question_id: int
    score: Optional[float] = None
    feedback: Optional[str] = None

class InterviewResponseCreate(InterviewResponseBase):
    pass

class InterviewResponseOut(InterviewResponseBase):
    id: int

    model_config = {
        "from_attributes": True
    }


# ---------- INTERVIEW SESSION ----------
class InterviewSessionBase(BaseModel):
    application_id: int
    round_id: int
    interviewer_id: int
    scheduled_at: Optional[datetime] = None
    conducted_at: Optional[datetime] = None
    overall_feedback: Optional[str] = None
    overall_score: Optional[float] = None

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSessionOut(InterviewSessionBase):
    id: int
    status: str
    responses: List[InterviewResponseOut] = []
    job_id: int

    model_config = {
        "from_attributes": True
    }


# ---------- CONDUCT INTERVIEW (BULK RESPONSE) ----------
class ConductInterviewRequest(BaseModel):
    session_id: int
    responses: List[InterviewResponseCreate]
    overall_feedback: Optional[str] = None
    overall_score: Optional[float] = None


class StartInterviewSessionRequest(BaseModel):
    application_id: int
    round_id: int
    interviewer_id: int


@router.post("/interview-sessions/start", response_model=InterviewSessionOut)
def start_interview_session(payload: StartInterviewSessionRequest, db: Session = Depends(get_db)):
    # Check if session already exists
    existing = db.query(InterviewSession).filter(
        InterviewSession.application_id == payload.application_id,
        InterviewSession.round_id == payload.round_id
    ).first()

    if existing:
        # Attach job_id and fetch responses
        application = db.query(Application).filter_by(id=existing.application_id).first()
        session_responses = db.query(InterviewResponse).filter_by(session_id=existing.id).all()
        return InterviewSessionOut(
            id=existing.id,
            application_id=existing.application_id,
            round_id=existing.round_id,
            interviewer_id=existing.interviewer_id,
            scheduled_at=existing.scheduled_at,
            conducted_at=existing.conducted_at,
            overall_feedback=existing.overall_feedback,
            overall_score=existing.overall_score,
            status=existing.status,
            job_id=application.job_id,
            responses=[InterviewResponseOut.from_orm(r) for r in session_responses]
        )

    # Create new session
    session = InterviewSession(
        application_id=payload.application_id,
        round_id=payload.round_id,
        interviewer_id=payload.interviewer_id,
        status="SCHEDULED"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Fetch application to attach job_id
    application = db.query(Application).filter_by(id=session.application_id).first()

    return InterviewSessionOut(
        id=session.id,
        application_id=session.application_id,
        round_id=session.round_id,
        interviewer_id=session.interviewer_id,
        scheduled_at=session.scheduled_at,
        conducted_at=session.conducted_at,
        overall_feedback=session.overall_feedback,
        overall_score=session.overall_score,
        status=session.status,
        job_id=application.job_id,
        responses=[]  # no responses yet
    )



@router.get("/interview-rounds/job/{job_id}")
def get_rounds_by_job(job_id: int, db: Session = Depends(get_db)):
    rounds = db.query(InterviewRoundTemplate) \
        .join(InterviewQuestion) \
        .filter(InterviewQuestion.job_id == job_id) \
        .order_by(InterviewRoundTemplate.order) \
        .distinct() \
        .all()

    if not rounds:
        raise HTTPException(status_code=404, detail="No interview rounds found for this job")

    return rounds


# ---------- CREATE SESSION ----------
@router.post("/interview-sessions", response_model=InterviewSessionOut)
def create_interview_session(
    session_data: InterviewSessionCreate,
    db: Session = Depends(get_db)
):
    session = InterviewSession(**session_data.dict())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


# ---------- GET ALL SESSIONS ----------
@router.get("/interview-sessions", response_model=list[InterviewSessionOut])
def list_interview_sessions(db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).all()
    return sessions


# ---------- CONDUCT INTERVIEW ----------
@router.post("/interview-sessions/conduct", response_model=InterviewSessionOut)
def conduct_interview(
    data: ConductInterviewRequest,
    db: Session = Depends(get_db)
):
    # Fetch the session
    session = db.query(InterviewSession).filter_by(id=data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # Save all responses
    for r in data.responses:
        response = InterviewResponse(
            session_id=session.id,
            question_id=r.question_id,
            score=r.score,
            feedback=r.feedback
        )
        db.add(response)

    # Update session details
    session.overall_feedback = data.overall_feedback
    session.overall_score = data.overall_score
    session.conducted_at = datetime.utcnow()
    session.status = "COMPLETED"

    db.commit()
    db.refresh(session)

    # Get application to attach job_id
    application = db.query(Application).filter_by(id=session.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    job_id = application.job_id

    # Count total rounds for this job
    total_rounds = (
        db.query(InterviewRoundTemplate)
        .join(InterviewQuestion, InterviewQuestion.round_id == InterviewRoundTemplate.id)
        .filter(InterviewQuestion.job_id == job_id)
        .distinct()
        .count()
    )

    # Count completed sessions for this application
    completed_sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.application_id == session.application_id,
            InterviewSession.status == "COMPLETED"
        )
        .count()
    )

    # Shortlist candidate if all rounds completed
    if total_rounds > 0 and completed_sessions == total_rounds:
        candidate = db.query(Candidate).filter_by(id=application.candidate_id).first()
        if candidate:
            candidate.status = "SHORTLISTED"
        db.commit()

    # Fetch all responses to return in the Pydantic model
    session_responses = db.query(InterviewResponse).filter_by(session_id=session.id).all()

    # Return properly using Pydantic model
    return InterviewSessionOut(
        id=session.id,
        application_id=session.application_id,
        round_id=session.round_id,
        interviewer_id=session.interviewer_id,
        scheduled_at=session.scheduled_at,
        conducted_at=session.conducted_at,
        overall_feedback=session.overall_feedback,
        overall_score=session.overall_score,
        status=session.status,
        responses=session_responses,
        job_id=job_id
    )


# ---------- GET SESSION DETAILS ----------
@router.get("/interview-sessions/{session_id}", response_model=InterviewSessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Attach job_id from application
    application = db.query(Application).filter_by(id=session.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    session.job_id = application.job_id

    # Get responses for Pydantic model
    session_responses = db.query(InterviewResponse).filter_by(session_id=session.id).all()

    return InterviewSessionOut(
        id=session.id,
        application_id=session.application_id,
        round_id=session.round_id,
        interviewer_id=session.interviewer_id,
        scheduled_at=session.scheduled_at,
        conducted_at=session.conducted_at,
        overall_feedback=session.overall_feedback,
        overall_score=session.overall_score,
        status=session.status,
        responses=session_responses,
        job_id=session.job_id
    )

