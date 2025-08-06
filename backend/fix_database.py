#!/usr/bin/env python3
"""
Fix database enum values and user data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def fix_database():
    """Fix database enum values and recreate users"""
    print("🔧 Fixing database enum values and user data...")
    
    # Drop and recreate all tables
    print("📋 Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recreated successfully")
    
    # Create fresh users with correct enum values
    print("📝 Creating fresh user data...")
    db = SessionLocal()
    
    try:
        # Create sample users with correct enum values
        users = [
            User(
                email="admin@hrms.com",
                username="admin",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            ),
            User(
                email="hr.spoc@company.com",
                username="hr_spoc",
                full_name="HR SPOC",
                hashed_password=get_password_hash("hr123"),
                role=UserRole.HR_SPOC,
                is_active=True
            ),
            User(
                email="employer@company.com",
                username="employer",
                full_name="Employer User",
                hashed_password=get_password_hash("emp123"),
                role=UserRole.EMPLOYER,
                is_active=True
            ),
            User(
                email="recruiter@company.com",
                username="recruiter",
                full_name="Recruiter User",
                hashed_password=get_password_hash("rec123"),
                role=UserRole.RECRUITER,
                is_active=True
            )
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        print("✅ Users created successfully")
        
        # Verify the users
        all_users = db.query(User).all()
        print(f"\n📋 Created {len(all_users)} users:")
        for user in all_users:
            print(f"   - {user.email} (Role: {user.role.value})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n🎉 Database fix completed!")

if __name__ == "__main__":
    fix_database() 