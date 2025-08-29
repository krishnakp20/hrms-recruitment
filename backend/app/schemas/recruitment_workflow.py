# from pydantic import BaseModel
# from typing import List, Optional
# from datetime import datetime

# class RecruitmentWorkflowTemplateBase(BaseModel):
#     template_name: str
#     stages: List[str]
#     status: Optional[bool] = True

# class RecruitmentWorkflowTemplateCreate(RecruitmentWorkflowTemplateBase):
#     pass

# class RecruitmentWorkflowTemplateUpdate(BaseModel):
#     template_name: Optional[str]
#     stages: Optional[List[str]]
#     status: Optional[bool]

# class RecruitmentWorkflowTemplateOut(RecruitmentWorkflowTemplateBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime]

#     class Config:
#         from_attributes = True   # ✅ Pydantic v2





from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import json

class RecruitmentWorkflowTemplateBase(BaseModel):
    template_name: str
    stages: List[str]
    status: Optional[bool] = True

class RecruitmentWorkflowTemplateCreate(RecruitmentWorkflowTemplateBase):
    pass

class RecruitmentWorkflowTemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    stages: Optional[List[str]] = None
    status: Optional[bool] = None

class RecruitmentWorkflowTemplateOut(RecruitmentWorkflowTemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Convert DB TEXT -> list[str] on the way out
    @field_validator("stages", mode="before")
    @classmethod
    def stages_json_to_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                # fall back to comma-separated "a,b,c"
                return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        from_attributes = True  # pydantic v2 replacement for orm_mode
