# from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
# from app.core.database import Base

# class RecruitmentWorkflowTemplate(Base):
#     __tablename__ = "recruitment_workflow_templates"

#     id = Column(Integer, primary_key=True, index=True)
#     template_name = Column(String(255), unique=True, nullable=False)
#     stages = Column(Text, nullable=False)     # can store comma-separated or JSON
#     status = Column(Boolean, default=True)    # True=Active, False=Inactive
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())


#     def as_dict(self):
#      return {
#             "id": self.id,
#             "template_name": self.template_name,
#             "stages": json.loads(self.stages),  # convert back to list
#             "status": self.status,
#             "created_at": self.created_at,
#             "updated_at": self.updated_at,
#         }





# from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
# from app.core.database import Base
# # Optional, only if you keep as_dict:
# import json

# class RecruitmentWorkflowTemplate(Base):
#     __tablename__ = "recruitment_workflow_templates"

#     id = Column(Integer, primary_key=True, index=True)
#     template_name = Column(String(255), unique=True, nullable=False)
#     stages = Column(Text, nullable=False)     # JSON string in DB
#     status = Column(Boolean, default=True)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Optional helper — not required if you use the validator approach
    # def as_dict(self):
    #     return {
    #         "id": self.id,
    #         "template_name": self.template_name,
    #         "stages": json.loads(self.stages),
    #         "status": self.status,
    #         "created_at": self.created_at,
    #         "updated_at": self.updated_at,
    #     }





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
