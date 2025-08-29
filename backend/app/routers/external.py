from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.external import ExternalAgency
from app.schemas.external import ExternalAgencyCreate, ExternalAgencyRead

router = APIRouter(
    prefix="/external-agencies",
    tags=["External Agencies"]
)

# Create
@router.post("/", response_model=ExternalAgencyRead, status_code=status.HTTP_201_CREATED)
def create_agency(payload: ExternalAgencyCreate, db: Session = Depends(get_db)):
    agency = ExternalAgency(name=payload.name, status=payload.status)
    db.add(agency)
    db.commit()
    db.refresh(agency)
    return agency

# Read all
@router.get("/", response_model=List[ExternalAgencyRead])
def get_agencies(db: Session = Depends(get_db)):
    return db.query(ExternalAgency).order_by(ExternalAgency.created_date.desc()).all()

# Read single
@router.get("/{agency_id}", response_model=ExternalAgencyRead)
def get_agency(agency_id: int, db: Session = Depends(get_db)):
    agency = db.query(ExternalAgency).filter(ExternalAgency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")
    return agency

# Update
@router.put("/{agency_id}", response_model=ExternalAgencyRead)
def update_agency(agency_id: int, payload: ExternalAgencyCreate, db: Session = Depends(get_db)):
    agency = db.query(ExternalAgency).filter(ExternalAgency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")
    agency.name = payload.name
    agency.status = payload.status
    db.commit()
    db.refresh(agency)
    return agency

# Delete
@router.delete("/{agency_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agency(agency_id: int, db: Session = Depends(get_db)):
    agency = db.query(ExternalAgency).filter(ExternalAgency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")
    db.delete(agency)
    db.commit()
