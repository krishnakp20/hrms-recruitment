# Installation Guide

This guide provides step-by-step instructions for installing and setting up the HRMS Recruitment System.

## 📋 Prerequisites

Before installing the HRMS system, ensure you have the following software installed:

### Required Software
- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd hrms-recruitment

# Verify the project structure
ls -la
```

### Step 2: Database Setup

#### 2.1 Install MySQL
- **Windows**: Download and install from [MySQL official website](https://dev.mysql.com/downloads/mysql/)
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

#### 2.2 Create Database and Tables

```bash
# Start MySQL service
# Windows: MySQL service should start automatically
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Access MySQL as root
mysql -u root -p

# Create database and import schema
mysql -u root -p < db/schema.sql
```

#### 2.3 Verify Database Setup

```sql
-- Connect to MySQL and verify
mysql -u root -p
USE hrms_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

### Step 3: Backend Setup

#### 3.1 Navigate to Backend Directory

```bash
cd backend
```

#### 3.2 Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 3.3 Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

#### 3.4 Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your database credentials
# Use your preferred text editor
```

**Example .env configuration:**
```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/hrms_db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HOST=0.0.0.0
PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### 3.5 Test Backend Installation

```bash
# Start the backend server
python main.py

# The server should start on http://localhost:8000
# You can test the API at http://localhost:8000/docs
```

### Step 4: Frontend Setup

#### 4.1 Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

#### 4.2 Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

#### 4.3 Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file
```

**Example .env configuration:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=HRMS Recruitment System
```

#### 4.4 Test Frontend Installation

```bash
# Start development server
npm run dev

# The application should open at http://localhost:3000
```

## ✅ Verification

### Backend Verification
1. Open http://localhost:8000 in your browser
2. You should see: `{"message": "HRMS Recruitment API", "version": "1.0.0"}`
3. Open http://localhost:8000/docs for API documentation

### Frontend Verification
1. Open http://localhost:3000 in your browser
2. You should see the HRMS login page
3. Use default credentials:
   - Email: `admin@hrms.com`
   - Password: `admin123`

### Database Verification
```sql
-- Connect to MySQL and verify data
mysql -u root -p
USE hrms_db;
SELECT * FROM users;
SELECT * FROM employees;
SELECT * FROM candidates;
SELECT * FROM jobs;
SELECT * FROM applications;
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Problem**: `Can't connect to MySQL server`
**Solution**:
```bash
# Check if MySQL is running
# Windows: Check Services app
# macOS: brew services list
# Linux: sudo systemctl status mysql

# Start MySQL if not running
# Windows: Start MySQL service
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

#### 2. Python Dependencies Error
**Problem**: `ModuleNotFoundError`
**Solution**:
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. Node.js Dependencies Error
**Problem**: `npm ERR!`
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Already in Use
**Problem**: `Address already in use`
**Solution**:
```bash
# Find process using the port
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000

# Kill the process or change port in .env
```

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [Development Guide](./development-guide.md)
3. Create an issue in the project repository
4. Contact the development team

## 🎉 Next Steps

After successful installation:

1. Read the [User Manual](./user-manual.md) to learn how to use the system
2. Review the [Admin Guide](./admin-guide.md) for administrative functions
3. Check the [API Documentation](./api-documentation.md) for integration options
4. Explore the [Feature Guide](./feature-guide.md) for detailed feature explanations

---

*Last updated: [Current Date]*
*Version: 1.0.0* 