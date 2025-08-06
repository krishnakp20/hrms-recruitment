#!/usr/bin/env python3
"""
Test dashboard endpoints
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate, CandidateStatus
from app.models.application import Application, ApplicationStatus
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def test_dashboard_data():
    """Test dashboard data generation"""
    print("🔍 Testing dashboard data generation...")
    
    db = SessionLocal()
    try:
        # Check if we have any data
        total_jobs = db.query(Job).count()
        total_candidates = db.query(Candidate).count()
        total_applications = db.query(Application).count()
        
        print(f"📊 Current data:")
        print(f"   Jobs: {total_jobs}")
        print(f"   Candidates: {total_candidates}")
        print(f"   Applications: {total_applications}")
        
        # Test stats calculation
        active_jobs = db.query(Job).filter(Job.status == JobStatus.ACTIVE).count()
        new_candidates = db.query(Candidate).filter(Candidate.status == CandidateStatus.NEW).count()
        total_applications = db.query(Application).count()
        
        print(f"📈 Stats:")
        print(f"   Active Jobs: {active_jobs}")
        print(f"   New Candidates: {new_candidates}")
        print(f"   Total Applications: {total_applications}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_dashboard_data()
    if success:
        print("\n✅ Dashboard data test completed!")
    else:
        print("\n❌ Dashboard data test failed!") 