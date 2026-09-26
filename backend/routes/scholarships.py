from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel, Field

from services.scholarship_engine import (
    load_scholarships,
    match_student_scholarships,
    generate_chat_reply
)

router = APIRouter()


class StudentProfile(BaseModel):
    name: Optional[str] = None
    income: Optional[float] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    college: Optional[str] = None
    studentId: Optional[str] = None
    score: Optional[float] = None
    isSpeciallyAbled: Optional[bool] = False


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=3000)
    language: Optional[str] = None
    studentProfile: Optional[StudentProfile] = Field(default_factory=StudentProfile)


class MatchRequest(BaseModel):
    studentProfile: StudentProfile


@router.get("")
@router.get("/")
def list_scholarships(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    data = load_scholarships()
    results = data
    if category:
        results = [s for s in results if category.lower() in s["category"].lower()]
    if state:
        results = [s for s in results if state in s["allowedStates"] or "All India" in s["allowedStates"]]
    if gender:
        results = [s for s in results if "All" in s["allowedGenders"] or gender in s["allowedGenders"]]
    if q:
        ql = q.lower()
        results = [
            s for s in results
            if ql in s["name"].lower()
            or ql in s["organization"].lower()
            or any(ql in t.lower() for t in s["tags"])
        ]
    return {"success": True, "count": len(results), "scholarships": results}


@router.post("/match")
def match_scholarships(req: MatchRequest):
    profile_dict = req.studentProfile.model_dump(exclude_none=True)
    results = match_student_scholarships(profile_dict)
    eligible = [r for r in results if r["isEligible"]]
    return {
        "success": True, "count": len(results),
        "eligibleCount": len(eligible),
        "studentProfile": profile_dict,
        "scholarships": results
    }


@router.post("/chat")
def scholarships_chat(req: ChatRequest):
    """Endpoint used by SmartScholar AI chat UI (seva-saathi-frontend)."""
    profile = req.studentProfile.model_dump(exclude_none=True)
    reply, matched = generate_chat_reply(req.message, req.language, profile)

    general_service_tokens = [
        "senior", "pension", "elderly", "income certificate",
        "ಪಿಂಚಣಿ", "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ"
    ]
    lower_msg = req.message.lower()
    if any(tok in lower_msg for tok in general_service_tokens):
        try:
            from services.matcher import match_services as svc_match
            svc = svc_match(req.message)
            if isinstance(svc, list) and len(svc) > 0:
                top = svc[0]
                reply += (
                    f"\n\n💡 Related government service: {top['name']} — {top['why_it_matches']} "
                    f"Documents needed: {', '.join(top['documents'][:3])}."
                )
        except Exception:
            pass

    return {
        "success": True,
        "reply": reply,
        "message": req.message,
        "language": req.language or "en-IN",
        "studentProfile": profile,
        "scholarships": matched
    }


@router.get("/{scholarship_id}")
def get_scholarship(scholarship_id: str):
    data = load_scholarships()
    for s in data:
        if s["id"] == scholarship_id:
            return {"success": True, "scholarship": s}
    raise HTTPException(status_code=404, detail={
        "success": False, "error": "Scholarship not found",
        "message": f"No scholarship with id '{scholarship_id}'"
    })
