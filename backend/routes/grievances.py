from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from services.grievance_store import (
    get_all_tickets,
    create_ticket,
    upvote_ticket,
)

router = APIRouter()


class GrievancePayload(BaseModel):
    ticketId: Optional[str] = None
    problemTitle: str = Field(..., min_length=3, max_length=200)
    category: Optional[str] = "Wi-Fi & Internet"
    urgency: Optional[str] = "Medium"
    location: Optional[str] = ""
    description: str = Field(..., min_length=5, max_length=5000)
    anonymous: Optional[bool] = False
    studentId: Optional[str] = None
    status: Optional[str] = "Submitted"
    assignedTo: Optional[str] = "Campus Maintenance Team"
    upvotes: Optional[int] = 0


def _format_ticket(t):
    return {
        "ticketId": t.get("ticketId"),
        "problemTitle": t.get("problemTitle"),
        "category": t.get("category"),
        "urgency": t.get("urgency"),
        "location": t.get("location"),
        "description": t.get("description"),
        "anonymous": t.get("anonymous", False),
        "studentId": t.get("studentId"),
        "status": t.get("status"),
        "assignedTo": t.get("assignedTo"),
        "upvotes": t.get("upvotes", 0),
        "createdAt": t.get("createdAt"),
        "updatedAt": t.get("updatedAt")
    }


@router.get("")
@router.get("/")
def list_grievances():
    """GET /api/grievances - used by Report Problem page."""
    tickets = get_all_tickets()
    formatted = [_format_ticket(t) for t in tickets]
    return {"success": True, "count": len(formatted), "tickets": formatted}


@router.post("")
@router.post("/")
def submit_grievance(payload: GrievancePayload):
    """POST /api/grievances - submit new grievance ticket."""
    ticket = create_ticket(payload.model_dump())
    return {"success": True, "message": "Grievance ticket submitted successfully.", "ticket": _format_ticket(ticket)}


@router.patch("/{ticket_id}/upvote")
def upvote_grievance(ticket_id: str):
    """PATCH /api/grievances/{ticket_id}/upvote - upvote a ticket."""
    updated = upvote_ticket(ticket_id)
    if not updated:
        raise HTTPException(status_code=404, detail={
            "success": False, "error": "Ticket not found",
            "message": f"No grievance ticket with id '{ticket_id}'"
        })
    return {"success": True, "message": "Upvoted successfully.", "ticket": _format_ticket(updated)}
