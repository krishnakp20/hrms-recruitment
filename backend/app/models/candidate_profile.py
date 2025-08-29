from sqlalchemy import Column, BigInteger, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class CandidateProfileField(Base):
    __tablename__ = "candidate_profile_fields"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    field_name = Column(String(255), nullable=False)
    field_type = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False)
    is_mandatory = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
