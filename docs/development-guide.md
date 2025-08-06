# Development Guide

This guide provides comprehensive information for developers working on the HRMS Recruitment System.

## 📋 Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Development Workflow](#development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [API Development](#api-development)
7. [Frontend Development](#frontend-development)
8. [Database Development](#database-development)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🛠️ Development Environment Setup

### Prerequisites

Before setting up the development environment, ensure you have:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for version control)
- **VS Code** (recommended IDE)

### Backend Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd hrms-recruitment
```

#### 2. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your development settings
```

**Development .env example:**
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/hrms_db
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HOST=0.0.0.0
PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### 5. Database Setup
```bash
# Create database and tables
mysql -u root -p < ../db/schema.sql
```

#### 6. Run Backend
```bash
# Start development server with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

#### 1. Navigate to Frontend
```bash
cd frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your development settings
```

**Development .env example:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=HRMS Recruitment System
```

#### 4. Run Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── core/           # Core configuration and utilities
│   │   ├── config.py   # Settings and configuration
│   │   ├── database.py # Database connection
│   │   └── security.py # Authentication utilities
│   ├── models/         # SQLAlchemy models
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── candidate.py
│   │   ├── job.py
│   │   └── application.py
│   ├── schemas/        # Pydantic schemas
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── candidate.py
│   │   ├── job.py
│   │   ├── application.py
│   │   └── auth.py
│   ├── routers/        # API endpoints
│   │   ├── auth.py
│   │   ├── employees.py
│   │   ├── candidates.py
│   │   ├── jobs.py
│   │   ├── applications.py
│   │   └── dashboard.py
│   └── services/       # Business logic
├── main.py             # FastAPI application entry
├── requirements.txt    # Python dependencies
└── .env               # Environment variables
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   └── Layout.jsx
│   ├── pages/         # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── Candidates.jsx
│   │   ├── Jobs.jsx
│   │   ├── Applications.jsx
│   │   └── Login.jsx
│   ├── services/      # API services
│   │   └── api.js
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # App entry point
│   └── index.css      # Global styles
├── package.json       # Node.js dependencies
└── .env              # Environment variables
```

## 📝 Coding Standards

### Python (Backend)

#### Code Style
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Maximum line length: 88 characters
- Use type hints for all functions

#### Naming Conventions
```python
# Variables and functions: snake_case
user_name = "john_doe"
def get_user_by_id(user_id: int) -> User:
    pass

# Classes: PascalCase
class UserService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
```

#### Import Organization
```python
# Standard library imports
import os
from typing import List, Optional

# Third-party imports
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local imports
from app.core.database import get_db
from app.schemas.user import User
```

#### Error Handling
```python
from fastapi import HTTPException, status

def get_user(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
```

### JavaScript/React (Frontend)

#### Code Style
- Use **ESLint** and **Prettier**
- Follow **Airbnb JavaScript Style Guide**
- Use **functional components** with hooks
- Use **TypeScript** for type safety

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = "johnDoe";
const getUserById = (id) => {};

// Components: PascalCase
const UserProfile = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
```

#### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const UserComponent = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getUser(userId);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

export default UserComponent;
```

## 🔄 Development Workflow

### Git Workflow

#### 1. Branch Naming
```bash
# Feature branches
feature/user-authentication
feature/employee-management
feature/candidate-tracking

# Bug fix branches
fix/login-validation
fix/database-connection

# Hotfix branches
hotfix/security-patch
```

#### 2. Commit Messages
```bash
# Format: type(scope): description
feat(auth): add JWT authentication
fix(api): resolve database connection issue
docs(readme): update installation instructions
refactor(components): simplify user form component
test(api): add unit tests for user endpoints
```

#### 3. Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write code following standards
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(module): add new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub/GitLab
   ```

5. **Code Review**
   - Request review from team members
   - Address feedback
   - Update PR as needed

6. **Merge**
   - Squash commits if needed
   - Merge to main branch
   - Delete feature branch

### Development Process

#### 1. Planning
- Review requirements and user stories
- Create technical design
- Estimate effort
- Assign tasks

#### 2. Development
- Set up development environment
- Implement features following standards
- Write tests
- Document changes

#### 3. Testing
- Run unit tests
- Perform integration testing
- Test on different browsers/devices
- Validate against requirements

#### 4. Review
- Self-review code
- Peer review
- Address feedback
- Update documentation

#### 5. Deployment
- Deploy to staging environment
- Perform user acceptance testing
- Deploy to production
- Monitor for issues

## 🧪 Testing Guidelines

### Backend Testing

#### Unit Tests
```python
# tests/test_users.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user():
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_get_user_not_found():
    response = client.get("/users/999")
    assert response.status_code == 404
```

#### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all tests
pytest

# Run specific test file
pytest tests/test_users.py

# Run with coverage
pytest --cov=app tests/
```

### Frontend Testing

#### Unit Tests
```javascript
// tests/UserComponent.test.js
import { render, screen } from '@testing-library/react';
import UserComponent from '../components/UserComponent';

test('renders user information', () => {
  const user = { name: 'John Doe', email: 'john@example.com' };
  render(<UserComponent user={user} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Integration Testing

#### API Testing
```python
# tests/test_api_integration.py
def test_user_workflow():
    # Create user
    user_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    
    # Login
    login_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Access protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
```

## 🔌 API Development

### Creating New Endpoints

#### 1. Define Schema
```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class User(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    
    class Config:
        from_attributes = True
```

#### 2. Create Model
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### 3. Create Router
```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.user import User, UserCreate, UserUpdate
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = UserModel(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

#### 4. Register Router
```python
# main.py
from app.routers import users

app.include_router(users.router, prefix="/users", tags=["Users"])
```

### API Documentation

#### Swagger UI
- Access at `http://localhost:8000/docs`
- Interactive API documentation
- Test endpoints directly

#### ReDoc
- Access at `http://localhost:8000/redoc`
- Alternative documentation format

## 🎨 Frontend Development

### Component Development

#### 1. Create Component
```javascript
// src/components/UserForm.jsx
import React, { useState } from 'react';

const UserForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300"
          required
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
      >
        Save
      </button>
    </form>
  );
};

export default UserForm;
```

#### 2. Create Page
```javascript
// src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import UserForm from '../components/UserForm';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await usersAPI.create(userData);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <UserForm onSubmit={handleCreateUser} />
      {/* User list component */}
    </div>
  );
};

export default Users;
```

### State Management

#### Using React Hooks
```javascript
// Custom hook for API calls
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

## 🗄️ Database Development

### Creating New Models

#### 1. Define Model
```python
# app/models/department.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### 2. Create Migration
```sql
-- db/migrations/001_create_departments.sql
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. Update Schema
```python
# app/schemas/department.py
from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    name: Optional[str] = None

class Department(DepartmentBase):
    id: int
    
    class Config:
        from_attributes = True
```

### Database Queries

#### Basic Queries
```python
# Get all records
users = db.query(User).all()

# Get with pagination
users = db.query(User).offset(skip).limit(limit).all()

# Get by ID
user = db.query(User).filter(User.id == user_id).first()

# Get with conditions
active_users = db.query(User).filter(User.is_active == True).all()
```

#### Complex Queries
```python
from sqlalchemy.orm import joinedload

# Get with relationships
users_with_departments = db.query(User).options(
    joinedload(User.department)
).all()

# Aggregation
from sqlalchemy import func

user_count = db.query(func.count(User.id)).scalar()
department_stats = db.query(
    Department.name,
    func.count(User.id)
).join(User).group_by(Department.name).all()
```

## 🚀 Deployment

### Development Deployment

#### 1. Local Development
```bash
# Backend
cd backend
python main.py

# Frontend
cd frontend
npm run dev
```

#### 2. Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production Deployment

#### 1. Environment Setup
```bash
# Set production environment variables
export DATABASE_URL="mysql+pymysql://user:pass@host:3306/hrms_db"
export SECRET_KEY="your-production-secret-key"
export DEBUG=False
```

#### 2. Database Migration
```bash
# Run database migrations
mysql -u root -p < db/schema.sql
```

#### 3. Build Frontend
```bash
cd frontend
npm run build
```

#### 4. Deploy Backend
```bash
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Using Docker
docker build -t hrms-backend .
docker run -p 8000:8000 hrms-backend
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -h localhost

# Check database exists
SHOW DATABASES;
USE hrms_db;
SHOW TABLES;
```

#### 2. Python Dependencies Issues
```bash
# Reinstall virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Node.js Dependencies Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Conflicts
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Debugging

#### Backend Debugging
```python
# Add logging
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add debug prints
logger.debug(f"Processing user: {user_id}")
```

#### Frontend Debugging
```javascript
// Add console logs
console.log('User data:', userData);

// Use React DevTools
// Install React Developer Tools browser extension
```

### Performance Optimization

#### Backend Optimization
```python
# Add database indexing
# Add caching
# Optimize queries
# Use connection pooling
```

#### Frontend Optimization
```javascript
// Use React.memo for expensive components
// Implement lazy loading
// Optimize bundle size
// Use code splitting
```

---

*Last updated: [Current Date]*
*Version: 1.0.0* 