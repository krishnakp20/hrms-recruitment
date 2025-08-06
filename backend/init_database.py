#!/usr/bin/env python3
"""
Database Initialization Script
Creates all tables and adds sample data for the HRMS Recruitment System
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal, Base
from app.models import *
from app.core.security import get_password_hash
from app.models.user import UserRole

def init_database():
    """Initialize the database with tables and sample data"""
    print("🚀 Initializing HRMS Recruitment Database...")
    
    # Create all tables
    print("📋 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")
    
    # Create sample data
    print("📝 Adding sample data...")
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users == 0:
            # Create sample users
            users = [
                User(
                    email="admin@hrms.com",
                    username="admin",
                    full_name="Admin User",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    is_active=True
                ),
                User(
                    email="hr.spoc@company.com",
                    username="hr_spoc",
                    full_name="HR SPOC",
                    hashed_password=get_password_hash("hr123"),
                    role=UserRole.HR_SPOC,
                    is_active=True
                ),
                User(
                    email="employer@company.com",
                    username="employer",
                    full_name="Employer User",
                    hashed_password=get_password_hash("emp123"),
                    role=UserRole.EMPLOYER,
                    is_active=True
                ),
                User(
                    email="recruiter@company.com",
                    username="recruiter",
                    full_name="Recruiter User",
                    hashed_password=get_password_hash("rec123"),
                    role=UserRole.RECRUITER,
                    is_active=True
                )
            ]
            
            for user in users:
                db.add(user)
            
            # Create sample departments
            departments = [
                Department(name="Engineering", sub_department="Software Development"),
                Department(name="Marketing", sub_department="Digital Marketing"),
                Department(name="Sales", sub_department="Enterprise Sales"),
                Department(name="HR", sub_department="Recruitment")
            ]
            
            for dept in departments:
                db.add(dept)
            
            # Create sample workflows
            workflows = [
                RecruitmentWorkflow(
                    name="Standard Engineering",
                    description="Standard workflow for engineering positions",
                    steps='["Screening", "Technical Interview", "HR Interview", "Final Round", "Offer"]',
                    is_active=True
                ),
                RecruitmentWorkflow(
                    name="Executive Hiring",
                    description="Workflow for executive positions",
                    steps='["Initial Screening", "Panel Interview", "CEO Interview", "Reference Check", "Offer"]',
                    is_active=True
                )
            ]
            
            for workflow in workflows:
                db.add(workflow)
            
            # Create sample agencies
            agencies = [
                RecruitmentAgency(
                    name="TechRecruit Pro",
                    contact_person="John Smith",
                    email="john@techrecruitpro.com",
                    phone="+1-555-123-4567",
                    website="https://techrecruitpro.com",
                    is_active=True
                ),
                RecruitmentAgency(
                    name="Global Talent Solutions",
                    contact_person="Sarah Johnson",
                    email="sarah@gts.com",
                    phone="+1-555-987-6543",
                    website="https://gts.com",
                    is_active=True
                )
            ]
            
            for agency in agencies:
                db.add(agency)
            
            db.commit()
            print("✅ Sample data added successfully")
        else:
            print("✅ Database already contains data")
            
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("🎉 Database initialization completed!")
    print("\n📋 Sample Users Created:")
    print("   Admin: admin@hrms.com / admin123")
    print("   HR SPOC: hr.spoc@company.com / hr123")
    print("   Employer: employer@company.com / emp123")
    print("   Recruiter: recruiter@company.com / rec123")

if __name__ == "__main__":
    init_database() 