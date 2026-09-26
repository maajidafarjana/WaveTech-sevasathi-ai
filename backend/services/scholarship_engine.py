import json
from pathlib import Path
import re


def load_scholarships():
    file_path = Path(__file__).resolve().parent.parent / "data" / "scholarships.json"
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def inr(n):
    return f"₹{int(n):,}"


def match_student_scholarships(student_profile):
    name = student_profile.get("name", "Student") or "Student"
    income = float(student_profile.get("income") or 200000)
    category = student_profile.get("category", "OBC") or "OBC"
    gender = student_profile.get("gender", "Female") or "Female"
    state = student_profile.get("state", "Karnataka") or "Karnataka"
    course = student_profile.get("course", "B.Tech") or "B.Tech"
    score = float(student_profile.get("score") or 75)
    is_specially_abled = bool(student_profile.get("isSpeciallyAbled", False))

    scholarships = load_scholarships()
    results = []

    for sch in scholarships:
        match_score = 100
        qualify_reasons = []
        flags = []

        if income <= sch["maxIncome"]:
            pct = ((sch["maxIncome"] - income) / sch["maxIncome"]) * 100
            if pct > 50:
                qualify_reasons.append(
                    f"Strong financial fit: Family income {inr(income)} is well below {inr(sch['maxIncome'])} cap"
                )
            else:
                qualify_reasons.append(
                    f"Income criteria met (within {inr(sch['maxIncome'])} limit)"
                )
        else:
            match_score -= 45
            flags.append(
                f"Income {inr(income)} exceeds ceiling of {inr(sch['maxIncome'])}"
            )

        if "All" in sch["allowedGenders"]:
            pass
        elif gender in sch["allowedGenders"]:
            match_score += 10
            qualify_reasons.append(f"Targeted benefit for {gender} candidates")
        else:
            match_score -= 60
            flags.append(
                f"Reserved exclusively for {', '.join(sch['allowedGenders'])} applicants"
            )

        if category in sch["allowedCategories"] or "General" in sch["allowedCategories"]:
            qualify_reasons.append(f"Category '{category}' is fully eligible")
        else:
            match_score -= 40
            flags.append(
                f"Eligible categories: {', '.join(sch['allowedCategories'])}"
            )

        if "All India" in sch["allowedStates"] or state in sch["allowedStates"]:
            qualify_reasons.append(f"State of domicile '{state}' eligible")
        else:
            match_score -= 35
            flags.append(
                f"Restricted to {', '.join(sch['allowedStates'])} residents"
            )

        course_lc = course.lower()
        course_matches = any(
            course_lc in c.lower() or c.lower() in course_lc
            for c in sch["courses"]
        )
        if course_matches:
            qualify_reasons.append(f"Covers your course '{course}'")
        else:
            match_score -= 25
            flags.append(
                f"Primary courses: {', '.join(sch['courses'][:3])}"
            )

        if score >= sch["minPercentage"]:
            qualify_reasons.append(
                f"Academic score ({score}%) meets minimum cutoff ({sch['minPercentage']}%)"
            )
        else:
            match_score -= 20
            flags.append(
                f"Minimum {sch['minPercentage']}% required in previous board/exam"
            )

        if sch["id"] == "aicte-saksham":
            if is_specially_abled:
                match_score += 25
                qualify_reasons.append(
                    "Priority match for specially-abled students with UDID"
                )
            else:
                match_score -= 50
                flags.append("Requires 40%+ physical disability certification")

        match_score = max(15, min(99, match_score))

        results.append({
            **sch,
            "matchScore": match_score,
            "isEligible": match_score >= 70,
            "qualifyReasons": qualify_reasons,
            "flags": flags
        })

    results.sort(key=lambda s: (-s["matchScore"], s["daysLeft"]))
    return results


def detect_scholarship_keywords(text, scholarships):
    lower = text.lower()
    matches = []
    for sch in scholarships:
        score = 0
        haystacks = [sch["name"], sch["organization"], " ".join(sch["tags"])]
        for h in haystacks:
            if h.lower() in lower or lower in h.lower():
                score += 3
        for kw in re.findall(r"\b[a-z0-9]{3,}\b", lower):
            if kw in sch["name"].lower() or kw in sch["organization"].lower():
                score += 1
        if score > 0:
            matches.append((score, sch))
    matches.sort(key=lambda x: -x[0])
    return [m[1] for m in matches[:3]]


def generate_chat_reply(user_message, language_code, student_profile):
    scholarships = load_scholarships()
    matches = match_student_scholarships(student_profile)
    eligible = [m for m in matches if m["isEligible"]]
    display_list = eligible[:4] if eligible else matches[:3]

    lower = user_message.lower()
    name = student_profile.get("name") or "Student"
    income = student_profile.get("income") or 200000
    course = student_profile.get("course") or "Technical/Degree"
    state = student_profile.get("state") or "India"
    income_fmt = f"₹{int(income):,}"

    if "document" in lower or "ssp" in lower or "required" in lower:
        reply = (
            f"Here are the essential documents required for {state} scholarships: "
            "1) Aadhaar seeded with Bank Account, 2) Income Certificate (RD Number in Karnataka), "
            "3) Caste/Category Certificate, 4) Current Year College Fee Receipt, "
            "5) Previous Marksheets. Below are the scholarships matching your profile:"
        )
    elif len(display_list) > 0:
        reply = (
            f"Great news, {name}! 🎉 Based on family income {income_fmt} and course ({course}), "
            f"you qualify for {len(display_list)} verified scholarships! "
            "Tap any scholarship below to see step-by-step application instructions and required documents:"
        )
    else:
        reply = (
            f"I have analyzed our database of Indian scholarships. "
            f"Here are the top scholarships that fit students in {state}:"
        )

    keyword = detect_scholarship_keywords(user_message, scholarships)
    if keyword:
        keyword_ids = [k["id"] for k in keyword]
        ordered = []
        for k in keyword:
            enriched = next((m for m in matches if m["id"] == k["id"]), k)
            if enriched not in ordered:
                ordered.append(enriched)
        for m in display_list:
            if m["id"] not in keyword_ids:
                ordered.append(m)
        display_list = ordered[:4]

    return reply, display_list
