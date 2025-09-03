# from sqlalchemy import Column, BigInteger, String, Enum, DateTime
# from sqlalchemy.sql import func
# from app.core.database import Base
# import enum

# class AgencyStatus(str, enum.Enum):
#     active = "active"
#     inactive = "inactive"

# class ExternalAgency(Base):
#     __tablename__ = "external_agency"

#     id = Column(BigInteger, primary_key=True, autoincrement=True)
#     name = Column(String(255), nullable=False)
#     status = Column(Enum(AgencyStatus), default=AgencyStatus.active, nullable=False)
#     created_date = Column(DateTime, server_default=func.now(), nullable=False)
