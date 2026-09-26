from fastapi import APIRouter
from pathlib import Path
from typing import Optional
from datetime import datetime
import json
from pydantic import BaseModel, Field

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SOS_FILE = DATA_DIR / "sos_events.json"


def _load_json(name):
    with open(DATA_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


class SosPayload(BaseModel):
    name: Optional[str] = None
    studentId: Optional[str] = None
    course: Optional[str] = None
    college: Optional[str] = None
    message: Optional[str] = Field(default="Campus SOS triggered")


@router.get("/notices")
def list_notices():
    notices = _load_json("notices.json")
    return {"success": True, "count": len(notices), "notices": notices}


@router.get("/opportunities")
def list_opportunities():
    opportunities = _load_json("opportunities.json")
    return {"success": True, "count": len(opportunities), "opportunities": opportunities}


@router.post("/sos")
def record_sos(payload: SosPayload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    events = []
    if SOS_FILE.exists():
        with open(SOS_FILE, "r", encoding="utf-8") as f:
            try:
                events = json.load(f)
            except json.JSONDecodeError:
                events = []
    event = {
        "id": f"SOS-{len(events) + 1:04d}",
        "createdAt": datetime.utcnow().isoformat(),
        "name": payload.name,
        "studentId": payload.studentId,
        "course": payload.course,
        "college": payload.college,
        "message": payload.message,
        "status": "broadcasted",
    }
    events.insert(0, event)
    with open(SOS_FILE, "w", encoding="utf-8") as f:
        json.dump(events[:100], f, ensure_ascii=False, indent=2)
    return {"success": True, "message": "SOS alert recorded.", "event": event}
