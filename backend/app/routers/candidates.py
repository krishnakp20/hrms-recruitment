from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.candidate import (
    Candidate, CandidateCreate, CandidateUpdate, 
    WhatsAppCommunication, WhatsAppCommunicationCreate, WhatsAppCommunicationUpdate
)
from app.models.candidate import Candidate as CandidateModel, WhatsAppCommunication as WhatsAppCommunicationModel
from app.models.candidate import CandidateStatus, CandidateSource
from app.models.user import UserRole

router = APIRouter()

# Candidate Management Endpoints
@router.get("/", response_model=List[Candidate])
async def get_candidates(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[CandidateStatus] = None,
    source: Optional[CandidateSource] = None,
    is_in_pool: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all candidates with optional filtering"""
    query = db.query(CandidateModel)
    
    if status:
        query = query.filter(CandidateModel.status == status)
    if source:
        query = query.filter(CandidateModel.source == source)
    if is_in_pool is not None:
        query = query.filter(CandidateModel.is_in_pool == is_in_pool)
    
    # Role-based filtering
    if current_user.role == UserRole.RECRUITER:
        # Recruiters can see candidates they created or are assigned to
        query = query.filter(CandidateModel.created_by == current_user.id)
    elif current_user.role == UserRole.HR_SPOC:
        # HR SPOC can see all candidates
        pass
    elif current_user.role == UserRole.ADMIN:
        # Admin can see all candidates
        pass
    else:
        # Other roles have limited access
        query = query.filter(CandidateModel.created_by == current_user.id)
    
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@router.get("/{candidate_id}", response_model=Candidate)
async def get_candidate(
    candidate_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific candidate by ID"""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Role-based access control
    if current_user.role == UserRole.RECRUITER and candidate.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        if candidate.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return candidate

@router.post("/", response_model=Candidate)
async def create_candidate(
    candidate: CandidateCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new candidate"""
    # Role-based access control
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_candidate = CandidateModel(**candidate.dict(), created_by=current_user.id)
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.put("/{candidate_id}", response_model=Candidate)
async def update_candidate(
    candidate_id: int, 
    candidate: CandidateUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a candidate"""
    db_candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if db_candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Role-based access control
    if current_user.role == UserRole.RECRUITER and db_candidate.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        if db_candidate.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    for field, value in candidate.dict(exclude_unset=True).items():
        setattr(db_candidate, field, value)
    
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a candidate"""
    db_candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if db_candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Role-based access control
    if current_user.role == UserRole.RECRUITER and db_candidate.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        if db_candidate.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

# Candidate Pool Management
@router.get("/pool/", response_model=List[Candidate])
async def get_candidate_pool(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all candidates in the pool"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidates = db.query(CandidateModel).filter(
        CandidateModel.is_in_pool == True
    ).offset(skip).limit(limit).all()
    return candidates

@router.post("/{candidate_id}/add-to-pool")
async def add_to_pool(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Add a candidate to the pool"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate.is_in_pool = True
    candidate.status = CandidateStatus.POOL
    db.commit()
    db.refresh(candidate)
    return {"message": "Candidate added to pool", "candidate": candidate}

@router.post("/{candidate_id}/remove-from-pool")
async def remove_from_pool(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Remove a candidate from the pool"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate.is_in_pool = False
    candidate.status = CandidateStatus.NEW
    db.commit()
    db.refresh(candidate)
    return {"message": "Candidate removed from pool", "candidate": candidate}

# WhatsApp Communication Endpoints
@router.get("/{candidate_id}/whatsapp/", response_model=List[WhatsAppCommunication])
async def get_whatsapp_communications(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all WhatsApp communications for a candidate"""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    communications = db.query(WhatsAppCommunicationModel).filter(
        WhatsAppCommunicationModel.candidate_id == candidate_id
    ).all()
    return communications

@router.post("/{candidate_id}/whatsapp/", response_model=WhatsAppCommunication)
async def create_whatsapp_communication(
    candidate_id: int,
    communication: WhatsAppCommunicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new WhatsApp communication"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    db_communication = WhatsAppCommunicationModel(**communication.dict(), candidate_id=candidate_id)
    db.add(db_communication)
    db.commit()
    db.refresh(db_communication)
    return db_communication

@router.post("/{candidate_id}/whatsapp/{communication_id}/send")
async def send_whatsapp_message(
    candidate_id: int,
    communication_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send a WhatsApp message"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    communication = db.query(WhatsAppCommunicationModel).filter(
        WhatsAppCommunicationModel.id == communication_id,
        WhatsAppCommunicationModel.candidate_id == candidate_id
    ).first()
    
    if communication is None:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    # Here you would integrate with WhatsApp API
    # For now, we'll just update the status
    communication.status = "Sent"
    communication.sent_at = datetime.now()
    db.commit()
    db.refresh(communication)
    return {"message": "WhatsApp message sent", "communication": communication}

# Resume Upload and Parsing
@router.post("/{candidate_id}/upload-resume")
async def upload_resume(
    candidate_id: int,
    resume_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload and parse a resume for a candidate"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Here you would implement file upload logic
    # For now, we'll just update the resume_url
    resume_url = f"/uploads/resumes/{candidate_id}_{resume_file.filename}"
    candidate.resume_url = resume_url
    
    # Here you would implement resume parsing logic
    # For now, we'll just update some basic fields
    # parsed_data = parse_resume(resume_file)
    # candidate.education_qualification_short = parsed_data.get("education", "")
    # candidate.experience_years = parsed_data.get("experience_years", 0)
    
    db.commit()
    db.refresh(candidate)
    return {"message": "Resume uploaded and parsed", "candidate": candidate}

# Bulk Import from WhatsApp
@router.post("/import-from-whatsapp")
async def import_from_whatsapp(
    whatsapp_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Import candidate data from WhatsApp"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Here you would implement WhatsApp data parsing logic
    # For now, we'll just create a sample candidate
    candidate_data = {
        "first_name": whatsapp_data.get("name", "").split()[0],
        "last_name": " ".join(whatsapp_data.get("name", "").split()[1:]) if len(whatsapp_data.get("name", "").split()) > 1 else "",
        "email": whatsapp_data.get("email", ""),
        "phone": whatsapp_data.get("phone", ""),
        "source": CandidateSource.WHATSAPP,
        "source_details": "WhatsApp Import",
        "created_by": current_user.id
    }
    
    db_candidate = CandidateModel(**candidate_data)
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return {"message": "Candidate imported from WhatsApp", "candidate": db_candidate}

# Candidate Search and Filtering
@router.get("/search/", response_model=List[Candidate])
async def search_candidates(
    query: str = Query(..., description="Search query"),
    skills: Optional[str] = Query(None, description="Comma-separated skills"),
    experience_min: Optional[int] = Query(None, description="Minimum experience years"),
    experience_max: Optional[int] = Query(None, description="Maximum experience years"),
    location: Optional[str] = Query(None, description="Location"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Search candidates with various filters"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    query_filter = db.query(CandidateModel)
    
    # Basic text search
    if query:
        query_filter = query_filter.filter(
            (CandidateModel.first_name.contains(query)) |
            (CandidateModel.last_name.contains(query)) |
            (CandidateModel.email.contains(query)) |
            (CandidateModel.education_qualification_short.contains(query))
        )
    
    # Skills filter
    if skills:
        skills_list = [skill.strip() for skill in skills.split(",")]
        for skill in skills_list:
            query_filter = query_filter.filter(
                CandidateModel.experience_details.contains(skill)
            )
    
    # Experience filter
    if experience_min is not None:
        query_filter = query_filter.filter(CandidateModel.experience_years >= experience_min)
    if experience_max is not None:
        query_filter = query_filter.filter(CandidateModel.experience_years <= experience_max)
    
    # Location filter
    if location:
        query_filter = query_filter.filter(
            (CandidateModel.location_city.contains(location)) |
            (CandidateModel.location_state.contains(location))
        )
    
    candidates = query_filter.offset(skip).limit(limit).all()
    return candidates 