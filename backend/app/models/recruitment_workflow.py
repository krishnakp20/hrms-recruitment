
# from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, func
# import enum
# from app.core.database import Base

# class StatusEnum(str, enum.Enum):
#     Active = "Active"
#     Inactive = "Inactive"

# class RecruitmentWorkflowTemplate(Base):
#     __tablename__ = "recruitment_workflow_templates"

#     id = Column(Integer, primary_key=True, index=True)
#     template_name = Column(String(255), unique=True, nullable=False)
#     stages = Column(Text, nullable=False)
#     status = Column(Enum(StatusEnum), default=StatusEnum.Active, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
