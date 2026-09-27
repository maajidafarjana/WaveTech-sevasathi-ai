import json
import uuid
from pathlib import Path
from datetime import datetime

GRIEVANCES_FILE = "grievances.json"


def _file_path():
    return Path(__file__).resolve().parent.parent / "data" / GRIEVANCES_FILE


def _ensure_file():
    p = _file_path()
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump({"tickets": []}, f, ensure_ascii=False, indent=2)


def _read_all():
    _ensure_file()
    with open(_file_path(), "r", encoding="utf-8") as f:
        data = json.load(f)
    if "tickets" not in data:
        data["tickets"] = []
    return data


def _write_all(data):
    with open(_file_path(), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def get_all_tickets():
    data = _read_all()
    return data["tickets"]


def create_ticket(payload):
    data = _read_all()
    ticket_id = payload.get("ticketId") or f"SS-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.utcnow().isoformat()
    ticket = {
        "ticketId": ticket_id,
        "problemTitle": payload.get("problemTitle", "").strip(),
        "schemeName": payload.get("schemeName", "General / Not Specified").strip() or "General / Not Specified",
        "category": payload.get("category", "Portal Login Error"),
        "urgency": payload.get("urgency", "Medium"),
        "location": payload.get("location", "Scholarship Portal / Online").strip() or "Scholarship Portal / Online",
        "description": payload.get("description", "").strip(),
        "screenshot": payload.get("screenshot"),
        "anonymous": bool(payload.get("anonymous", False)),
        "studentId": None if payload.get("anonymous") else payload.get("studentId"),
        "status": payload.get("status", "Pending"),
        "assignedTo": payload.get("assignedTo", "Scholarship Nodal Helpdesk"),
        "upvotes": int(payload.get("upvotes", 0) or 0),
        "createdAt": now,
        "updatedAt": now
    }
    data["tickets"].insert(0, ticket)
    _write_all(data)
    return ticket


def upvote_ticket(ticket_id):
    data = _read_all()
    for t in data["tickets"]:
        if t["ticketId"] == ticket_id:
            t["upvotes"] = int(t.get("upvotes", 0) or 0) + 1
            t["updatedAt"] = datetime.utcnow().isoformat()
            _write_all(data)
            return t
    return None


def seed_sample_tickets():
    data = _read_all()
    if len(data["tickets"]) > 0:
        return False
    sample = [
        {
            "problemTitle": "Wi-Fi router not working in Hostel A Block 3rd floor",
            "category": "Wi-Fi & Internet",
            "urgency": "Medium",
            "location": "Hostel A, 3rd Floor Corridor",
            "description": "Router lights are off, no SSID broadcast since last night. Affecting 3 rooms.",
            "anonymous": False,
            "studentId": "SS-2026-KA-1122",
            "status": "In Progress",
            "assignedTo": "IT Support Team"
        },
        {
            "problemTitle": "Mess food quality issue - uncooked rice",
            "category": "Hostel & Mess Food",
            "urgency": "Normal",
            "location": "Main Campus Mess - South Block",
            "description": "Rice served yesterday and today was undercooked. Request to upgrade kitchen staff training.",
            "anonymous": True,
            "studentId": None,
            "status": "Submitted",
            "assignedTo": "Hostel Management Committee"
        }
    ]
    for s in sample:
        create_ticket(s)
    return True
