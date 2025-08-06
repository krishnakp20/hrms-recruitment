# HRMS Recruitment System Testing Guide

## 🧪 **Complete Testing Guide**

This guide provides comprehensive instructions for testing the HRMS Recruitment & Onboarding system.

## **Table of Contents**

1. [Setup and Installation](#setup-and-installation)
2. [Database Setup](#database-setup)
3. [Automated Testing](#automated-testing)
4. [Manual Testing](#manual-testing)
5. [API Testing](#api-testing)
6. [Frontend Testing](#frontend-testing)
7. [Integration Testing](#integration-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Troubleshooting](#troubleshooting)

## **Setup and Installation**

### **Prerequisites**

```bash
# Install Python 3.8+
python --version

# Install MySQL/PostgreSQL
mysql --version

# Install Node.js (for frontend)
node --version
npm --version
```

### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp env.example .env
# Edit .env with your database credentials
```

### **Database Setup**

```bash
# Create database
mysql -u root -p
CREATE DATABASE hrms_db;
USE hrms_db;

# Run schema
mysql -u root -p hrms_db < ../db/schema.sql

# Or use the Python script
python -c "
from app.core.database import engine
from app.models import *
from db.schema import create_tables
create_tables(engine)
"
```

### **Start the Server**

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use the provided script
python run.py
```

## **Automated Testing**

### **Run Comprehensive Test Suite**

```bash
# Navigate to backend directory
cd backend

# Run all tests
python test_recruitment_system.py

# Run with pytest
pytest test_recruitment_system.py -v

# Run specific test
python -c "from test_recruitment_system import TestRecruitmentSystem; TestRecruitmentSystem().test_job_creation_workflow()"
```

### **Test Output Example**

```
🚀 Starting Comprehensive Recruitment System Test
============================================================

🧪 Testing Authentication...
✅ Authentication test passed

🧪 Testing Job Creation Workflow...
✅ Job created with ID: 1
✅ Job submitted for approval
✅ Job approved
✅ Job activated

🧪 Testing Department Management...
✅ Department created
✅ Departments retrieved

🧪 Testing Workflow Management...
✅ Workflow created
✅ Workflows retrieved

🧪 Testing Agency Management...
✅ Agency created
✅ Agencies retrieved

🧪 Testing Candidate Management...
✅ Candidate created with ID: 1
✅ Candidate added to pool
✅ Pool candidates retrieved

🧪 Testing WhatsApp Integration...
✅ WhatsApp communication created with ID: 1
✅ WhatsApp message sent

🧪 Testing Application Management...
✅ Application created with ID: 1
✅ Application updated

🧪 Testing Job Posting Channels...
✅ Posting channel created with ID: 1
✅ Job published to channel

🧪 Testing Dashboard Analytics...
✅ Recruitment overview retrieved
✅ Recent activities retrieved
✅ Pending approvals retrieved
✅ Candidate pool stats retrieved

🧪 Testing Search and Filtering...
✅ Candidate search working
✅ Job filtering working

🧪 Testing Role-Based Access Control...
✅ Employer can create jobs
✅ Recruiter can manage candidates
✅ HR SPOC can approve jobs

============================================================
📊 Test Results: 12 passed, 0 failed
🎉 All tests passed! Recruitment system is working correctly.
```

## **Manual Testing**

### **Run Manual Test Script**

```bash
# Navigate to backend directory
cd backend

# Run manual test script
python manual_test.py
```

### **Manual Test Steps**

#### **1. Authentication Testing**

```bash
# Test login for different roles
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@hrms.com", "password": "admin123"}'
```

#### **2. Job Creation Workflow**

```bash
# 1. Create job as employer
curl -X POST "http://localhost:8000/api/v1/jobs/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position_title": "Senior Frontend Developer",
    "position_code": "FE001",
    "employment_type": "Full-time"
  }'

# 2. Submit for approval
curl -X POST "http://localhost:8000/api/v1/jobs/1/submit-for-approval" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Approve job (HR SPOC)
curl -X POST "http://localhost:8000/api/v1/jobs/1/approve" \
  -H "Authorization: Bearer HR_TOKEN"

# 4. Activate job
curl -X POST "http://localhost:8000/api/v1/jobs/1/activate" \
  -H "Authorization: Bearer HR_TOKEN"
```

#### **3. Candidate Management**

```bash
# Create candidate
curl -X POST "http://localhost:8000/api/v1/candidates/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alex",
    "last_name": "Thompson",
    "email": "alex@example.com",
    "phone": "+1-555-123-4567"
  }'

# Add to pool
curl -X POST "http://localhost:8000/api/v1/candidates/1/add-to-pool" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get pool candidates
curl -X GET "http://localhost:8000/api/v1/candidates/pool/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **4. WhatsApp Integration**

```bash
# Create WhatsApp communication
curl -X POST "http://localhost:8000/api/v1/candidates/1/whatsapp/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1-555-123-4567",
    "message_content": "Hi Alex, we would like to schedule an interview...",
    "message_type": "Interview Schedule"
  }'

# Send WhatsApp message
curl -X POST "http://localhost:8000/api/v1/candidates/1/whatsapp/1/send" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **5. Dashboard Analytics**

```bash
# Get recruitment overview
curl -X GET "http://localhost:8000/api/v1/dashboard/recruitment-overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get recent activities
curl -X GET "http://localhost:8000/api/v1/dashboard/recent-activities" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get candidate pool stats
curl -X GET "http://localhost:8000/api/v1/dashboard/candidate-pool-stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## **API Testing**

### **Using Postman**

1. **Import Collection**
   - Download the Postman collection from `docs/postman_collection.json`
   - Import into Postman

2. **Set Environment Variables**
   ```
   BASE_URL: http://localhost:8000
   API_BASE: http://localhost:8000/api/v1
   TOKEN: (your JWT token)
   ```

3. **Test Authentication**
   - Run the "Login" request
   - Copy the access token to the environment variable

4. **Test All Endpoints**
   - Run the collection to test all endpoints
   - Check response status codes and data

### **Using curl**

```bash
# Test all endpoints with curl
./test_api_endpoints.sh
```

## **Frontend Testing**

### **Setup Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Test Frontend Features**

1. **Login Page**
   - Test login with different user roles
   - Test invalid credentials
   - Test password reset

2. **Dashboard**
   - Test dashboard loading
   - Test statistics display
   - Test navigation

3. **Job Management**
   - Test job creation form
   - Test job listing
   - Test job editing
   - Test approval workflow

4. **Candidate Management**
   - Test candidate creation
   - Test candidate search
   - Test pool management
   - Test WhatsApp integration

## **Integration Testing**

### **End-to-End Workflow Test**

```bash
# Run complete workflow test
python test_complete_workflow.py
```

This test covers:
1. User registration and login
2. Job creation and approval
3. Candidate sourcing and management
4. Application processing
5. Interview scheduling
6. Hiring decision

### **API Integration Test**

```bash
# Test API integration
python test_api_integration.py
```

## **Performance Testing**

### **Load Testing**

```bash
# Install locust
pip install locust

# Run load test
locust -f performance_test.py --host=http://localhost:8000
```

### **Database Performance**

```bash
# Test database queries
python test_database_performance.py
```

## **Security Testing**

### **Authentication Tests**

```bash
# Test JWT token validation
python test_security.py
```

### **Authorization Tests**

```bash
# Test role-based access
python test_authorization.py
```

## **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Issues**

```bash
# Check database connection
python -c "
from app.core.database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

#### **2. Authentication Issues**

```bash
# Check JWT token
python -c "
from app.core.security import verify_token
token = 'your_token_here'
try:
    payload = verify_token(token)
    print(f'Token valid: {payload}')
except Exception as e:
    print(f'Token invalid: {e}')
"
```

#### **3. API Endpoint Issues**

```bash
# Test API health
curl -X GET "http://localhost:8000/health"

# Test API docs
curl -X GET "http://localhost:8000/docs"
```

### **Debug Mode**

```bash
# Enable debug mode
export DEBUG=True
python run.py
```

### **Log Analysis**

```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

## **Test Data Management**

### **Create Test Data**

```bash
# Create sample data
python create_test_data.py
```

### **Reset Database**

```bash
# Reset to clean state
python reset_database.py
```

## **Continuous Integration**

### **GitHub Actions**

```yaml
# .github/workflows/test.yml
name: Test Recruitment System

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
      - name: Run tests
        run: |
          cd backend
          python test_recruitment_system.py
```

## **Test Reports**

### **Generate Test Report**

```bash
# Generate HTML report
pytest --html=test_report.html --self-contained-html

# Generate coverage report
pytest --cov=app --cov-report=html
```

### **View Reports**

- Open `test_report.html` in browser
- Open `htmlcov/index.html` for coverage report

## **Best Practices**

### **Testing Guidelines**

1. **Test Coverage**: Aim for 90%+ code coverage
2. **Test Isolation**: Each test should be independent
3. **Test Data**: Use realistic test data
4. **Error Handling**: Test error scenarios
5. **Performance**: Test with realistic load
6. **Security**: Test authentication and authorization
7. **Documentation**: Document test cases and scenarios

### **Test Maintenance**

1. **Regular Updates**: Update tests when features change
2. **Test Data**: Keep test data current
3. **Performance**: Monitor test execution time
4. **Coverage**: Maintain high coverage levels

---

**🎉 Happy Testing!**

For more information, refer to:
- [API Documentation](api-documentation.md)
- [User Manual](user-manual.md)
- [Development Guide](development-guide.md) 