"""
Create Admin Account Script
Run this script to create the initial admin account for your system.
"""

import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'xai-code-auditor', 'backend'))

from app.db.database import SessionLocal
from app.db import schemas
from app.core.auth import hash_password
import uuid


def create_admin(email: str, name: str, password: str):
    """Create a new admin account."""
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = schemas.get_admin_by_email(db, email)
        if existing_admin:
            print(f"❌ Admin with email {email} already exists!")
            return False
        
        # Create admin
        admin_id = str(uuid.uuid4())
        hashed_pwd = hash_password(password)
        
        admin = schemas.create_admin(
            db,
            email=email,
            name=name,
            hashed_password=hashed_pwd,
            admin_id=admin_id
        )
        
        print("✅ Admin created successfully!")
        print(f"   ID: {admin.id}")
        print(f"   Email: {admin.email}")
        print(f"   Name: {admin.name}")
        print()
        print("📝 Login credentials:")
        print(f"   Email: {email}")
        print(f"   Password: (the password you entered)")
        print()
        print("🔗 Access admin dashboard: http://localhost:3000/admin-login")
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {str(e)}")
        return False
    finally:
        db.close()


def main():
    """Main setup script."""
    print("=" * 50)
    print("🔐 Admin Account Creator")
    print("=" * 50)
    print()
    
    # Collect admin details
    email = input("📧 Enter admin email: ").strip()
    if not email:
        print("❌ Email cannot be empty!")
        return
    
    name = input("👤 Enter admin name: ").strip()
    if not name:
        print("❌ Name cannot be empty!")
        return
    
    password = input("🔑 Enter admin password: ").strip()
    if not password or len(password) < 6:
        print("❌ Password must be at least 6 characters!")
        return
    
    confirm_password = input("🔑 Confirm password: ").strip()
    if password != confirm_password:
        print("❌ Passwords do not match!")
        return
    
    # Create admin
    print()
    print("Creating admin account...")
    success = create_admin(email, name, password)
    
    if success:
        print()
        print("=" * 50)
        print("✨ Setup Complete!")
        print("=" * 50)
        print()
        print("Next steps:")
        print("1. Start the backend: python -m uvicorn app.main:app --reload")
        print("2. Start the frontend: npm start")
        print("3. Go to http://localhost:3000/admin-login")
        print("4. Login with your admin credentials")
    else:
        print()
        print("❌ Failed to create admin account")


if __name__ == "__main__":
    main()
