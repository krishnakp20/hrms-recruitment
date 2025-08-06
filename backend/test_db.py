#!/usr/bin/env python3
"""
Test script to check database and user authentication
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

def test_database():
    """Test database connection and user authentication"""
    print("🔍 Testing database and user authentication...")
    
    db = SessionLocal()
    try:
        # Check if users exist
        users = db.query(User).all()
        print(f"📋 Found {len(users)} users in database:")
        
        for user in users:
            print(f"   - {user.email} (ID: {user.id}, Role: {user.role})")
        
        # Test password verification
        admin_user = db.query(User).filter(User.email == "admin@hrms.com").first()
        if admin_user:
            print(f"✅ Admin user found: {admin_user.email}")
            print(f"   Hashed password: {admin_user.hashed_password[:20]}...")
            
            # Test password verification
            is_valid = verify_password("admin123", admin_user.hashed_password)
            print(f"   Password verification: {'✅ Valid' if is_valid else '❌ Invalid'}")
            
            # Test creating a new hash
            new_hash = get_password_hash("admin123")
            print(f"   New hash: {new_hash[:20]}...")
            
        else:
            print("❌ Admin user not found!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database() 