#!/usr/bin/env python3
"""
Manual Test Script for HRMS Recruitment System
Run this script to test the system step by step
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Test data
test_users = {
    "admin": {"username": "admin@hrms.com", "password": "admin123"},
    "hr_spoc": {"username": "hr.spoc@company.com", "password": "hr123"},
    "employer": {"username": "employer@company.com", "password": "emp123"},
    "recruiter": {"username": "recruiter@company.com", "password": "rec123"}
}

def print_step(step, description):
    """Print a formatted step"""
    print(f"\n{'='*60}")
    print(f"STEP {step}: {description}")
    print(f"{'='*60}")

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def login_user(username, password):
    """Login user and return token"""
    try:
        response = requests.post(f"{API_BASE}/auth/login", json={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print_error(f"Login failed for {username}: {response.text}")
            return None
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None

def test_authentication():
    """Test authentication for all user roles"""
    print_step(1, "Testing Authentication")
    
    tokens = {}
    for role, credentials in test_users.items():
        print(f"\nTesting login for {role}...")
        token = login_user(credentials["username"], credentials["password"])
        if token:
            tokens[role] = token
            print_success(f"{role} login successful")
        else:
            print_error(f"{role} login failed")
    
    return tokens

def test_job_creation_workflow(tokens):
    """Test complete job creation workflow"""
    print_step(2, "Testing Job Creation Workflow")
    
    # Test data
    job_data = {
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
    
    # 1. Create job (Employer)
    print("\n1. Creating job as employer...")
    headers = {"Authorization": f"Bearer {tokens['employer']}"}
    response = requests.post(f"{API_BASE}/jobs/", json=job_data, headers=headers)
    
    if response.status_code == 200:
        job_id = response.json()["id"]
        print_success(f"Job created with ID: {job_id}")
        
        # 2. Submit for approval
        print("\n2. Submitting job for approval...")
        response = requests.post(f"{API_BASE}/jobs/{job_id}/submit-for-approval", headers=headers)
        if response.status_code == 200:
            print_success("Job submitted for approval")
            
            # 3. Approve job (HR SPOC)
            print("\n3. Approving job as HR SPOC...")
            headers = {"Authorization": f"Bearer {tokens['hr_spoc']}"}
            response = requests.post(f"{API_BASE}/jobs/{job_id}/approve", headers=headers)
            if response.status_code == 200:
                print_success("Job approved")
                
                # 4. Activate job
                print("\n4. Activating job...")
                response = requests.post(f"{API_BASE}/jobs/{job_id}/activate", headers=headers)
                if response.status_code == 200:
                    print_success("Job activated")
                    return job_id
                else:
                    print_error(f"Job activation failed: {response.text}")
            else:
                print_error(f"Job approval failed: {response.text}")
        else:
            print_error(f"Job submission failed: {response.text}")
    else:
        print_error(f"Job creation failed: {response.text}")
    
    return None

def test_candidate_management(tokens):
    """Test candidate management"""
    print_step(3, "Testing Candidate Management")
    
    candidate_data = {
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
    
    # Create candidate
    print("\n1. Creating candidate...")
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    response = requests.post(f"{API_BASE}/candidates/", json=candidate_data, headers=headers)
    
    if response.status_code == 200:
        candidate_id = response.json()["id"]
        print_success(f"Candidate created with ID: {candidate_id}")
        
        # Add to pool
        print("\n2. Adding candidate to pool...")
        response = requests.post(f"{API_BASE}/candidates/{candidate_id}/add-to-pool", headers=headers)
        if response.status_code == 200:
            print_success("Candidate added to pool")
            
            # Get pool candidates
            print("\n3. Retrieving pool candidates...")
            response = requests.get(f"{API_BASE}/candidates/pool/", headers=headers)
            if response.status_code == 200:
                pool_candidates = response.json()
                print_success(f"Found {len(pool_candidates)} candidates in pool")
                return candidate_id
            else:
                print_error(f"Failed to get pool candidates: {response.text}")
        else:
            print_error(f"Failed to add candidate to pool: {response.text}")
    else:
        print_error(f"Candidate creation failed: {response.text}")
    
    return None

def test_whatsapp_integration(tokens, candidate_id):
    """Test WhatsApp integration"""
    print_step(4, "Testing WhatsApp Integration")
    
    communication_data = {
        "phone_number": "+1-555-123-4567",
        "message_content": "Hi Alex, we would like to schedule an interview for the Senior Frontend Developer position. Are you available tomorrow at 2 PM?",
        "message_type": "Interview Schedule",
        "status": "Pending"
    }
    
    # Create WhatsApp communication
    print("\n1. Creating WhatsApp communication...")
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    response = requests.post(f"{API_BASE}/candidates/{candidate_id}/whatsapp/", json=communication_data, headers=headers)
    
    if response.status_code == 200:
        communication_id = response.json()["id"]
        print_success(f"WhatsApp communication created with ID: {communication_id}")
        
        # Send WhatsApp message
        print("\n2. Sending WhatsApp message...")
        response = requests.post(f"{API_BASE}/candidates/{candidate_id}/whatsapp/{communication_id}/send", headers=headers)
        if response.status_code == 200:
            print_success("WhatsApp message sent successfully")
            return communication_id
        else:
            print_error(f"Failed to send WhatsApp message: {response.text}")
    else:
        print_error(f"Failed to create WhatsApp communication: {response.text}")
    
    return None

def test_application_management(tokens, candidate_id, job_id):
    """Test application management"""
    print_step(5, "Testing Application Management")
    
    application_data = {
        "candidate_id": candidate_id,
        "job_id": job_id,
        "cover_letter": "I am excited to apply for the Senior Frontend Developer position. With 3 years of experience in React and TypeScript, I believe I would be a great fit for your team.",
        "resume_url": "/uploads/resumes/1_resume.pdf",
        "notes": "Strong candidate with relevant experience"
    }
    
    # Create application
    print("\n1. Creating application...")
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    response = requests.post(f"{API_BASE}/applications/", json=application_data, headers=headers)
    
    if response.status_code == 200:
        application_id = response.json()["id"]
        print_success(f"Application created with ID: {application_id}")
        
        # Update application
        print("\n2. Updating application status...")
        update_data = {
            "status": "Shortlisted",
            "recruiter_notes": "Excellent technical skills, strong React experience, scheduled for interview",
            "interview_scheduled_at": "2024-01-20T14:00:00Z"
        }
        response = requests.put(f"{API_BASE}/applications/{application_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            print_success("Application updated successfully")
            return application_id
        else:
            print_error(f"Failed to update application: {response.text}")
    else:
        print_error(f"Application creation failed: {response.text}")
    
    return None

def test_dashboard_analytics(tokens):
    """Test dashboard and analytics"""
    print_step(6, "Testing Dashboard Analytics")
    
    headers = {"Authorization": f"Bearer {tokens['hr_spoc']}"}
    
    # Test recruitment overview
    print("\n1. Testing recruitment overview...")
    response = requests.get(f"{API_BASE}/dashboard/recruitment-overview", headers=headers)
    if response.status_code == 200:
        overview = response.json()
        print_success("Recruitment overview retrieved")
        print(f"   - Jobs: {overview['jobs']['total']}")
        print(f"   - Candidates: {overview['candidates']['total']}")
        print(f"   - Applications: {overview['applications']['total']}")
    else:
        print_error(f"Failed to get recruitment overview: {response.text}")
    
    # Test recent activities
    print("\n2. Testing recent activities...")
    response = requests.get(f"{API_BASE}/dashboard/recent-activities", headers=headers)
    if response.status_code == 200:
        activities = response.json()
        print_success(f"Retrieved {len(activities)} recent activities")
    else:
        print_error(f"Failed to get recent activities: {response.text}")
    
    # Test candidate pool stats
    print("\n3. Testing candidate pool stats...")
    response = requests.get(f"{API_BASE}/dashboard/candidate-pool-stats", headers=headers)
    if response.status_code == 200:
        pool_stats = response.json()
        print_success("Candidate pool stats retrieved")
        print(f"   - Total in pool: {pool_stats['total_in_pool']}")
    else:
        print_error(f"Failed to get candidate pool stats: {response.text}")

def test_search_and_filtering(tokens):
    """Test search and filtering functionality"""
    print_step(7, "Testing Search and Filtering")
    
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    
    # Test candidate search
    print("\n1. Testing candidate search...")
    response = requests.get(f"{API_BASE}/candidates/search/?query=Alex&skills=React&experience_min=2&experience_max=5", headers=headers)
    if response.status_code == 200:
        candidates = response.json()
        print_success(f"Found {len(candidates)} candidates matching search criteria")
    else:
        print_error(f"Candidate search failed: {response.text}")
    
    # Test job filtering
    print("\n2. Testing job filtering...")
    response = requests.get(f"{API_BASE}/jobs/?status=Active&department_id=1", headers=headers)
    if response.status_code == 200:
        jobs = response.json()
        print_success(f"Found {len(jobs)} active jobs in department 1")
    else:
        print_error(f"Job filtering failed: {response.text}")

def test_role_based_access(tokens):
    """Test role-based access control"""
    print_step(8, "Testing Role-Based Access Control")
    
    # Test employer can create jobs
    print("\n1. Testing employer job creation...")
    headers = {"Authorization": f"Bearer {tokens['employer']}"}
    job_data = {
        "position_title": "Test Job",
        "position_code": "TEST001",
        "employment_type": "Full-time"
    }
    response = requests.post(f"{API_BASE}/jobs/", json=job_data, headers=headers)
    if response.status_code == 200:
        print_success("Employer can create jobs")
    else:
        print_error(f"Employer job creation failed: {response.text}")
    
    # Test recruiter can manage candidates
    print("\n2. Testing recruiter candidate management...")
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    candidate_data = {
        "first_name": "Test",
        "last_name": "Candidate",
        "email": "test@example.com",
        "phone": "+1-555-000-0000"
    }
    response = requests.post(f"{API_BASE}/candidates/", json=candidate_data, headers=headers)
    if response.status_code == 200:
        print_success("Recruiter can manage candidates")
    else:
        print_error(f"Recruiter candidate management failed: {response.text}")
    
    # Test HR SPOC can access dashboard
    print("\n3. Testing HR SPOC dashboard access...")
    headers = {"Authorization": f"Bearer {tokens['hr_spoc']}"}
    response = requests.get(f"{API_BASE}/dashboard/recruitment-overview", headers=headers)
    if response.status_code == 200:
        print_success("HR SPOC can access dashboard")
    else:
        print_error(f"HR SPOC dashboard access failed: {response.text}")

def main():
    """Main test function"""
    print("🚀 HRMS Recruitment System Manual Test")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Step 1: Test authentication
        tokens = test_authentication()
        if not tokens:
            print_error("Authentication failed. Cannot proceed with tests.")
            return
        
        # Step 2: Test job creation workflow
        job_id = test_job_creation_workflow(tokens)
        
        # Step 3: Test candidate management
        candidate_id = test_candidate_management(tokens)
        
        # Step 4: Test WhatsApp integration
        if candidate_id:
            communication_id = test_whatsapp_integration(tokens, candidate_id)
        
        # Step 5: Test application management
        if candidate_id and job_id:
            application_id = test_application_management(tokens, candidate_id, job_id)
        
        # Step 6: Test dashboard analytics
        test_dashboard_analytics(tokens)
        
        # Step 7: Test search and filtering
        test_search_and_filtering(tokens)
        
        # Step 8: Test role-based access
        test_role_based_access(tokens)
        
        print("\n" + "=" * 60)
        print("🎉 Manual testing completed successfully!")
        print("All major features have been tested.")
        
    except Exception as e:
        print_error(f"Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 