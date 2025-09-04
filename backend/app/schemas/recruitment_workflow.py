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





# from pydantic import BaseModel, field_validator
# from typing import List, Optional
# from datetime import datetime
# import json

# class RecruitmentWorkflowTemplateBase(BaseModel):
#     template_name: str
#     stages: List[str]
#     status: Optional[bool] = True

# class RecruitmentWorkflowTemplateCreate(RecruitmentWorkflowTemplateBase):
#     pass

# class RecruitmentWorkflowTemplateUpdate(BaseModel):
#     template_name: Optional[str] = None
#     stages: Optional[List[str]] = None
#     status: Optional[bool] = None

# class RecruitmentWorkflowTemplateOut(RecruitmentWorkflowTemplateBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     # Convert DB TEXT -> list[str] on the way out
#     @field_validator("stages", mode="before")
#     @classmethod
#     def stages_json_to_list(cls, v):
#         if isinstance(v, str):
#             try:
#                 return json.loads(v)
#             except Exception:
#                 # fall back to comma-separated "a,b,c"
#                 return [s.strip() for s in v.split(",") if s.strip()]
#         return v

#     class Config:
#         from_attributes = True  # pydantic v2 replacement for orm_mode




# from pydantic import BaseModel, field_validator
# from typing import List, Optional, Union
# from datetime import datetime
# import json

# class RecruitmentWorkflowTemplateBase(BaseModel):
#     template_name: str
#     stages: Union[List[str], str]
#     status: Optional[Union[bool, str]] = True

#     @field_validator("status", mode="before")
#     @classmethod
#     def normalize_status(cls, v):
#         if isinstance(v, bool):
#             return v
#         if v is None:
#             return True
#         if isinstance(v, str):
#             sv = v.strip().lower()
#             if sv in ("active", "true", "1"):
#                 return True
#             if sv in ("inactive", "false", "0"):
#                 return False
#         raise ValueError("status must be boolean or 'active'/'inactive'")

#     @field_validator("stages", mode="before")
#     @classmethod
#     def normalize_stages(cls, v):
#         if isinstance(v, list):
#             return v
#         if isinstance(v, str):
#             try:
#                 parsed = json.loads(v)
#                 if isinstance(parsed, list):
#                     return parsed
#             except Exception:
#                 items = [s.strip() for s in v.split(",") if s.strip()]
#                 return items
#         raise ValueError("stages must be a list of strings or a JSON string representing a list")


# class RecruitmentWorkflowTemplateCreate(RecruitmentWorkflowTemplateBase):
#     pass


# # class RecruitmentWorkflowTemplateUpdate(BaseModel):
# #     template_name: Optional[str] = None
# #     stages: Optional[Union[List[str], str]] = None
# #     status: Optional[Union[bool, str]] = None

# #     @field_validator("status", mode="before")
# #     @classmethod
# #     def normalize_status(cls, v):
# #         if v is None:
# #             return None
# #         if isinstance(v, bool):
# #             return v
# #         if isinstance(v, str):
# #             sv = v.strip().lower()
# #             if sv in ("active", "true", "1"):
# #                 return True
# #             if sv in ("inactive", "false", "0"):
# #                 return False
# #         raise ValueError("status must be boolean or 'active'/'inactive'")


# class RecruitmentWorkflowTemplateBase(BaseModel):
#     template_name: str
#     stages: Union[List[str], str]
#     status: Optional[Union[bool, str]] = "Active"

#     @field_validator("status", mode="before")
#     @classmethod
#     def normalize_status(cls, v):
#         if isinstance(v, bool):
#             return "Active" if v else "Inactive"
#         if isinstance(v, str):
#             sv = v.strip().lower()
#             if sv in ("active", "true", "1"):
#                 return "Active"
#             if sv in ("inactive", "false", "0"):
#                 return "Inactive"
#         raise ValueError("status must be boolean or 'Active'/'Inactive'")


#     @field_validator("stages", mode="before")
#     @classmethod
#     def normalize_stages(cls, v):
#         if v is None:
#             return None
#         if isinstance(v, list):
#             return v
#         if isinstance(v, str):
#             try:
#                 parsed = json.loads(v)
#                 if isinstance(parsed, list):
#                     return parsed
#             except Exception:
#                 items = [s.strip() for s in v.split(",") if s.strip()]
#                 return items
#         raise ValueError("stages must be a list of strings or a JSON string representing a list")


# class RecruitmentWorkflowTemplateOut(BaseModel):
#     id: int
#     template_name: str
#     stages: List[str]
#     status: bool
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     @field_validator("stages", mode="before")
#     @classmethod
#     def stages_json_to_list(cls, v):
#         if isinstance(v, str):
#             try:
#                 return json.loads(v)
#             except Exception:
#                 return [s.strip() for s in v.split(",") if s.strip()]
#         return v

#     class Config:
#         from_attributes = True




# from pydantic import BaseModel, field_validator
# from typing import List, Optional, Union
# from datetime import datetime
# import json

# class RecruitmentWorkflowTemplateBase(BaseModel):
#     template_name: str
#     stages: List[str]
#     status: Optional[str] = "Active"   # ENUM expects string

# class RecruitmentWorkflowTemplateCreate(RecruitmentWorkflowTemplateBase):
#     pass

# class RecruitmentWorkflowTemplateUpdate(BaseModel):
#     template_name: Optional[str] = None
#     stages: Optional[List[str]] = None
#     status: Optional[str] = None   # 👈 string, not bool

# class RecruitmentWorkflowTemplateOut(RecruitmentWorkflowTemplateBase):
#     id: int
#     created_at: datetime
#     updated_at: Optional[datetime] = None

#     @field_validator("stages", mode="before")
#     @classmethod
#     def stages_json_to_list(cls, v):
#         if isinstance(v, str):
#             try:
#                 return json.loads(v)
#             except Exception:
#                 return [s.strip() for s in v.split(",") if s.strip()]
#         return v

#     class Config:
#         from_attributes = True











# schemas/recruitment_workflow.py
from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import json

class RecruitmentWorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[dict]  
    is_active: Optional[bool] = True

    # convert DB string → list
    @field_validator("steps", mode="before")
    @classmethod
    def steps_json_to_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

class RecruitmentWorkflowCreate(RecruitmentWorkflowBase):
    pass

class RecruitmentWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[dict]] = None
    is_active: Optional[bool] = None

class RecruitmentWorkflowOut(RecruitmentWorkflowBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
