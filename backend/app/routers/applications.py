from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.application import Application, ApplicationCreate, ApplicationUpdate
from app.models.application import Application as ApplicationModel
from app.core.security import get_current_user
from app.models.user import UserRole

router = APIRouter()

@router.get("/", response_model=List[Application])
async def get_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    applications = db.query(ApplicationModel).offset(skip).limit(limit).all()
    return applications

@router.get("/{application_id}", response_model=Application)
async def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.post("/", response_model=Application)
async def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    db_application = ApplicationModel(**application.dict())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.put("/{application_id}", response_model=Application)
async def update_application(application_id: int, application: ApplicationUpdate, db: Session = Depends(get_db)):
    db_application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if db_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    for field, value in application.dict(exclude_unset=True).items():
        setattr(db_application, field, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application

@router.delete("/{application_id}")
async def delete_application(application_id: int, db: Session = Depends(get_db)):
    db_application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if db_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(db_application)
    db.commit()
    return {"message": "Application deleted successfully"}