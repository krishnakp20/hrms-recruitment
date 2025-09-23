# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List

# from app.models.user import User
# from app.schemas.user import UserCreate, UserUpdate, UserOut
# from app.database import get_db
# from app.core.security import get_password_hash

# router = APIRouter(
#     prefix="/users",
#     tags=["Users"]
# )

# # -----------------------------
# # Get all users
# # -----------------------------
# @router.get("/", response_model=List[UserOut])
# def get_users(db: Session = Depends(get_db)):
#     users = db.query(User).all()
#     return users

# # -----------------------------
# # Get single user by ID
# # -----------------------------
# @router.get("/{user_id}", response_model=UserOut)
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user

# # -----------------------------
# # Create new user
# # -----------------------------
# @router.post("/", response_model=UserOut)
# def create_user(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = User(
#         email=user.email,
#         username=user.username,
#         full_name=user.full_name,
#         hashed_password=get_password_hash(user.password),
#         role=user.role,
#         is_active=user.is_active,
#         is_superuser=user.is_superuser
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user

# # -----------------------------
# # Update user
# # -----------------------------
# @router.put("/{user_id}", response_model=UserOut)
# def update_user(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.id == user_id).first()
#     if not db_user:
#         raise HTTPException(status_code=404, detail="User not found")

#     update_data = updates.dict(exclude_unset=True)
#     for field, value in update_data.items():
#         if field == "password":
#             setattr(db_user, "hashed_password", get_password_hash(value))
#         else:
#             setattr(db_user, field, value)

#     db.commit()
#     db.refresh(db_user)
#     return db_user

# # -----------------------------
# # Delete user
# # -----------------------------
# @router.delete("/{user_id}")
# def delete_user(user_id: int, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.id == user_id).first()
#     if not db_user:
#         raise HTTPException(status_code=404, detail="User not found")

#     db.delete(db_user)
#     db.commit()
#     return {"message": "User deleted successfully"}







# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.core.security import get_password_hash
# from app.models.user import User
# from app.schemas.user import UserCreate, UserUpdate, User
# from passlib.context import CryptContext
# from typing import List

# router = APIRouter(
#     prefix="/users",
#     tags=["Users"]
# )

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # Utility for hashing password
# def get_password_hash(password: str):
#     return pwd_context.hash(password)

# # Create User
# @router.post("/", response_model=User)
# def create_user(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == user.email).first()
#     if db_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     hashed_pw = get_password_hash(user.password)
#     new_user = User(
#         first_name=user.first_name,
#         last_name=user.last_name,
#         email=user.email,
#         phone=user.phone,
#         role=user.role,   # e.g., ADMIN, HR, etc.
#         password=hashed_pw,
#         is_active=True
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# # Get All Users
# @router.get("/", response_model=List[User])
# def get_users(db: Session = Depends(get_db)):
#     return db.query(User).all()

# # Get User by ID
# @router.get("/{user_id}", response_model=User)
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user

# # Update User
# @router.put("/{user_id}", response_model=User)
# def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     for key, value in user_update.dict(exclude_unset=True).items():
#         if key == "password":  
#             value = get_password_hash(value)
#         setattr(user, key, value)

#     db.commit()
#     db.refresh(user)
#     return user

# # Delete User
# @router.delete("/{user_id}")
# def delete_user(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     db.delete(user)
#     db.commit()
#     return {"message": "User deleted successfully"}


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User as UserModel   # SQLAlchemy model
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema  # Pydantic schema
from passlib.context import CryptContext
from typing import List
from app.models.user import UserRole
from app.core.security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Utility for hashing password
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Create User
@router.post("/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    new_user = UserModel(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        hashed_password=hashed_pw,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Get All Users
@router.get("/", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    return db.query(UserModel).order_by(UserModel.id.desc()).all()

# Get User by ID
@router.get("/{user_id}", response_model=UserSchema)
def get_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update User
@router.put("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.dict(exclude_unset=True).items():
        if key == "password":
            value = get_password_hash(value)
            setattr(user, "hashed_password", value)  # map password -> hashed_password
        else:
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

# Delete User
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.HR_SPOC]:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
