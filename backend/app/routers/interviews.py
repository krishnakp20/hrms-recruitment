# app/routers/interviews.py
from typing import List, Optional, Any, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# import your utils
from app.core.database import get_db
from app.core.security import get_current_user  # adapt to your project
from app.models.candidate import Candidate as CandidateModel, CandidateStatus
from app.models.job import Job as JobModel
from app.models.user import User as UserModel
from app.models.application import Application as ApplicationModel
from app.models.interview import (Interview as InterviewModel, InterviewRound as InterviewRoundModel, Question as QuestionModel,
                                  QuestionInstance as QuestionInstanceModel, InterviewAnswer as InterviewAnswerModel, RoundType)
from app.schemas.interviews import *
from app.schemas.application import *
from app.schemas.interviews import RoundStartRequest
import json
import openai
from app.core.config import OPENAI_API_KEY

router = APIRouter()


@router.get("/{application_id}", response_model=Application)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = (
        db.query(ApplicationModel)
        .filter(ApplicationModel.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Eager load candidate + job
    candidate = db.query(CandidateModel).filter(CandidateModel.id == application.candidate_id).first()
    job = db.query(JobModel).filter(JobModel.id == application.job_id).first()

    if not candidate or not job:
        raise HTTPException(status_code=400, detail="Invalid application links")

    # Build response schema
    return {
        "id": application.id,
        "status": application.status,
        "job": {
            "id": job.id,
            "position_title": job.position_title,
            "position_code": job.position_code,
        },
        "candidate": {
            "id": candidate.id,
            "first_name": candidate.first_name,
            "last_name": candidate.last_name,
            "email": candidate.email,
            "experience_years": candidate.experience_years,
        },
    }


@router.post("/{application_id}/start_interview")
def start_interview(application_id: int, db: Session = Depends(get_db)):
    application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = InterviewModel(
        application_id=application_id,
        job_id = application.job_id,
        candidate_id = application.candidate_id,
        status = "Scheduled"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/rounds/start")
def start_round(interview_id: int, payload: RoundStartRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    interview = db.query(InterviewModel).get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    round = InterviewRoundModel(interview_id=interview_id, round_type=payload.round_type, interviewer_id=current_user.id)
    db.add(round)
    db.commit()
    db.refresh(round)
    return round


@router.post("/{interview_id}/rounds/{round_type}/submit")
def submit_round(interview_id: int, round_type: RoundType, answers: List[AnswerSchema], db: Session = Depends(get_db)):
    interview = db.query(InterviewModel).get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    round = (
        db.query(InterviewRoundModel)
        .filter(
            InterviewRoundModel.interview_id == interview_id,
            InterviewRoundModel.round_type == round_type,
        )
        .first()
    )

    if not round:
        raise HTTPException(status_code=404, detail=f"{round_type} round not found")

    if not answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    total_score = 0
    for ans in answers:
        db.add(
            InterviewAnswerModel(
                round_id=round.id,
                question_id=ans.question_id,
                score=ans.score,
                remarks=ans.remarks,
            )
        )
        total_score += ans.score

    # Calculate percentage score
    pct = total_score / len(answers)
    round.result_pct = pct
    round.completed_at = datetime.utcnow()

    REQUIRED_ROUNDS = {RoundType.HR, RoundType.Manager, RoundType.Executive}

    # Check if all rounds for this interview are completed
    all_rounds = db.query(InterviewRoundModel).filter(
        InterviewRoundModel.interview_id == interview.id
    ).all()

    completed_rounds = {r.round_type for r in all_rounds if r.completed_at is not None}

    if REQUIRED_ROUNDS.issubset(completed_rounds):
        candidate = db.query(CandidateModel).get(interview.candidate_id)
        if candidate:
            interview.final_pct = sum(r.result_pct for r in all_rounds) / len(all_rounds)
            candidate.status = CandidateStatus.INTERVIEWED

            if interview.final_pct >= 60.0:
                candidate.status = CandidateStatus.SHORTLISTED


    db.commit()
    db.refresh(round)

    return {
        "round_id": round.id,
        "round_type": round_type,
        "score_pct": pct,
        "final_pct": interview.final_pct,
    }


@router.post("/{job_id}/questions", response_model=QuestionResponse)
def create_question(
    job_id: int,
    question: QuestionCreate,
    db: Session = Depends(get_db)
):
    # make sure job exists
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db_question = QuestionModel(
        job_id=job_id,
        round_type=question.round_type,
        text=question.text,
        competency=question.competency,
        expected_points=question.expected_points,
        weight=question.weight,
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question