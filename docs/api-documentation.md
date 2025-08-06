# HRMS Recruitment API Documentation

## Overview

This API provides comprehensive recruitment and onboarding functionality for the HRMS platform. It supports role-based access control, job management, candidate management, application tracking, and recruitment workflow management.

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **admin**: Full system access
- **hr_spoc**: HR Special Point of Contact with recruitment oversight
- **employer**: Can create and manage job openings
- **manager**: Can create and manage job openings
- **recruiter**: Can manage candidates and applications

## Base URL

```
http://localhost:8000/api/v1
```

## Endpoints

### Authentication

#### POST /auth/login
Login to get access token

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "full_name": "John Doe",
    "role": "hr_spoc"
  }
}
```

### Job Management

#### GET /jobs/
Get all jobs with optional filtering

**Query Parameters:**
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Number of records to return (default: 100)
- `status` (string): Filter by job status
- `department_id` (int): Filter by department

**Response:**
```json
[
  {
    "id": 1,
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
    "job_description": "We are looking for an experienced Frontend Developer...",
    "job_specification": "Detailed job specification...",
    "number_of_vacancies": 2,
    "compensation_min": 120000,
    "compensation_max": 150000,
    "employment_type": "Full-time",
    "hiring_deadline": "2024-06-30",
    "approval_authority": "HR Director",
    "recruiter_id": 3,
    "workflow_template_id": 1,
    "recruitment_agency_id": 1,
    "status": "Active",
    "is_remote": false,
    "created_by": 1,
    "approved_by": 2,
    "approved_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-10T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /jobs/
Create a new job opening

**Request Body:**
```json
{
  "position_title": "Senior Frontend Developer",
  "position_code": "FE002",
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
  "job_description": "We are looking for an experienced Frontend Developer...",
  "job_specification": "Detailed job specification...",
  "number_of_vacancies": 1,
  "compensation_min": 120000,
  "compensation_max": 150000,
  "employment_type": "Full-time",
  "hiring_deadline": "2024-06-30",
  "approval_authority": "HR Director",
  "recruiter_id": 3,
  "workflow_template_id": 1,
  "recruitment_agency_id": 1
}
```

#### POST /jobs/{job_id}/submit-for-approval
Submit a job for approval

#### POST /jobs/{job_id}/approve
Approve a job opening (HR SPOC/Admin only)

#### POST /jobs/{job_id}/activate
Activate a job opening (HR SPOC/Admin only)

### Department Management

#### GET /jobs/departments/
Get all departments

#### POST /jobs/departments/
Create a new department

**Request Body:**
```json
{
  "name": "Engineering",
  "sub_department": "Backend Development"
}
```

### Recruitment Workflow Management

#### GET /jobs/workflows/
Get all recruitment workflows

#### POST /jobs/workflows/
Create a new recruitment workflow

**Request Body:**
```json
{
  "name": "Standard Engineering",
  "description": "Standard workflow for engineering positions",
  "steps": "[\"Screening\", \"Technical Interview\", \"HR Interview\", \"Final Round\", \"Offer\"]",
  "is_active": true
}
```

### Recruitment Agency Management

#### GET /jobs/agencies/
Get all recruitment agencies

#### POST /jobs/agencies/
Create a new recruitment agency

**Request Body:**
```json
{
  "name": "TechRecruit Pro",
  "contact_person": "John Smith",
  "email": "john@techrecruitpro.com",
  "phone": "+1-555-123-4567",
  "website": "https://techrecruitpro.com",
  "is_active": true
}
```

### Job Posting Channel Management

#### GET /jobs/{job_id}/posting-channels/
Get all posting channels for a job

#### POST /jobs/{job_id}/posting-channels/
Create a new posting channel for a job

**Request Body:**
```json
{
  "channel_type": "Job Portal",
  "channel_name": "Indeed",
  "posting_url": "https://indeed.com/job/123",
  "status": "Pending"
}
```

#### POST /jobs/{job_id}/posting-channels/{channel_id}/publish
Publish a job to a specific channel

### Candidate Management

#### GET /candidates/
Get all candidates with optional filtering

**Query Parameters:**
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Number of records to return (default: 100)
- `status` (string): Filter by candidate status
- `source` (string): Filter by candidate source
- `is_in_pool` (boolean): Filter by pool status

**Response:**
```json
[
  {
    "id": 1,
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
    "resume_url": "/uploads/resumes/1_resume.pdf",
    "cover_letter": "I am excited to apply for this position...",
    "source": "Job Portal",
    "source_details": "Indeed.com",
    "status": "Shortlisted",
    "notes": "Strong technical skills, good cultural fit",
    "is_in_pool": false,
    "created_by": 2,
    "created_at": "2024-01-10T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /candidates/
Create a new candidate

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@email.com",
  "phone": "+1-555-123-4567",
  "location_state": "California",
  "location_city": "San Francisco",
  "location_area": "Downtown",
  "location_pincode": "94102",
  "education_qualification_short": "B.Tech",
  "education_qualification_detailed": "Bachelor of Technology in Computer Science",
  "experience_years": 3,
  "experience_details": "3 years of experience in React, TypeScript",
  "notice_period": 30,
  "current_compensation": 110000,
  "expected_compensation": 130000,
  "source": "Job Portal",
  "source_details": "Indeed.com"
}
```

### Candidate Pool Management

#### GET /candidates/pool/
Get all candidates in the pool

#### POST /candidates/{candidate_id}/add-to-pool
Add a candidate to the pool

#### POST /candidates/{candidate_id}/remove-from-pool
Remove a candidate from the pool

### WhatsApp Communication

#### GET /candidates/{candidate_id}/whatsapp/
Get all WhatsApp communications for a candidate

#### POST /candidates/{candidate_id}/whatsapp/
Create a new WhatsApp communication

**Request Body:**
```json
{
  "phone_number": "+1-555-123-4567",
  "message_content": "Hi Alex, we would like to schedule an interview...",
  "message_type": "Interview Schedule",
  "status": "Pending"
}
```

#### POST /candidates/{candidate_id}/whatsapp/{communication_id}/send
Send a WhatsApp message

### Resume Upload and Parsing

#### POST /candidates/{candidate_id}/upload-resume
Upload and parse a resume for a candidate

**Request Body:**
- `resume_file` (file): Resume file to upload

### Bulk Import from WhatsApp

#### POST /candidates/import-from-whatsapp
Import candidate data from WhatsApp

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1-555-123-4567",
  "experience": "3 years in React development",
  "education": "B.Tech in Computer Science"
}
```

### Candidate Search and Filtering

#### GET /candidates/search/
Search candidates with various filters

**Query Parameters:**
- `query` (string): Search query (required)
- `skills` (string): Comma-separated skills
- `experience_min` (int): Minimum experience years
- `experience_max` (int): Maximum experience years
- `location` (string): Location filter
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Number of records to return (default: 100)

### Application Management

#### GET /applications/
Get all applications with optional filtering

#### POST /applications/
Create a new application

**Request Body:**
```json
{
  "candidate_id": 1,
  "job_id": 1,
  "cover_letter": "I am excited to apply for this position...",
  "resume_url": "/uploads/resumes/1_resume.pdf",
  "notes": "Strong candidate with relevant experience"
}
```

#### PUT /applications/{application_id}
Update an application

**Request Body:**
```json
{
  "status": "Shortlisted",
  "recruiter_notes": "Excellent technical skills, scheduled for interview",
  "interview_scheduled_at": "2024-01-20T14:00:00Z"
}
```

### Dashboard

#### GET /dashboard/recruitment-overview
Get recruitment overview statistics

**Response:**
```json
{
  "jobs": {
    "total": 15,
    "active": 8,
    "pending_approval": 3,
    "draft": 4
  },
  "candidates": {
    "total": 150,
    "new": 45,
    "shortlisted": 30,
    "interviewed": 20,
    "in_pool": 25
  },
  "applications": {
    "total": 200,
    "applied": 80,
    "shortlisted": 50,
    "interviewed": 30,
    "hired": 15
  },
  "source_breakdown": [
    {"source": "Job Portal", "count": 80},
    {"source": "Internal Career Page", "count": 30},
    {"source": "Reference", "count": 25},
    {"source": "Social Media", "count": 15}
  ]
}
```

#### GET /dashboard/recent-activities
Get recent recruitment activities

#### GET /dashboard/pending-approvals
Get jobs pending approval

#### GET /dashboard/upcoming-interviews
Get upcoming interviews

#### GET /dashboard/candidate-pool-stats
Get candidate pool statistics

#### GET /dashboard/recruitment-funnel
Get recruitment funnel data

#### GET /dashboard/department-stats
Get recruitment statistics by department

#### GET /dashboard/recruiter-performance
Get recruiter performance metrics

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per user.

## Pagination

Most list endpoints support pagination using `skip` and `limit` parameters.

## Filtering

Many endpoints support filtering by various criteria. Check individual endpoint documentation for available filters.

## Sorting

Most endpoints return results sorted by creation date (newest first).

## File Uploads

File uploads (like resumes) should be sent as multipart/form-data.

## Webhooks

The API supports webhooks for real-time notifications. Contact the system administrator to configure webhooks.

## SDKs and Libraries

Official SDKs are available for:
- Python
- JavaScript/TypeScript
- Java
- .NET

## Support

For API support, contact:
- Email: api-support@company.com
- Documentation: https://docs.company.com/api
- Status Page: https://status.company.com 