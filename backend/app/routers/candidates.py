from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import json
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.candidate import (
    Candidate, CandidateCreate, CandidateUpdate, 
    WhatsAppCommunication, WhatsAppCommunicationCreate, WhatsAppCommunicationUpdate
)
from app.models.candidate import Candidate as CandidateModel, WhatsAppCommunication as WhatsAppCommunicationModel, OfferLetter
from app.models.candidate import CandidateStatus, CandidateSource, OfferStatus
from app.models.user import UserRole
import os, shutil
from app.routers.resume_utils import parse_resume_spacy
import pandas as pd
from io import BytesIO
from fastapi.responses import FileResponse
import traceback
from pathlib import Path
from fastapi import Request
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from app.core.config import ALLOWED_ORIGINS


router = APIRouter()

OFFER_DIR = Path("offers")

# Candidate Management Endpoints
@router.get("/", response_model=List[Candidate])
async def get_candidates(
    skip: int = 0,
    status: Optional[CandidateStatus] = None,
    source: Optional[CandidateSource] = None,
    is_in_pool: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all candidates with optional filtering"""
    query = (db.query(CandidateModel).options(joinedload(CandidateModel.created_by_user)))
    
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

    candidates = (
        query.order_by(CandidateModel.id.desc())
        .offset(skip)
        .all()
    )
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
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all candidates in the pool"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    candidates = db.query(CandidateModel).filter(
        CandidateModel.is_in_pool == True
    ).offset(skip).all()
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
    current_user=Depends(get_current_user)
):
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")

    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Save file
    upload_dir = "uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{candidate_id}_{resume_file.filename}"
    file_path = os.path.join(upload_dir, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume_file.file, buffer)

    # Parse using spaCy
    parsed_data = parse_resume_spacy(file_path)

    if parsed_data:
        backend_url = "http://localhost:8000"
        candidate.resume_url = f"{backend_url}/uploads/resumes/{file_name}"
        candidate.experience_details = parsed_data.get("experience_summary", "")
        candidate.first_name = parsed_data.get("name", candidate.first_name)
        candidate.email = parsed_data.get("email", candidate.email)
        candidate.phone = parsed_data.get("phone", candidate.phone)

        db.commit()
        db.refresh(candidate)

    return {"message": "Resume uploaded and parsed using spaCy", "parsed": parsed_data}

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
    
    candidates = query_filter.offset(skip).all()
    return candidates


@router.post("/upload-excel/")
async def upload_candidates_excel(
    file: UploadFile = File(...), db: Session = Depends(get_db), current_user = Depends(get_current_user)
):

    # Role-based access control
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")

    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload an Excel file."
        )

    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        # Normalize column names
        df.columns = df.columns.str.strip().str.lower()

        # Required columns based on DB schema
        required_columns = [
            "first_name", "last_name", "email", "phone",
            "location_state", "location_city", "location_area",
            "location_pincode", "education_qualification_short"
        ]
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns: {', '.join(missing_cols)}"
            )

        # Insert candidates
        for idx, row in df.iterrows():
            try:
                candidate = CandidateModel(
                    first_name=str(row["first_name"]).strip() if pd.notna(row["first_name"]) else None,
                    last_name=str(row["last_name"]).strip() if pd.notna(row["last_name"]) else None,
                    email=str(row["email"]).strip() if pd.notna(row["email"]) else None,
                    phone=str(row["phone"]).strip() if pd.notna(row["phone"]) else None,
                    location_state=str(row["location_state"]).strip() if pd.notna(row.get("location_state")) else None,
                    location_city=str(row["location_city"]).strip() if pd.notna(row.get("location_city")) else None,
                    location_area=str(row["location_area"]).strip() if pd.notna(row.get("location_area")) else None,
                    location_pincode=str(row["location_pincode"]).strip() if pd.notna(row.get("location_pincode")) else None,
                    education_qualification_short=str(row["education_qualification_short"]).strip()
                        if pd.notna(row.get("education_qualification_short")) else None,
                    created_by=current_user.id,
                )
                db.add(candidate)

            except Exception as row_err:
                raise HTTPException(
                    status_code=400,
                    detail=f"Row {idx + 2} error: {row_err}"
                )

        db.commit()
        return {"message": f"Candidates uploaded successfully: {len(df)}"}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {e}"
        )




@router.get("/download-template/")
async def download_template():
    # Define headers for the Excel template
    template_columns = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "location_state",
        "location_city",
        "location_area",
        "location_pincode",
        "education_qualification_short",
    ]

    df = pd.DataFrame(columns=template_columns)  # Only headers, no dummy row

    output_dir = "templates"
    os.makedirs(output_dir, exist_ok=True)

    file_path = os.path.join(output_dir, "candidate_upload_template.xlsx")
    df.to_excel(file_path, index=False)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="candidate_upload_template.xlsx"
    )



def generate_offer_pdf(candidate):
    file_name = f"offer_{candidate.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    file_path = OFFER_DIR / file_name

    c = canvas.Canvas(str(file_path), pagesize=LETTER)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, 750, "OFFER LETTER")
    c.setFont("Helvetica", 12)
    c.drawString(100, 700, f"Candidate: {candidate.first_name} {candidate.last_name}")
    c.drawString(100, 680, f"Date: {datetime.utcnow().strftime('%d-%m-%Y')}")
    c.save()

    # Return static URL path (relative to FastAPI mount)
    return f"/offers/{file_name}"


def send_offer_email(email, file_path):
    # TODO: Replace with actual email integration
    print(f"📧 Sending offer letter {file_path} to {email}")


@router.post("/{candidate_id}/issue-offer")
def issue_offer(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(CandidateModel).get(candidate_id)
    if not candidate or candidate.status != CandidateStatus.SHORTLISTED:
        raise HTTPException(status_code=400, detail="Candidate not eligible for offer")

    # Generate offer PDF (from template)
    file_path = generate_offer_pdf(candidate)

    offer = OfferLetter(
        candidate_id=candidate.id,
        file_path=file_path,
        status=OfferStatus.SENT,
        sent_at=datetime.utcnow(),
    )
    db.add(offer)

    # TODO: integrate with e-sign provider (DocuSign/AdobeSign)
    send_offer_email(candidate.email, file_path)

    db.commit()
    return {"message": "Offer issued", "offer_id": offer.id}


@router.get("/offers/{offer_id}/download")
def download_offer(offer_id: int, db: Session = Depends(get_db)):
    # Fetch the offer from DB
    offer = db.query(OfferLetter).filter(OfferLetter.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    # Construct file path
    file_path = OFFER_DIR / Path(offer.file_path).name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Return file as attachment
    return FileResponse(path=file_path, filename=file_path.name, media_type='application/pdf')


@router.post("/offers/{offer_id}/accept")
def accept_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = db.query(OfferLetter).get(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    offer.status = OfferStatus.ACCEPTED
    offer.signed_at = datetime.utcnow()

    # Update candidate status
    candidate = db.query(CandidateModel).get(offer.candidate_id)
    if candidate:
        candidate.status = CandidateStatus.HIRED

    db.commit()
    return {"message": "Offer accepted. Candidate hired."}


@router.get("/offers/all")
def list_offers(request: Request, db: Session = Depends(get_db)):
    base_url = ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "http://localhost:3000"
    offers = (
        db.query(OfferLetter)
        .options(joinedload(OfferLetter.candidate))
        .order_by(OfferLetter.id.desc())
        .all()
    )

    return [
        {
            "id": offer.id,
            "status": offer.status.value,
            "file_path": f"{base_url}/offers/{Path(offer.file_path).name}",
            "sent_at": offer.sent_at,
            "signed_at": offer.signed_at,
            "candidate": {
                "id": offer.candidate.id,
                "first_name": offer.candidate.first_name,
                "last_name": offer.candidate.last_name,
                "email": offer.candidate.email,
            } if offer.candidate else None,
        }
        for offer in offers
    ]