from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, employees, candidates, jobs, applications, dashboard, recruitment_agencies, candidate_profile, recruitment_workflow, interviews, user, interview_module
from app.core.config import ALLOWED_ORIGINS, HOST, PORT, DEBUG
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path


app = FastAPI(
    title="HRMS Recruitment API",
    description="A comprehensive HRMS system for managing employees, candidates, jobs, and applications",
    version="1.0.0"
)

os.makedirs("uploads/resumes", exist_ok=True)

OFFER_DIR = Path("offers")
OFFER_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.mount("/offers", StaticFiles(directory=OFFER_DIR), name="offers")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(recruitment_agencies.router)
app.include_router(candidate_profile.router)
app.include_router(recruitment_workflow.router)
# app.include_router(external.router, prefix="/external-agencies", tags=["External Agencies"])

# app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])
app.include_router(user.router)
app.include_router(interview_module.router, tags=["Interview Module"])

@app.get("/")
async def root():
    return {"message": "HRMS Recruitment API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    ) 