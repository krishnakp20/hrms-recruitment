from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.job import (
    Job, JobCreate, JobUpdate, Department, DepartmentCreate, DepartmentUpdate,
    RecruitmentWorkflow, RecruitmentWorkflowCreate, RecruitmentWorkflowUpdate,
    RecruitmentAgency, RecruitmentAgencyCreate, RecruitmentAgencyUpdate,
    JobPostingChannel, JobPostingChannelCreate, JobPostingChannelUpdate
)
from app.models.job import Job as JobModel, Department as DepartmentModel, RecruitmentWorkflow as RecruitmentWorkflowModel
from app.models.job import RecruitmentAgency as RecruitmentAgencyModel, JobPostingChannel as JobPostingChannelModel
from app.models.job import JobStatus, LocationType
from app.models.user import UserRole

router = APIRouter()

# Job Management Endpoints
@router.get("/", response_model=List[Job])
async def get_jobs(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[JobStatus] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all jobs with optional filtering"""
    query = db.query(JobModel)
    
    if status:
        query = query.filter(JobModel.status == status)
    if department_id:
        query = query.filter(JobModel.department_id == department_id)
    
    # Role-based filtering
    if current_user.role == UserRole.EMPLOYER:
        query = query.filter(JobModel.created_by == current_user.id)
    elif current_user.role == UserRole.RECRUITER:
        query = query.filter(JobModel.recruiter_id == current_user.id)
    elif current_user.role == UserRole.HR_SPOC:
        # HR SPOC can see all jobs
        pass
    elif current_user.role == UserRole.ADMIN:
        # Admin can see all jobs
        pass
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=Job)
async def get_job(
    job_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific job by ID"""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Role-based access control
    if current_user.role == UserRole.EMPLOYER and job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.RECRUITER and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return job

@router.post("/", response_model=Job)
async def create_job(
    job: JobCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new job opening"""
    print(f"DEBUG: User {current_user.email} with role {current_user.role} attempting to create job")
    
    # Role-based access control
    if current_user.role not in [UserRole.EMPLOYER, UserRole.MANAGER, UserRole.ADMIN, UserRole.HR_SPOC]:
        print(f"DEBUG: Access denied for role {current_user.role}")
        raise HTTPException(status_code=403, detail="Only employers, managers, admins, and HR SPOCs can create jobs")
    
    print(f"DEBUG: Access granted for role {current_user.role}")
    db_job = JobModel(**job.dict(), created_by=current_user.id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.put("/{job_id}", response_model=Job)
async def update_job(
    job_id: int, 
    job: JobUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a job opening"""
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Role-based access control
    if current_user.role == UserRole.EMPLOYER and db_job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.RECRUITER and db_job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for field, value in job.dict(exclude_unset=True).items():
        setattr(db_job, field, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete("/{job_id}")
async def delete_job(
    job_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a job opening"""
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Role-based access control
    if current_user.role == UserRole.EMPLOYER and db_job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}

# Job Approval Endpoints
@router.post("/{job_id}/submit-for-approval")
async def submit_for_approval(
    job_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Submit a job for approval"""
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if db_job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db_job.status != JobStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft jobs can be submitted for approval")
    
    db_job.status = JobStatus.PENDING_APPROVAL
    db.commit()
    db.refresh(db_job)
    return {"message": "Job submitted for approval", "job": db_job}

@router.post("/{job_id}/approve")
async def approve_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Approve a job opening"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only HR SPOC and admins can approve jobs")
    
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if db_job.status != JobStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="Only pending approval jobs can be approved")
    
    db_job.status = JobStatus.APPROVED
    db_job.approved_by = current_user.id
    db_job.approved_at = datetime.now()
    db.commit()
    db.refresh(db_job)
    return {"message": "Job approved successfully", "job": db_job}

@router.post("/{job_id}/activate")
async def activate_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Activate a job opening"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only HR SPOC and admins can activate jobs")
    
    db_job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if db_job.status != JobStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Only approved jobs can be activated")
    
    db_job.status = JobStatus.ACTIVE
    db.commit()
    db.refresh(db_job)
    return {"message": "Job activated successfully", "job": db_job}



# Recruitment Workflow Management Endpoints
@router.get("/workflows/", response_model=List[RecruitmentWorkflow])
async def get_workflows(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all recruitment workflows"""
    workflows = db.query(RecruitmentWorkflowModel).offset(skip).limit(limit).all()
    return workflows

@router.post("/workflows/", response_model=RecruitmentWorkflow)
async def create_workflow(
    workflow: RecruitmentWorkflowCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new recruitment workflow"""
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_workflow = RecruitmentWorkflowModel(**workflow.dict())
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

# Recruitment Agency Management Endpoints
@router.get("/agencies/", response_model=List[RecruitmentAgency])
async def get_agencies(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all recruitment agencies"""
    agencies = db.query(RecruitmentAgencyModel).offset(skip).limit(limit).all()
    return agencies

@router.post("/agencies/", response_model=RecruitmentAgency)
async def create_agency(
    agency: RecruitmentAgencyCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new recruitment agency"""
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db_agency = RecruitmentAgencyModel(**agency.dict())
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency

# Job Posting Channel Management Endpoints
@router.get("/{job_id}/posting-channels/", response_model=List[JobPostingChannel])
async def get_job_posting_channels(
    job_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all posting channels for a job"""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    channels = db.query(JobPostingChannelModel).filter(JobPostingChannelModel.job_id == job_id).all()
    return channels

@router.post("/{job_id}/posting-channels/", response_model=JobPostingChannel)
async def create_job_posting_channel(
    job_id: int,
    channel: JobPostingChannelCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new posting channel for a job"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db_channel = JobPostingChannelModel(**channel.dict(), job_id=job_id)
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

@router.post("/{job_id}/posting-channels/{channel_id}/publish")
async def publish_job_channel(
    job_id: int,
    channel_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Publish a job to a specific channel"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    channel = db.query(JobPostingChannelModel).filter(
        JobPostingChannelModel.id == channel_id,
        JobPostingChannelModel.job_id == job_id
    ).first()
    
    if channel is None:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    channel.status = "Posted"
    channel.posted_at = datetime.now()
    db.commit()
    db.refresh(channel)
    return {"message": "Job published successfully", "channel": channel}


# Department Management Endpoints
@router.get("/departments/", response_model=List[Department])
async def get_departments(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """Get all departments"""
    departments = db.query(DepartmentModel).offset(skip).limit(limit).all()
    return departments


@router.post("/departments/", response_model=Department)
async def create_department(
        department: DepartmentCreate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """Create a new department"""
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")

    db_department = DepartmentModel(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.get("/departments/{department_id}", response_model=Department)
async def get_department(department_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")

    department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/departments/{department_id}", response_model=Department)
async def update_department(department_id: int, department: DepartmentUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")

    db_department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")

    for field, value in department.dict(exclude_unset=True).items():
        setattr(db_department, field, value)

    db.commit()
    db.refresh(db_department)
    return db_department


@router.delete("/departments/{department_id}")
async def delete_department(department_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")

    db_department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")

    db.delete(db_department)
    db.commit()
    return {"message": "Department deleted successfully"}