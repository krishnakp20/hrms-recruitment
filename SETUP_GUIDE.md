# 🚀 HRMS Recruitment System - Complete Setup Guide

## **Quick Start - Both Backend & Frontend**

### **Step 1: Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Create .env file for backend
echo "DATABASE_URL=mysql+pymysql://username:password@localhost:3306/hrms_db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
echo "ALGORITHM=HS256" >> .env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=30" >> .env
echo "HOST=0.0.0.0" >> .env
echo "PORT=8000" >> .env
echo "DEBUG=True" >> .env
echo "ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000" >> .env

# Start the backend server
python main.py
# OR
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Step 2: Frontend Setup**

```bash
# Open a new terminal window
# Navigate to frontend directory
cd frontend

# Create .env file for frontend
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
echo "VITE_APP_NAME=HRMS Recruitment System" >> .env

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

## **Access Points**

Once both servers are running:

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## **Default Login Credentials**

- **Email**: admin@hrms.com
- **Password**: admin123

## **Testing the System**

### **Option 1: Manual Testing**

1. **Open your browser** and go to http://localhost:3000
2. **Login** with the credentials above
3. **Navigate** through the different sections:
   - Dashboard
   - Jobs
   - Candidates
   - Applications
   - Employees

### **Option 2: API Testing**

```bash
# Test the API directly
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hrms.com", "password": "admin123"}'
```

### **Option 3: Automated Testing**

```bash
# Run the comprehensive test suite
cd backend
python test_recruitment_system.py
```

## **Troubleshooting**

### **Backend Issues**

1. **Python not found**: Install Python 3.8+ from python.org
2. **Dependencies missing**: Run `pip install -r requirements.txt`
3. **Database connection**: Make sure MySQL is running and configured
4. **Port already in use**: Change the port in .env file

### **Frontend Issues**

1. **Node.js not found**: Install Node.js from nodejs.org
2. **Dependencies missing**: Run `npm install`
3. **Port 3000 in use**: The dev server will automatically use the next available port
4. **API connection**: Make sure backend is running on port 8000

### **Common Issues**

1. **CORS errors**: Backend is configured to allow localhost:3000
2. **Authentication errors**: Check that the backend is running
3. **Database errors**: Ensure MySQL is running and the database exists

## **Development Workflow**

### **Backend Development**

```bash
cd backend
# Start with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend Development**

```bash
cd frontend
# Start with auto-reload
npm run dev
```

### **Database Management**

```bash
# Create database
mysql -u root -p
CREATE DATABASE hrms_db;
USE hrms_db;

# Run schema
mysql -u root -p hrms_db < ../db/schema.sql
```

## **Features Available**

### **Job Management**
- Create job openings
- Submit for approval
- Approve jobs
- Activate jobs
- Multi-channel posting

### **Candidate Management**
- Add candidates
- Search and filter
- Pool management
- WhatsApp integration

### **Application Tracking**
- Track applications
- Schedule interviews
- Update status
- Add notes

### **Dashboard Analytics**
- Recruitment overview
- Recent activities
- Performance metrics
- Source analysis

## **API Endpoints**

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token

### **Jobs**
- `GET /jobs` - List jobs
- `POST /jobs` - Create job
- `PUT /jobs/{id}` - Update job
- `DELETE /jobs/{id}` - Delete job

### **Candidates**
- `GET /candidates` - List candidates
- `POST /candidates` - Create candidate
- `PUT /candidates/{id}` - Update candidate
- `DELETE /candidates/{id}` - Delete candidate

### **Applications**
- `GET /applications` - List applications
- `POST /applications` - Create application
- `PUT /applications/{id}` - Update application

### **Dashboard**
- `GET /dashboard/recruitment-overview` - Overview stats
- `GET /dashboard/recent-activities` - Recent activities
- `GET /dashboard/pending-approvals` - Pending approvals

## **Next Steps**

1. **Explore the UI**: Navigate through all sections
2. **Test the workflow**: Create a job → Add candidates → Process applications
3. **Check the API**: Visit http://localhost:8000/docs for interactive API docs
4. **Run tests**: Execute the test suite to verify everything works
5. **Customize**: Modify the system according to your needs

## **Support**

If you encounter any issues:

1. **Check the logs**: Both frontend and backend will show error messages
2. **Verify connections**: Ensure both servers are running
3. **Check the API**: Test endpoints directly at http://localhost:8000/docs
4. **Review the code**: All source code is well-documented

---

**🎉 Your HRMS Recruitment System is now ready!**

Access the application at: **http://localhost:3000** 