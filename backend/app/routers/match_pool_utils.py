from typing import List
import re
from app.schemas.job import Job
from app.models.candidate import Candidate

def extract_skills(text: str) -> set:
    return set(skill.strip().lower() for skill in (text or "").split(",") if skill.strip())

def parse_experience_range(exp_range: str):
    match = re.match(r"(\d+)-(\d+)", exp_range)
    return (int(match.group(1)), int(match.group(2))) if match else (None, None)

def match_pool_candidates_to_job(job: Job, candidates: List[Candidate]) -> List[Candidate]:
    required_skills = extract_skills(job.required_skills)
    exp_min, exp_max = parse_experience_range(job.experience_level or "")

    matched = []
    for candidate in candidates:
        candidate_skills = extract_skills(candidate.experience_details)
        skill_match = required_skills.intersection(candidate_skills)

        exp_match = True
        if exp_min is not None and exp_max is not None:
            if candidate.experience_years is None:
                exp_match = False
            else:
                exp_match = exp_min <= candidate.experience_years <= exp_max

        if skill_match and exp_match:
            matched.append(candidate)

        if len(matched) >= job.number_of_vacancies:
            break

    return matched
