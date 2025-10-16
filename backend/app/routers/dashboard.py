from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.job import Job as JobModel, JobStatus
from app.models.candidate import Candidate as CandidateModel, CandidateStatus, CandidateSource
from app.models.application import Application as ApplicationModel, ApplicationStatus
from app.models.user import UserRole

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard statistics for the frontend"""
    try:
        # Job statistics
        total_jobs = db.query(JobModel).count()
        active_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.APPROVED).count()
        pending_approval_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.PENDING_APPROVAL).count()
        draft_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.DRAFT).count()
        
        # Candidate statistics
        total_candidates = db.query(CandidateModel).count()
        new_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.NEW).count()
        shortlisted_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.SHORTLISTED).count()
        interviewed_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.INTERVIEWED).count()
        pool_candidates = db.query(CandidateModel).filter(CandidateModel.is_in_pool == True).count()
        
        # Application statistics
        total_applications = db.query(ApplicationModel).count()
        applied_applications = db.query(ApplicationModel).filter(ApplicationModel.status == ApplicationStatus.APPLIED).count()
        shortlisted_applications = db.query(ApplicationModel.status == ApplicationStatus.SHORTLISTED).count()
        interviewed_applications = db.query(ApplicationModel.status == ApplicationStatus.INTERVIEWED).count()
        hired_applications = db.query(ApplicationModel.status == ApplicationStatus.HIRED).count()
        
        # Calculate changes (mock data for now)
        jobs_change = "+12%" if total_jobs > 0 else "+0%"
        candidates_change = "+5%" if total_candidates > 0 else "+0%"
        positions_change = "-3%" if active_jobs > 0 else "+0%"
        applications_change = "+18%" if total_applications > 0 else "+0%"
        
        return [
            {
                "name": "Total Candidates",
                "value": str(total_candidates),
                "change": candidates_change,
                "changeType": "positive",
                "icon": "Users"
            },
            {
                "name": "Active Candidates",
                "value": str(new_candidates + shortlisted_candidates),
                "change": candidates_change,
                "changeType": "positive",
                "icon": "UserPlus"
            },
            {
                "name": "Open Positions",
                "value": str(active_jobs),
                "change": positions_change,
                "changeType": "negative" if active_jobs > 0 else "positive",
                "icon": "Briefcase"
            },
            {
                "name": "Applications",
                "value": str(total_applications),
                "change": applications_change,
                "changeType": "positive",
                "icon": "FileText"
            }
        ]
    except Exception as e:
        print(f"Error in get_dashboard_stats: {e}")
        # Return default stats if there's an error
        return [
            {
                "name": "Total Employees",
                "value": "0",
                "change": "+0%",
                "changeType": "positive",
                "icon": "Users"
            },
            {
                "name": "Active Candidates",
                "value": "0",
                "change": "+0%",
                "changeType": "positive",
                "icon": "UserPlus"
            },
            {
                "name": "Open Positions",
                "value": "0",
                "change": "+0%",
                "changeType": "positive",
                "icon": "Briefcase"
            },
            {
                "name": "Applications",
                "value": "0",
                "change": "+0%",
                "changeType": "positive",
                "icon": "FileText"
            }
        ]

@router.get("/activities")
async def get_dashboard_activities(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recent activities for the dashboard"""
    try:
        activities = []
        
        # Get recent jobs
        recent_jobs = db.query(JobModel).order_by(JobModel.created_at.desc()).limit(5).all()
        for job in recent_jobs:
            activities.append({
                "id": f"job_{job.id}",
                "type": "application",
                "message": f"New job created: {job.position_title}",
                "time": f"{job.created_at.strftime('%d-%m-%Y %H:%M')}"
            })
        
        # Get recent candidates
        recent_candidates = db.query(CandidateModel).order_by(CandidateModel.created_at.desc()).limit(5).all()
        for candidate in recent_candidates:
            activities.append({
                "id": f"candidate_{candidate.id}",
                "type": "application",
                "message": f"New candidate added: {candidate.first_name} {candidate.last_name}",
                "time": f"{candidate.created_at.strftime('%d-%m-%Y %H:%M')}"
            })
        
        # Get recent applications
        recent_applications = db.query(ApplicationModel).order_by(ApplicationModel.applied_at.desc()).limit(5).all()
        for application in recent_applications:
            activities.append({
                "id": f"application_{application.id}",
                "type": "application",
                "message": f"New application submitted",
                "time": f"{application.applied_at.strftime('%d-%m-%Y %H:%M')}"
            })
        
        # Sort by time and limit to 10
        activities.sort(key=lambda x: x["time"], reverse=True)
        return activities[:10]
        
    except Exception as e:
        print(f"Error in get_dashboard_activities: {e}")
        # Return default activity if there's an error
        return [
            {
                "id": 1,
                "type": "info",
                "message": "Welcome to HRMS Recruitment System",
                "time": "Just now"
            }
        ]

@router.get("/recruitment-overview")
async def get_recruitment_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recruitment overview statistics"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Job statistics
    total_jobs = db.query(JobModel).count()
    active_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.ACTIVE).count()
    pending_approval_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.PENDING_APPROVAL).count()
    draft_jobs = db.query(JobModel).filter(JobModel.status == JobStatus.DRAFT).count()
    
    # Candidate statistics
    total_candidates = db.query(CandidateModel).count()
    new_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.NEW).count()
    shortlisted_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.SHORTLISTED).count()
    interviewed_candidates = db.query(CandidateModel).filter(CandidateModel.status == CandidateStatus.INTERVIEWED).count()
    pool_candidates = db.query(CandidateModel).filter(CandidateModel.is_in_pool == True).count()
    
    # Application statistics
    total_applications = db.query(ApplicationModel).count()
    applied_applications = db.query(ApplicationModel).filter(ApplicationModel.status == ApplicationStatus.APPLIED).count()
    shortlisted_applications = db.query(ApplicationModel).filter(ApplicationModel.status == ApplicationStatus.SHORTLISTED).count()
    interviewed_applications = db.query(ApplicationModel).filter(ApplicationModel.status == ApplicationStatus.INTERVIEWED).count()
    hired_applications = db.query(ApplicationModel).filter(ApplicationModel.status == ApplicationStatus.HIRED).count()
    
    # Source breakdown
    source_stats = db.query(
        CandidateModel.source,
        func.count(CandidateModel.id).label('count')
    ).group_by(CandidateModel.source).all()
    
    return {
        "jobs": {
            "total": total_jobs,
            "active": active_jobs,
            "pending_approval": pending_approval_jobs,
            "draft": draft_jobs
        },
        "candidates": {
            "total": total_candidates,
            "new": new_candidates,
            "shortlisted": shortlisted_candidates,
            "interviewed": interviewed_candidates,
            "in_pool": pool_candidates
        },
        "applications": {
            "total": total_applications,
            "applied": applied_applications,
            "shortlisted": shortlisted_applications,
            "interviewed": interviewed_applications,
            "hired": hired_applications
        },
        "source_breakdown": [
            {"source": stat.source, "count": stat.count} for stat in source_stats
        ]
    }

@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recent recruitment activities"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Recent job activities
    recent_jobs = db.query(JobModel).order_by(JobModel.created_at.desc()).limit(limit).all()
    
    # Recent candidate activities
    recent_candidates = db.query(CandidateModel).order_by(CandidateModel.created_at.desc()).limit(limit).all()
    
    # Recent application activities
    recent_applications = db.query(ApplicationModel).order_by(ApplicationModel.applied_at.desc()).limit(limit).all()
    
    activities = []
    
    # Add job activities
    for job in recent_jobs:
        activities.append({
            "type": "job_created",
            "title": f"Job '{job.position_title}' created",
            "description": f"Position: {job.position_title}, Department: {job.department_id}, Status: {job.status}",
            "timestamp": job.created_at,
            "entity_id": job.id
        })
    
    # Add candidate activities
    for candidate in recent_candidates:
        activities.append({
            "type": "candidate_added",
            "title": f"Candidate '{candidate.first_name} {candidate.last_name}' added",
            "description": f"Source: {candidate.source}, Status: {candidate.status}",
            "timestamp": candidate.created_at,
            "entity_id": candidate.id
        })
    
    # Add application activities
    for application in recent_applications:
        activities.append({
            "type": "application_submitted",
            "title": f"Application submitted for job",
            "description": f"Status: {application.status}",
            "timestamp": application.applied_at,
            "entity_id": application.id
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return activities[:limit]

@router.get("/pending-approvals")
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get jobs pending approval"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    pending_jobs = db.query(JobModel).filter(
        JobModel.status == JobStatus.PENDING_APPROVAL
    ).all()
    
    return pending_jobs

@router.get("/upcoming-interviews")
async def get_upcoming_interviews(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get upcoming interviews"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get interviews scheduled in the next 7 days
    next_week = datetime.now() + timedelta(days=7)
    
    upcoming_interviews = db.query(ApplicationModel).filter(
        and_(
            ApplicationModel.interview_scheduled_at.isnot(None),
            ApplicationModel.interview_scheduled_at >= datetime.now(),
            ApplicationModel.interview_scheduled_at <= next_week
        )
    ).all()
    
    return upcoming_interviews

@router.get("/candidate-pool-stats")
async def get_candidate_pool_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get candidate pool statistics"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    pool_candidates = db.query(CandidateModel).filter(CandidateModel.is_in_pool == True).all()
    
    # Skills breakdown in pool
    skills_count = {}
    for candidate in pool_candidates:
        if candidate.experience_details:
            # Simple skills extraction (in real implementation, you'd use NLP)
            skills = candidate.experience_details.lower().split()
            for skill in skills:
                if len(skill) > 3:  # Filter out short words
                    skills_count[skill] = skills_count.get(skill, 0) + 1
    
    # Top skills
    top_skills = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Experience level breakdown
    experience_levels = {}
    for candidate in pool_candidates:
        if candidate.experience_years:
            level = "Junior" if candidate.experience_years < 3 else "Mid" if candidate.experience_years < 7 else "Senior"
            experience_levels[level] = experience_levels.get(level, 0) + 1
    
    return {
        "total_in_pool": len(pool_candidates),
        "top_skills": [{"skill": skill, "count": count} for skill, count in top_skills],
        "experience_levels": experience_levels
    }

@router.get("/recruitment-funnel")
async def get_recruitment_funnel(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recruitment funnel data"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get funnel data for the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Applications by status
    applications_by_status = db.query(
        ApplicationModel.status,
        func.count(ApplicationModel.id).label('count')
    ).filter(
        ApplicationModel.applied_at >= thirty_days_ago
    ).group_by(ApplicationModel.status).all()
    
    # Source effectiveness
    source_effectiveness = db.query(
        CandidateModel.source,
        func.count(CandidateModel.id).label('total'),
        func.sum(func.case([(CandidateModel.status == CandidateStatus.SHORTLISTED, 1)], else_=0)).label('shortlisted'),
        func.sum(func.case([(CandidateModel.status == CandidateStatus.HIRED, 1)], else_=0)).label('hired')
    ).filter(
        CandidateModel.created_at >= thirty_days_ago
    ).group_by(CandidateModel.source).all()
    
    return {
        "funnel": [
            {"stage": stat.status, "count": stat.count} for stat in applications_by_status
        ],
        "source_effectiveness": [
            {
                "source": stat.source,
                "total": stat.total,
                "shortlisted": stat.shortlisted,
                "hired": stat.hired,
                "shortlist_rate": (stat.shortlisted / stat.total * 100) if stat.total > 0 else 0,
                "hire_rate": (stat.hired / stat.total * 100) if stat.total > 0 else 0
            }
            for stat in source_effectiveness
        ]
    }

@router.get("/department-stats")
async def get_department_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recruitment statistics by department"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Jobs by department
    jobs_by_department = db.query(
        JobModel.department_id,
        func.count(JobModel.id).label('total_jobs'),
        func.sum(func.case([(JobModel.status == JobStatus.ACTIVE, 1)], else_=0)).label('active_jobs')
    ).group_by(JobModel.department_id).all()
    
    # Applications by department (through jobs)
    applications_by_department = db.query(
        JobModel.department_id,
        func.count(ApplicationModel.id).label('total_applications'),
        func.sum(func.case([(ApplicationModel.status == ApplicationStatus.SHORTLISTED, 1)], else_=0)).label('shortlisted'),
        func.sum(func.case([(ApplicationModel.status == ApplicationStatus.HIRED, 1)], else_=0)).label('hired')
    ).join(ApplicationModel, JobModel.id == ApplicationModel.job_id).group_by(JobModel.department_id).all()
    
    return {
        "jobs_by_department": [
            {
                "department_id": stat.department_id,
                "total_jobs": stat.total_jobs,
                "active_jobs": stat.active_jobs
            }
            for stat in jobs_by_department
        ],
        "applications_by_department": [
            {
                "department_id": stat.department_id,
                "total_applications": stat.total_applications,
                "shortlisted": stat.shortlisted,
                "hired": stat.hired,
                "shortlist_rate": (stat.shortlisted / stat.total_applications * 100) if stat.total_applications > 0 else 0,
                "hire_rate": (stat.hired / stat.total_applications * 100) if stat.total_applications > 0 else 0
            }
            for stat in applications_by_department
        ]
    }

@router.get("/recruiter-performance")
async def get_recruiter_performance(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recruiter performance metrics"""
    if current_user.role not in [UserRole.HR_SPOC, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Recruiter performance (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    recruiter_stats = db.query(
        JobModel.recruiter_id,
        func.count(JobModel.id).label('assigned_jobs'),
        func.count(ApplicationModel.id).label('total_applications'),
        func.sum(func.case([(ApplicationModel.status == ApplicationStatus.SHORTLISTED, 1)], else_=0)).label('shortlisted'),
        func.sum(func.case([(ApplicationModel.status == ApplicationStatus.HIRED, 1)], else_=0)).label('hired')
    ).join(ApplicationModel, JobModel.id == ApplicationModel.job_id).filter(
        JobModel.created_at >= thirty_days_ago
    ).group_by(JobModel.recruiter_id).all()
    
    return [
        {
            "recruiter_id": stat.recruiter_id,
            "assigned_jobs": stat.assigned_jobs,
            "total_applications": stat.total_applications,
            "shortlisted": stat.shortlisted,
            "hired": stat.hired,
            "shortlist_rate": (stat.shortlisted / stat.total_applications * 100) if stat.total_applications > 0 else 0,
            "hire_rate": (stat.hired / stat.total_applications * 100) if stat.total_applications > 0 else 0
        }
        for stat in recruiter_stats
    ] 