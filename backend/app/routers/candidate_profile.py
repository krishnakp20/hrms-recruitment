from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.candidate_profile import CandidateProfileField
from app.schemas.candidate_profile import (
    CandidateProfileFieldCreate,
    CandidateProfileFieldUpdate,
    CandidateProfileFieldOut
)

router = APIRouter(prefix="/candidate-fields", tags=["Candidate Profile Fields"])

# Get All Fields
@router.get("/", response_model=List[CandidateProfileFieldOut])
def get_fields(db: Session = Depends(get_db)):
    return db.query(CandidateProfileField).all()

# Get by ID
@router.get("/{field_id}", response_model=CandidateProfileFieldOut)
def get_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(CandidateProfileField).filter(CandidateProfileField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

# Create Field
@router.post("/", response_model=CandidateProfileFieldOut)
def create_field(field: CandidateProfileFieldCreate, db: Session = Depends(get_db)):
    new_field = CandidateProfileField(
        field_name=field.field_name,
        field_type=field.field_type,
        is_default=field.is_default,
        is_mandatory=field.is_mandatory
    )
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field

# Update Field
@router.put("/{field_id}", response_model=CandidateProfileFieldOut)
def update_field(field_id: int, updated: CandidateProfileFieldUpdate, db: Session = Depends(get_db)):
    db_field = db.query(CandidateProfileField).filter(CandidateProfileField.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")

    db_field.field_name = updated.field_name
    db_field.field_type = updated.field_type
    db_field.is_default = updated.is_default
    db_field.is_mandatory = updated.is_mandatory

    db.commit()
    db.refresh(db_field)
    return db_field

# Delete Field
@router.delete("/{field_id}")
def delete_field(field_id: int, db: Session = Depends(get_db)):
    db_field = db.query(CandidateProfileField).filter(CandidateProfileField.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Field not found")

    db.delete(db_field)
    db.commit()
    return {"message": "Deleted successfully"}
