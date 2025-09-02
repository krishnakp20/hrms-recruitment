# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.models.recruitment_workflow import RecruitmentWorkflowTemplate
# from app.schemas.recruitment_workflow import (
#     RecruitmentWorkflowTemplateCreate,
#     RecruitmentWorkflowTemplateUpdate,
#     RecruitmentWorkflowTemplateOut
# )
# import json

# router = APIRouter(prefix="/workflow-templates", tags=["Workflow Templates"])

# # Create
# @router.post("/", response_model=RecruitmentWorkflowTemplateOut)
# def create_template(template: RecruitmentWorkflowTemplateCreate, db: Session = Depends(get_db)):
#     db_template = RecruitmentWorkflowTemplate(
#         template_name=template.template_name,
#         stages=json.dumps(template.stages),
#         status=template.status,
#     )
#     db.add(db_template)
#     db.commit()
#     db.refresh(db_template)
#     return db_template.as_dict()

# # List
# @router.get("/", response_model=list[RecruitmentWorkflowTemplateOut])
# def list_templates(db: Session = Depends(get_db)):
#     return db.query(RecruitmentWorkflowTemplate).all()

# # Get by ID
# @router.get("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def get_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = db.query(RecruitmentWorkflowTemplate).filter(RecruitmentWorkflowTemplate.id == template_id).first()
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")
#     return db_template

# # Update
# @router.put("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def update_template(template_id: int, updated: RecruitmentWorkflowTemplateUpdate, db: Session = Depends(get_db)):
#     db_template = db.query(RecruitmentWorkflowTemplate).filter(RecruitmentWorkflowTemplate.id == template_id).first()
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     if updated.template_name is not None:
#         db_template.template_name = updated.template_name
#     if updated.stages is not None:
#         db_template.stages = json.dumps(updated.stages)
#     if updated.status is not None:
#         db_template.status = updated.status

#     db.commit()
#     db.refresh(db_template)
#     return db_template

# # Delete
# @router.delete("/{template_id}")
# def delete_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = db.query(RecruitmentWorkflowTemplate).filter(RecruitmentWorkflowTemplate.id == template_id).first()
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     db.delete(db_template)
#     db.commit()
#     return {"detail": "Deleted successfully"}







# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.models.recruitment_workflow import RecruitmentWorkflowTemplate
# from app.schemas.recruitment_workflow import (
#     RecruitmentWorkflowTemplateCreate,
#     RecruitmentWorkflowTemplateUpdate,
#     RecruitmentWorkflowTemplateOut
# )
# import json

# router = APIRouter(prefix="/workflow-templates", tags=["Workflow Templates"])

# # Create
# @router.post("/", response_model=RecruitmentWorkflowTemplateOut)
# def create_template(template: RecruitmentWorkflowTemplateCreate, db: Session = Depends(get_db)):
#     db_template = RecruitmentWorkflowTemplate(
#         template_name=template.template_name,
#         stages=json.dumps(template.stages),  # store as JSON string
#         status=template.status,
#     )
#     db.add(db_template)
#     db.commit()
#     db.refresh(db_template)
#     return db_template  # ✅ return SA model; Pydantic validator will convert stages

# # List
# @router.get("/", response_model=list[RecruitmentWorkflowTemplateOut])
# def list_templates(db: Session = Depends(get_db)):
#     return db.query(RecruitmentWorkflowTemplate).all()

# # Get by ID
# @router.get("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def get_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")
#     return db_template

# # Update
# @router.put("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def update_template(template_id: int, updated: RecruitmentWorkflowTemplateUpdate, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     if updated.template_name is not None:
#         db_template.template_name = updated.template_name
#     if updated.stages is not None:
#         db_template.stages = json.dumps(updated.stages)  # keep DB as JSON string
#     if updated.status is not None:
#         db_template.status = updated.status

#     db.commit()
#     db.refresh(db_template)
#     return db_template

# # Delete
# @router.delete("/{template_id}")
# def delete_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     db.delete(db_template)
#     db.commit()
#     return {"detail": "Deleted successfully"}





# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.models.recruitment_workflow import RecruitmentWorkflowTemplate
# from app.schemas.recruitment_workflow import (
#     RecruitmentWorkflowTemplateCreate,
#     RecruitmentWorkflowTemplateUpdate,
#     RecruitmentWorkflowTemplateOut,
# )
# import json

# router = APIRouter(prefix="/workflow-templates", tags=["Workflow Templates"])

# # Create
# @router.post("/", response_model=RecruitmentWorkflowTemplateOut)
# def create_template(template: RecruitmentWorkflowTemplateCreate, db: Session = Depends(get_db)):
#     try:
#         stages_json = json.dumps(template.stages)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid stages format")

#     db_template = RecruitmentWorkflowTemplate(
#         template_name=template.template_name,
#         stages=stages_json,
#         status=template.status,
#     )
#     try:
#         db.add(db_template)
#         db.commit()
#         db.refresh(db_template)
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

#     return db_template

# # List
# @router.get("/", response_model=list[RecruitmentWorkflowTemplateOut])
# def list_templates(db: Session = Depends(get_db)):
#     return db.query(RecruitmentWorkflowTemplate).all()

# # Get by ID
# @router.get("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def get_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")
#     return db_template

# # Update
# @router.put("/{template_id}", response_model=RecruitmentWorkflowTemplateOut)
# def update_template(template_id: int, updated: RecruitmentWorkflowTemplateUpdate, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     if updated.template_name is not None:
#         db_template.template_name = updated.template_name
#     if updated.stages is not None:
#         try:
#             db_template.stages = json.dumps(updated.stages)
#         except Exception:
#             raise HTTPException(status_code=400, detail="Invalid stages format")
#     if updated.status is not None:
#         db_template.status = updated.status

#     try:
#         db.commit()
#         db.refresh(db_template)
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

#     return db_template

# # Delete
# @router.delete("/{template_id}")
# def delete_template(template_id: int, db: Session = Depends(get_db)):
#     db_template = (
#         db.query(RecruitmentWorkflowTemplate)
#         .filter(RecruitmentWorkflowTemplate.id == template_id)
#         .first()
#     )
#     if not db_template:
#         raise HTTPException(status_code=404, detail="Template not found")

#     try:
#         db.delete(db_template)
#         db.commit()
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

#     return {"detail": "Deleted successfully"}







# routes/recruitment_workflow.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.job import RecruitmentWorkflow
from app.schemas.recruitment_workflow import (
    RecruitmentWorkflowCreate,
    RecruitmentWorkflowUpdate,
    RecruitmentWorkflowOut,
)
import json

router = APIRouter(prefix="/workflow-templates", tags=["Workflow Templates"])

# Create
@router.post("/", response_model=RecruitmentWorkflowOut)
def create_template(template: RecruitmentWorkflowCreate, db: Session = Depends(get_db)):
    try:
        steps_json = json.dumps(template.steps)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid steps format")

    db_template = RecruitmentWorkflow(
        name=template.name,
        description=template.description,
        steps=steps_json,
        is_active=template.is_active,
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

# List
@router.get("/", response_model=list[RecruitmentWorkflowOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(RecruitmentWorkflow).all()

# Get by ID
@router.get("/{template_id}", response_model=RecruitmentWorkflowOut)
def get_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(RecruitmentWorkflow).filter(RecruitmentWorkflow.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

# Update
@router.put("/{template_id}", response_model=RecruitmentWorkflowOut)
def update_template(template_id: int, updated: RecruitmentWorkflowUpdate, db: Session = Depends(get_db)):
    db_template = db.query(RecruitmentWorkflow).filter(RecruitmentWorkflow.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    if updated.name is not None:
        db_template.name = updated.name
    if updated.description is not None:
        db_template.description = updated.description
    if updated.steps is not None:
        try:
            db_template.steps = json.dumps(updated.steps)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid steps format")
    if updated.is_active is not None:
        db_template.is_active = updated.is_active

    db.commit()
    db.refresh(db_template)
    return db_template

# Delete
@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(RecruitmentWorkflow).filter(RecruitmentWorkflow.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(db_template)
    db.commit()
    return {"detail": "Deleted successfully"}
