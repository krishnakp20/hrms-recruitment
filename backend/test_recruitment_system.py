import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.user import UserRole

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test database
Base.metadata.create_all(bind=engine)

# Test data
test_users = {
    "admin": {
        "email": "admin@test.com",
        "username": "admin",
        "password": "admin123",
        "full_name": "Admin User",
        "role": UserRole.ADMIN
    },
    "hr_spoc": {
        "email": "hr@test.com",
        "username": "hr_spoc",
        "password": "hr123",
        "full_name": "HR SPOC",
        "role": UserRole.HR_SPOC
    },
    "employer": {
        "email": "employer@test.com",
        "username": "employer",
        "password": "emp123",
        "full_name": "Employer User",
        "role": UserRole.EMPLOYER
    },
    "recruiter": {
        "email": "recruiter@test.com",
        "username": "recruiter",
        "password": "rec123",
        "full_name": "Recruiter User",
        "role": UserRole.RECRUITER
    }
}

test_job = {
    "position_title": "Senior Frontend Developer",
    "position_code": "FE001",
    "level": "Senior",
    "grade": "L3",
    "department_id": 1,
    "sub_department": "Frontend Development",
    "process": "Agile Development",
    "reporting_to_title": "Engineering Manager",
    "reporting_to_manager": "John Doe",
    "location_type": "hybrid",
    "location_details": "San Francisco, CA",
    "required_skills": "React, TypeScript, 3+ years experience",
    "experience_level": "3-5 years",
    "job_description": "We are looking for an experienced Frontend Developer to join our team.",
    "job_specification": "Detailed job specification...",
    "number_of_vacancies": 2,
    "compensation_min": 120000,
    "compensation_max": 150000,
    "employment_type": "Full-time",
    "hiring_deadline": "2024-06-30",
    "approval_authority": "HR Director",
    "recruiter_id": 3,
    "workflow_template_id": 1,
    "recruitment_agency_id": 1
}

test_candidate = {
    "first_name": "Alex",
    "last_name": "Thompson",
    "email": "alex.thompson@email.com",
    "phone": "+1-555-123-4567",
    "location_state": "California",
    "location_city": "San Francisco",
    "location_area": "Downtown",
    "location_pincode": "94102",
    "education_qualification_short": "B.Tech",
    "education_qualification_detailed": "Bachelor of Technology in Computer Science from Stanford University",
    "experience_years": 3,
    "experience_details": "3 years of experience in React, TypeScript, and modern frontend technologies",
    "notice_period": 30,
    "current_compensation": 110000,
    "expected_compensation": 130000,
    "source": "Job Portal",
    "source_details": "Indeed.com"
}

test_application = {
    "candidate_id": 1,
    "job_id": 1,
    "cover_letter": "I am excited to apply for this position...",
    "resume_url": "/uploads/resumes/1_resume.pdf",
    "notes": "Strong candidate with relevant experience"
}

class TestRecruitmentSystem:
    """Comprehensive test suite for the recruitment system"""
    
    def setup_method(self):
        """Setup test database and create test data"""
        # Clear database
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
        # Create test client
        self.client = TestClient(app)
        
        # Create test users and get tokens
        self.tokens = {}
        for role, user_data in test_users.items():
            # Create user (simplified for testing)
            self.tokens[role] = create_access_token(data={"sub": user_data["email"]})

    def test_1_authentication(self):
        """Test authentication endpoints"""
        print("\n🧪 Testing Authentication...")
        
        # Test login
        response = self.client.post("/auth/login", json={
            "username": "admin@test.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("✅ Authentication test passed")

    def test_2_job_creation_workflow(self):
        """Test complete job creation workflow"""
        print("\n🧪 Testing Job Creation Workflow...")
        
        # Test job creation
        headers = {"Authorization": f"Bearer {self.tokens['employer']}"}
        response = self.client.post("/jobs/", json=test_job, headers=headers)
        assert response.status_code == 200
        job_id = response.json()["id"]
        print(f"✅ Job created with ID: {job_id}")
        
        # Test job submission for approval
        response = self.client.post(f"/jobs/{job_id}/submit-for-approval", headers=headers)
        assert response.status_code == 200
        print("✅ Job submitted for approval")
        
        # Test job approval (HR SPOC)
        headers = {"Authorization": f"Bearer {self.tokens['hr_spoc']}"}
        response = self.client.post(f"/jobs/{job_id}/approve", headers=headers)
        assert response.status_code == 200
        print("✅ Job approved")
        
        # Test job activation
        response = self.client.post(f"/jobs/{job_id}/activate", headers=headers)
        assert response.status_code == 200
        print("✅ Job activated")

    def test_3_department_management(self):
        """Test department management"""
        print("\n🧪 Testing Department Management...")
        
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        
        # Create department
        department_data = {
            "name": "Engineering",
            "sub_department": "Backend Development"
        }
        response = self.client.post("/jobs/departments/", json=department_data, headers=headers)
        assert response.status_code == 200
        print("✅ Department created")
        
        # Get departments
        response = self.client.get("/jobs/departments/", headers=headers)
        assert response.status_code == 200
        departments = response.json()
        assert len(departments) > 0
        print("✅ Departments retrieved")

    def test_4_workflow_management(self):
        """Test recruitment workflow management"""
        print("\n🧪 Testing Workflow Management...")
        
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        
        # Create workflow
        workflow_data = {
            "name": "Standard Engineering",
            "description": "Standard workflow for engineering positions",
            "steps": '["Screening", "Technical Interview", "HR Interview", "Final Round", "Offer"]',
            "is_active": True
        }
        response = self.client.post("/jobs/workflows/", json=workflow_data, headers=headers)
        assert response.status_code == 200
        print("✅ Workflow created")
        
        # Get workflows
        response = self.client.get("/jobs/workflows/", headers=headers)
        assert response.status_code == 200
        workflows = response.json()
        assert len(workflows) > 0
        print("✅ Workflows retrieved")

    def test_5_agency_management(self):
        """Test recruitment agency management"""
        print("\n🧪 Testing Agency Management...")
        
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        
        # Create agency
        agency_data = {
            "name": "TechRecruit Pro",
            "contact_person": "John Smith",
            "email": "john@techrecruitpro.com",
            "phone": "+1-555-123-4567",
            "website": "https://techrecruitpro.com",
            "is_active": True
        }
        response = self.client.post("/jobs/agencies/", json=agency_data, headers=headers)
        assert response.status_code == 200
        print("✅ Agency created")
        
        # Get agencies
        response = self.client.get("/jobs/agencies/", headers=headers)
        assert response.status_code == 200
        agencies = response.json()
        assert len(agencies) > 0
        print("✅ Agencies retrieved")

    def test_6_candidate_management(self):
        """Test candidate management"""
        print("\n🧪 Testing Candidate Management...")
        
        headers = {"Authorization": f"Bearer {self.tokens['recruiter']}"}
        
        # Create candidate
        response = self.client.post("/candidates/", json=test_candidate, headers=headers)
        assert response.status_code == 200
        candidate_id = response.json()["id"]
        print(f"✅ Candidate created with ID: {candidate_id}")
        
        # Get candidates
        response = self.client.get("/candidates/", headers=headers)
        assert response.status_code == 200
        candidates = response.json()
        assert len(candidates) > 0
        print("✅ Candidates retrieved")
        
        # Add to pool
        response = self.client.post(f"/candidates/{candidate_id}/add-to-pool", headers=headers)
        assert response.status_code == 200
        print("✅ Candidate added to pool")
        
        # Get pool candidates
        response = self.client.get("/candidates/pool/", headers=headers)
        assert response.status_code == 200
        pool_candidates = response.json()
        assert len(pool_candidates) > 0
        print("✅ Pool candidates retrieved")

    def test_7_whatsapp_integration(self):
        """Test WhatsApp integration"""
        print("\n🧪 Testing WhatsApp Integration...")
        
        headers = {"Authorization": f"Bearer {self.tokens['recruiter']}"}
        
        # Create WhatsApp communication
        communication_data = {
            "phone_number": "+1-555-123-4567",
            "message_content": "Hi Alex, we would like to schedule an interview...",
            "message_type": "Interview Schedule",
            "status": "Pending"
        }
        response = self.client.post("/candidates/1/whatsapp/", json=communication_data, headers=headers)
        assert response.status_code == 200
        communication_id = response.json()["id"]
        print(f"✅ WhatsApp communication created with ID: {communication_id}")
        
        # Send WhatsApp message
        response = self.client.post(f"/candidates/1/whatsapp/{communication_id}/send", headers=headers)
        assert response.status_code == 200
        print("✅ WhatsApp message sent")

    def test_8_application_management(self):
        """Test application management"""
        print("\n🧪 Testing Application Management...")
        
        headers = {"Authorization": f"Bearer {self.tokens['recruiter']}"}
        
        # Create application
        response = self.client.post("/applications/", json=test_application, headers=headers)
        assert response.status_code == 200
        application_id = response.json()["id"]
        print(f"✅ Application created with ID: {application_id}")
        
        # Update application
        update_data = {
            "status": "Shortlisted",
            "recruiter_notes": "Excellent technical skills, scheduled for interview",
            "interview_scheduled_at": "2024-01-20T14:00:00Z"
        }
        response = self.client.put(f"/applications/{application_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        print("✅ Application updated")

    def test_9_job_posting_channels(self):
        """Test job posting channels"""
        print("\n🧪 Testing Job Posting Channels...")
        
        headers = {"Authorization": f"Bearer {self.tokens['hr_spoc']}"}
        
        # Create posting channel
        channel_data = {
            "channel_type": "Job Portal",
            "channel_name": "Indeed",
            "posting_url": "https://indeed.com/job/123",
            "status": "Pending"
        }
        response = self.client.post("/jobs/1/posting-channels/", json=channel_data, headers=headers)
        assert response.status_code == 200
        channel_id = response.json()["id"]
        print(f"✅ Posting channel created with ID: {channel_id}")
        
        # Publish job to channel
        response = self.client.post(f"/jobs/1/posting-channels/{channel_id}/publish", headers=headers)
        assert response.status_code == 200
        print("✅ Job published to channel")

    def test_10_dashboard_analytics(self):
        """Test dashboard and analytics"""
        print("\n🧪 Testing Dashboard Analytics...")
        
        headers = {"Authorization": f"Bearer {self.tokens['hr_spoc']}"}
        
        # Test recruitment overview
        response = self.client.get("/dashboard/recruitment-overview", headers=headers)
        assert response.status_code == 200
        overview = response.json()
        assert "jobs" in overview
        assert "candidates" in overview
        assert "applications" in overview
        print("✅ Recruitment overview retrieved")
        
        # Test recent activities
        response = self.client.get("/dashboard/recent-activities", headers=headers)
        assert response.status_code == 200
        print("✅ Recent activities retrieved")
        
        # Test pending approvals
        response = self.client.get("/dashboard/pending-approvals", headers=headers)
        assert response.status_code == 200
        print("✅ Pending approvals retrieved")
        
        # Test candidate pool stats
        response = self.client.get("/dashboard/candidate-pool-stats", headers=headers)
        assert response.status_code == 200
        print("✅ Candidate pool stats retrieved")

    def test_11_search_and_filtering(self):
        """Test search and filtering functionality"""
        print("\n🧪 Testing Search and Filtering...")
        
        headers = {"Authorization": f"Bearer {self.tokens['recruiter']}"}
        
        # Test candidate search
        response = self.client.get("/candidates/search/?query=Alex&skills=React&experience_min=2&experience_max=5", headers=headers)
        assert response.status_code == 200
        print("✅ Candidate search working")
        
        # Test job filtering
        response = self.client.get("/jobs/?status=Active&department_id=1", headers=headers)
        assert response.status_code == 200
        print("✅ Job filtering working")

    def test_12_role_based_access(self):
        """Test role-based access control"""
        print("\n🧪 Testing Role-Based Access Control...")
        
        # Test employer can create jobs
        headers = {"Authorization": f"Bearer {self.tokens['employer']}"}
        response = self.client.post("/jobs/", json=test_job, headers=headers)
        assert response.status_code == 200
        print("✅ Employer can create jobs")
        
        # Test recruiter can manage candidates
        headers = {"Authorization": f"Bearer {self.tokens['recruiter']}"}
        response = self.client.post("/candidates/", json=test_candidate, headers=headers)
        assert response.status_code == 200
        print("✅ Recruiter can manage candidates")
        
        # Test HR SPOC can approve jobs
        headers = {"Authorization": f"Bearer {self.tokens['hr_spoc']}"}
        response = self.client.post("/jobs/1/approve", headers=headers)
        assert response.status_code == 200
        print("✅ HR SPOC can approve jobs")

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Comprehensive Recruitment System Test")
    print("=" * 60)
    
    test_suite = TestRecruitmentSystem()
    
    # Run all tests
    test_methods = [
        test_suite.test_1_authentication,
        test_suite.test_2_job_creation_workflow,
        test_suite.test_3_department_management,
        test_suite.test_4_workflow_management,
        test_suite.test_5_agency_management,
        test_suite.test_6_candidate_management,
        test_suite.test_7_whatsapp_integration,
        test_suite.test_8_application_management,
        test_suite.test_9_job_posting_channels,
        test_suite.test_10_dashboard_analytics,
        test_suite.test_11_search_and_filtering,
        test_suite.test_12_role_based_access
    ]
    
    passed = 0
    failed = 0
    
    for test_method in test_methods:
        try:
            test_method()
            passed += 1
        except Exception as e:
            print(f"❌ Test failed: {test_method.__name__} - {str(e)}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Recruitment system is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed, failed

if __name__ == "__main__":
    run_comprehensive_test() 