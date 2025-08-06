# HRMS Backend

FastAPI-based backend for the HRMS Recruitment System.

## Features

- RESTful API with automatic documentation
- JWT-based authentication
- SQLAlchemy ORM with MySQL
- Pydantic data validation
- CORS support for frontend integration
- Comprehensive CRUD operations

## Tech Stack

- **FastAPI** - High-performance web framework
- **SQLAlchemy** - Database ORM
- **PyMySQL** - MySQL database connector
- **Pydantic** - Data validation and serialization
- **Python-Jose** - JWT token handling
- **Passlib** - Password hashing
- **Alembic** - Database migrations (ready for use)

## Quick Start

### Prerequisites

- Python 3.8+
- MySQL 8.0+

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env
# Edit .env with your database credentials

# Run the server
python main.py
```

### Available Commands

```bash
python main.py              # Run development server
uvicorn main:app --reload   # Run with auto-reload
```

## Project Structure

```
app/
├── core/                   # Core configuration
│   ├── config.py          # Settings management
│   ├── database.py        # Database configuration
│   └── security.py        # JWT and password utilities
├── models/                # SQLAlchemy models
│   ├── user.py           # User model
│   ├── employee.py       # Employee model
│   ├── candidate.py      # Candidate model
│   ├── job.py            # Job model
│   └── application.py    # Application model
├── routers/              # API routes
│   ├── auth.py           # Authentication endpoints
│   ├── employees.py      # Employee endpoints
│   ├── candidates.py     # Candidate endpoints
│   ├── jobs.py           # Job endpoints
│   ├── applications.py   # Application endpoints
│   └── dashboard.py      # Dashboard endpoints
├── schemas/              # Pydantic schemas
│   ├── auth.py           # Authentication schemas
│   ├── user.py           # User schemas
│   ├── employee.py       # Employee schemas
│   ├── candidate.py      # Candidate schemas
│   ├── job.py            # Job schemas
│   └── application.py    # Application schemas
└── services/             # Business logic (future use)
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/hrms_db

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc
- **OpenAPI schema**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
```
POST /auth/login          # User login
POST /auth/logout         # User logout
POST /auth/refresh        # Refresh token
```

### Employees
```
GET    /employees         # List employees
POST   /employees         # Create employee
GET    /employees/{id}    # Get employee
PUT    /employees/{id}    # Update employee
DELETE /employees/{id}    # Delete employee
```

### Candidates
```
GET    /candidates        # List candidates
POST   /candidates        # Create candidate
GET    /candidates/{id}   # Get candidate
PUT    /candidates/{id}   # Update candidate
DELETE /candidates/{id}   # Delete candidate
```

### Jobs
```
GET    /jobs             # List jobs
POST   /jobs             # Create job
GET    /jobs/{id}        # Get job
PUT    /jobs/{id}        # Update job
DELETE /jobs/{id}        # Delete job
```

### Applications
```
GET    /applications     # List applications
POST   /applications     # Create application
GET    /applications/{id} # Get application
PUT    /applications/{id} # Update application
DELETE /applications/{id} # Delete application
```

### Dashboard
```
GET /dashboard/stats      # Get statistics
GET /dashboard/activities # Get recent activities
```

## Database Models

### User
- Authentication and authorization
- JWT token management
- Role-based access control

### Employee
- Company employee information
- Department and position tracking
- Manager-subordinate relationships

### Candidate
- Job applicant information
- Application status tracking
- Resume and cover letter storage

### Job
- Job posting details
- Requirements and descriptions
- Status management (Draft, Active, Closed, Archived)

### Application
- Job application tracking
- Candidate-job relationships
- Status progression (Applied → Shortlisted → Interviewed → Hired/Rejected)

## Authentication

The API uses JWT tokens for authentication:

1. **Login**: POST `/auth/login` with email/password
2. **Token**: Receive JWT access token
3. **Authorization**: Include token in `Authorization: Bearer <token>` header
4. **Refresh**: Use `/auth/refresh` to get new tokens

## Development

### Running in Development Mode

```bash
# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py script
python main.py
```

### Database Migrations

For production, consider using Alembic for database migrations:

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Testing

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Resource not found
- **422 Validation Error**: Pydantic validation failed

## Production Deployment

For production deployment:

1. **Environment**: Set `DEBUG=False`
2. **Database**: Use production MySQL instance
3. **Security**: Use strong `SECRET_KEY`
4. **CORS**: Configure allowed origins
5. **HTTPS**: Use reverse proxy (nginx)
6. **Process Manager**: Use Gunicorn or uvicorn with multiple workers

### Example Production Command

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured for frontend integration
- **Input Validation**: Pydantic schemas for data validation
- **SQL Injection Protection**: SQLAlchemy ORM

## Monitoring and Logging

The API includes:

- **Request/Response logging**
- **Error tracking**
- **Performance monitoring** (can be extended)
- **Health check endpoint**: `GET /health` 