# HRMS Recruitment & Onboarding System

A comprehensive recruitment and onboarding platform with role-based access control, automated workflows, and integrated communication channels.

## 🚀 **Quick Start**

### **Option 1: Automated Testing (Recommended)**

```bash
# Run the complete test suite
./test_recruitment_system.sh
```

This script will:
- ✅ Check prerequisites (Python, pip, MySQL)
- ✅ Setup virtual environment
- ✅ Install dependencies
- ✅ Setup database
- ✅ Start the server
- ✅ Run comprehensive tests
- ✅ Test all API endpoints

### **Option 2: Manual Setup**

```bash
# 1. Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Setup database
mysql -u root -p < ../db/schema.sql

# 3. Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Run tests
python test_recruitment_system.py
python manual_test.py
```

## 🧪 **Testing Guide**

### **Quick Test Commands**

```bash
# Run automated tests
cd backend
python test_recruitment_system.py

# Run manual tests
python manual_test.py

# Test specific functionality
python -c "from test_recruitment_system import TestRecruitmentSystem; TestRecruitmentSystem().test_job_creation_workflow()"
```

### **API Testing**

```bash
# Test authentication
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@hrms.com", "password": "admin123"}'

# Test job creation
curl -X POST "http://localhost:8000/api/v1/jobs/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position_title": "Test Job", "position_code": "TEST001", "employment_type": "Full-time"}'

# Test candidate creation
curl -X POST "http://localhost:8000/api/v1/candidates/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Alex", "last_name": "Thompson", "email": "alex@example.com", "phone": "+1-555-123-4567"}'
```

### **Test Coverage**

The system includes comprehensive tests for:

- ✅ **Authentication & Authorization**
- ✅ **Job Creation Workflow**
- ✅ **Department Management**
- ✅ **Recruitment Workflows**
- ✅ **Recruitment Agencies**
- ✅ **Candidate Management**
- ✅ **WhatsApp Integration**
- ✅ **Application Management**
- ✅ **Job Posting Channels**
- ✅ **Dashboard Analytics**
- ✅ **Search & Filtering**
- ✅ **Role-Based Access Control**

## 📋 **Features Implemented**

### **1. Job Opening Creation**
- Position title, code, level, grade
- Department and sub-department management
- Process and reporting structure
- Location types (onsite/remote/hybrid)
- Required skills and experience levels
- Compensation ranges and employment types
- Approval workflow (Draft → Pending → Approved → Active)

### **2. Recruitment Initiation**
- Multi-channel job posting
- Internal career page integration
- External job portals (Indeed, LinkedIn, Naukri.com)
- Social media channels
- Campus placements
- Employee referrals

### **3. Candidate Database Management**
- Comprehensive candidate profiles
- Location and contact information
- Education and experience details
- Compensation expectations
- Source tracking and tagging
- Candidate pool management
- Resume parsing and data extraction

### **4. WhatsApp Integration**
- Automated candidate communication
- Message templates and scheduling
- Delivery status tracking
- Bulk messaging capabilities

### **5. Application Management**
- Application tracking and status updates
- Interview scheduling and feedback
- Recruiter notes and assessments
- Hiring decision management

### **6. Dashboard & Analytics**
- Recruitment overview statistics
- Recent activities tracking
- Pending approvals management
- Candidate pool analytics
- Source effectiveness analysis
- Department-wise statistics
- Recruiter performance metrics

## 🔐 **Role-Based Access Control**

- **Admin**: Full system access
- **HR SPOC**: Recruitment oversight and approval
- **Employer/Manager**: Job creation and management
- **Recruiter**: Candidate and application management

## 📚 **Documentation**

- [API Documentation](docs/api-documentation.md)
- [User Manual](docs/user-manual.md)
- [Testing Guide](docs/testing-guide.md)
- [Development Guide](docs/development-guide.md)

## 🛠 **Technology Stack**

- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: MySQL/PostgreSQL
- **Authentication**: JWT tokens
- **Testing**: pytest, httpx
- **Documentation**: OpenAPI/Swagger

## 🧪 **Test Results Example**

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

🧪 Testing Candidate Management...
✅ Candidate created with ID: 1
✅ Candidate added to pool
✅ Pool candidates retrieved

🧪 Testing WhatsApp Integration...
✅ WhatsApp communication created with ID: 1
✅ WhatsApp message sent

🧪 Testing Dashboard Analytics...
✅ Recruitment overview retrieved
✅ Recent activities retrieved
✅ Candidate pool stats retrieved

============================================================
📊 Test Results: 12 passed, 0 failed
🎉 All tests passed! Recruitment system is working correctly.
```

## 🚀 **Access Points**

Once the server is running:

- **API Base URL**: http://localhost:8000/api/v1
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🎯 **Next Steps**

1. **Run the automated test script** to verify everything works
2. **Explore the API documentation** at http://localhost:8000/docs
3. **Test the complete workflow** using the manual test script
4. **Customize the system** according to your specific requirements

## 🤝 **Support**

For issues or questions:
- Check the [Testing Guide](docs/testing-guide.md) for troubleshooting
- Review the [API Documentation](docs/api-documentation.md) for endpoint details
- Refer to the [User Manual](docs/user-manual.md) for usage instructions

---

**�� Happy Testing!** 