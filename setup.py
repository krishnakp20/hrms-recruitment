#!/usr/bin/env python3
"""
HRMS Recruitment System Setup Script
This script helps set up the development environment
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    success, stdout, stderr = run_command("python --version")
    if not success:
        print("❌ Python is not installed or not in PATH")
        return False
    print(f"✅ Python: {stdout.strip()}")
    
    # Check Node.js
    success, stdout, stderr = run_command("node --version")
    if not success:
        print("❌ Node.js is not installed or not in PATH")
        return False
    print(f"✅ Node.js: {stdout.strip()}")
    
    # Check npm
    success, stdout, stderr = run_command("npm --version")
    if not success:
        print("❌ npm is not installed or not in PATH")
        return False
    print(f"✅ npm: {stdout.strip()}")
    
    return True

def setup_backend():
    """Setup the FastAPI backend"""
    print("\n🚀 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Create virtual environment
    print("📦 Creating virtual environment...")
    success, stdout, stderr = run_command("python -m venv venv", cwd=backend_dir)
    if not success:
        print(f"❌ Failed to create virtual environment: {stderr}")
        return False
    print("✅ Virtual environment created")
    
    # Install dependencies
    print("📥 Installing Python dependencies...")
    if os.name == 'nt':  # Windows
        pip_cmd = "venv\\Scripts\\pip install -r requirements.txt"
    else:  # Unix/Linux/Mac
        pip_cmd = "venv/bin/pip install -r requirements.txt"
    
    success, stdout, stderr = run_command(pip_cmd, cwd=backend_dir)
    if not success:
        print(f"❌ Failed to install dependencies: {stderr}")
        return False
    print("✅ Python dependencies installed")
    
    # Create .env file
    env_example = backend_dir / "env.example"
    env_file = backend_dir / ".env"
    
    if env_example.exists() and not env_file.exists():
        shutil.copy(env_example, env_file)
        print("✅ Environment file created (edit .env with your database credentials)")
    
    return True

def setup_frontend():
    """Setup the React frontend"""
    print("\n🎨 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install dependencies
    print("📥 Installing Node.js dependencies...")
    success, stdout, stderr = run_command("npm install", cwd=frontend_dir)
    if not success:
        print(f"❌ Failed to install dependencies: {stderr}")
        return False
    print("✅ Node.js dependencies installed")
    
    # Create .env file
    env_example = frontend_dir / "env.example"
    env_file = frontend_dir / ".env"
    
    if env_example.exists() and not env_file.exists():
        shutil.copy(env_example, env_file)
        print("✅ Environment file created")
    
    return True

def create_database_schema():
    """Create the database schema"""
    print("\n🗄️  Setting up database...")
    
    schema_file = Path("db/schema.sql")
    if not schema_file.exists():
        print("❌ Database schema file not found")
        return False
    
    print("📋 Database schema file found at db/schema.sql")
    print("💡 To create the database, run:")
    print("   mysql -u root -p < db/schema.sql")
    
    return True

def main():
    """Main setup function"""
    print("🏢 HRMS Recruitment System Setup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please install the required tools.")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed.")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed.")
        sys.exit(1)
    
    # Database setup
    create_database_schema()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Create the database: mysql -u root -p < db/schema.sql")
    print("2. Edit backend/.env with your database credentials")
    print("3. Start the backend: cd backend && python main.py")
    print("4. Start the frontend: cd frontend && npm run dev")
    print("5. Access the application at http://localhost:3000")
    print("\n🔐 Default login:")
    print("   Email: admin@hrms.com")
    print("   Password: admin123")

if __name__ == "__main__":
    main() 