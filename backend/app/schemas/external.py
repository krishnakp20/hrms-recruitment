from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.external import AgencyStatus

class ExternalAgencyCreate(BaseModel):
    name: str
    status: Optional[AgencyStatus] = AgencyStatus.active

class ExternalAgencyRead(BaseModel):
    id: int
    name: str
    status: AgencyStatus
    created_date: datetime

    class Config:
        orm_mode = True
