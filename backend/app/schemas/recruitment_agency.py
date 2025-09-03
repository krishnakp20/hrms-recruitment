# from pydantic import BaseModel
# from typing import Optional
# from datetime import datetime
# from app.models.external import AgencyStatus

# class ExternalAgencyCreate(BaseModel):
#     name: str
#     status: Optional[AgencyStatus] = AgencyStatus.active

# class ExternalAgencyRead(BaseModel):
#     id: int
#     name: str
#     status: AgencyStatus
#     created_date: datetime

#     class Config:
#         orm_mode = True






from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RecruitmentAgencyBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = True

class RecruitmentAgencyCreate(RecruitmentAgencyBase):
    pass

class RecruitmentAgencyUpdate(RecruitmentAgencyBase):
    pass

class RecruitmentAgencyRead(RecruitmentAgencyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

