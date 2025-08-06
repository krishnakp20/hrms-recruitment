@echo off
echo 🚀 Starting HRMS Recruitment System...
echo.

echo 📋 Checking prerequisites...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

echo 🔧 Setting up environment files...

REM Create backend .env file
cd backend
if not exist .env (
    echo Creating backend .env file...
    echo DATABASE_URL=sqlite:///./hrms.db > .env
    echo SECRET_KEY=your-secret-key-here >> .env
    echo ALGORITHM=HS256 >> .env
    echo ACCESS_TOKEN_EXPIRE_MINUTES=30 >> .env
    echo HOST=0.0.0.0 >> .env
    echo PORT=8000 >> .env
    echo DEBUG=True >> .env
    echo ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 >> .env
    echo ✅ Backend .env created
) else (
    echo ✅ Backend .env already exists
)

REM Initialize database
echo.
echo 🗄️ Initializing database...
python init_database.py

REM Create frontend .env file
cd ../frontend
if not exist .env (
    echo Creating frontend .env file...
    echo VITE_API_BASE_URL=http://localhost:8000 > .env
    echo VITE_APP_NAME=HRMS Recruitment System >> .env
    echo ✅ Frontend .env created
) else (
    echo ✅ Frontend .env already exists
)

echo.
echo 🚀 Starting servers...
echo.

REM Start backend server in a new window
echo Starting backend server on http://localhost:8000...
start "Backend Server" cmd /k "cd backend && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting frontend server on http://localhost:3000...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 📱 Access Points:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 🔐 Login Credentials:
echo    Email: admin@hrms.com
echo    Password: admin123
echo.
echo Press any key to exit this launcher...
pause >nul 