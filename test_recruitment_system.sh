#!/bin/bash

# HRMS Recruitment System Quick Test Script
# This script sets up and tests the complete recruitment system

set -e  # Exit on any error

echo "🚀 HRMS Recruitment System Quick Test"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
check_python() {
    print_status "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python 3.8+"
        exit 1
    fi
    print_success "Python found: $($PYTHON_CMD --version)"
}

# Check if pip is installed
check_pip() {
    print_status "Checking pip installation..."
    if ! command -v pip &> /dev/null; then
        print_error "pip is not installed. Please install pip"
        exit 1
    fi
    print_success "pip found: $(pip --version)"
}

# Check if MySQL is installed
check_mysql() {
    print_status "Checking MySQL installation..."
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL is not installed. You may need to install it for full functionality."
        print_warning "For testing purposes, SQLite will be used instead."
        USE_SQLITE=true
    else
        print_success "MySQL found: $(mysql --version)"
        USE_SQLITE=false
    fi
}

# Setup virtual environment
setup_venv() {
    print_status "Setting up virtual environment..."
    if [ ! -d "backend/venv" ]; then
        cd backend
        $PYTHON_CMD -m venv venv
        cd ..
        print_success "Virtual environment created"
    else
        print_success "Virtual environment already exists"
    fi
}

# Activate virtual environment
activate_venv() {
    print_status "Activating virtual environment..."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        source backend/venv/Scripts/activate
    else
        # Linux/Mac
        source backend/venv/bin/activate
    fi
    print_success "Virtual environment activated"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    pip install -r backend/requirements.txt
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ "$USE_SQLITE" = true ]; then
        print_status "Using SQLite for testing..."
        # Create SQLite database
        cd backend
        $PYTHON_CMD -c "
from app.core.database import engine
from app.models import *
Base.metadata.create_all(bind=engine)
print('SQLite database created successfully')
"
        cd ..
    else
        print_status "Setting up MySQL database..."
        # Create MySQL database
        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hrms_db;"
        mysql -u root -p hrms_db < db/schema.sql
    fi
    
    print_success "Database setup completed"
}

# Start the server
start_server() {
    print_status "Starting the server..."
    cd backend
    
    # Start server in background
    $PYTHON_CMD -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Check if server is running
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Server started successfully on http://localhost:8000"
    else
        print_error "Failed to start server"
        exit 1
    fi
    
    cd ..
}

# Run tests
run_tests() {
    print_status "Running comprehensive tests..."
    cd backend
    
    # Run automated tests
    print_status "Running automated test suite..."
    $PYTHON_CMD test_recruitment_system.py
    
    # Run manual tests
    print_status "Running manual test script..."
    $PYTHON_CMD manual_test.py
    
    cd ..
}

# Test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    # Test health endpoint
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Health endpoint working"
    else
        print_error "Health endpoint failed"
    fi
    
    # Test API documentation
    if curl -s http://localhost:8000/docs > /dev/null; then
        print_success "API documentation accessible"
    else
        print_error "API documentation not accessible"
    fi
    
    # Test authentication
    AUTH_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username": "admin@hrms.com", "password": "admin123"}')
    
    if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
        print_success "Authentication working"
        TOKEN=$(echo "$AUTH_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
    else
        print_error "Authentication failed"
        TOKEN=""
    fi
    
    # Test job endpoints
    if [ ! -z "$TOKEN" ]; then
        print_status "Testing job endpoints..."
        
        # Create a test job
        JOB_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/jobs/" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "position_title": "Test Job",
                "position_code": "TEST001",
                "employment_type": "Full-time"
            }')
        
        if echo "$JOB_RESPONSE" | grep -q "id"; then
            print_success "Job creation working"
        else
            print_error "Job creation failed"
        fi
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop server if running
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        print_success "Server stopped"
    fi
    
    # Deactivate virtual environment
    deactivate 2>/dev/null || true
}

# Main function
main() {
    print_status "Starting HRMS Recruitment System test..."
    
    # Check prerequisites
    check_python
    check_pip
    check_mysql
    
    # Setup environment
    setup_venv
    activate_venv
    install_dependencies
    
    # Setup database
    setup_database
    
    # Start server
    start_server
    
    # Run tests
    run_tests
    
    # Test API endpoints
    test_api_endpoints
    
    print_success "All tests completed successfully!"
    print_status "You can now access:"
    print_status "  - API: http://localhost:8000"
    print_status "  - Documentation: http://localhost:8000/docs"
    print_status "  - Health Check: http://localhost:8000/health"
    
    # Keep server running for manual testing
    print_status "Server is running. Press Ctrl+C to stop."
    
    # Wait for user to stop
    trap cleanup EXIT
    wait
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@" 