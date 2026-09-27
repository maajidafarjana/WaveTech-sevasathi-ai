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


def classify_user_intent(user_message):
    lower = (user_message or "").lower()
    scheme_keywords = [
        "ssp", "karnataka", "pragati", "saksham", "aicte", "reliance", "central sector",
        "csss", "pm-usp", "hdfc", "badhte kadam", "tata", "ongc", "vidyasaarathi", "snl",
        "minority", "minorities", "jindal", "sitaram", "kvpy", "inspire", "faea", "loreal", "l'oreal", "nsp"
    ]
    inquiry_words = [
        "document", "documents", "required", "checklist", "needed", "eligibility",
        "eligible", "criteria", "deadline", "last date", "apply", "steps", "procedure",
        "how to", "tell me about", "what is", "portal", "link", "guideline", "guidelines"
    ]

    matched_kw = next((kw for kw in scheme_keywords if kw in lower), None)
    has_inquiry = any(w in lower for w in inquiry_words)

    if matched_kw or (has_inquiry and "my profile" not in lower and "find scholarship" not in lower and "show scholarship" not in lower):
        return "SPECIFIC_QUERY", matched_kw

    return "PROFILE_MATCH", None


def find_specific_scholarship(target_or_message, scholarships):
    if not target_or_message:
        return None
    lower = target_or_message.lower().strip()

    alias_map = [
        (["ssp", "post-matric karnataka", "karnataka post matric", "ssp karnataka", "karnataka scholarship"], "ssp-karnataka"),
        (["pragati", "aicte pragati", "girls engineering"], "aicte-pragati"),
        (["saksham", "aicte saksham", "specially-abled"], "aicte-saksham"),
        (["reliance", "reliance foundation", "dhirubhai"], "reliance-foundation-ug"),
        (["central sector", "pm-usp", "csss", "nsp"], "nsp-central-sector"),
        (["badhte kadam", "hdfc"], "hdfc-badhte-kadam"),
        (["tata trusts", "tata"], "tata-trusts-scholarship"),
        (["ongc"], "ongc-scholarship"),
        (["vidyasaarathi", "snl"], "vidyasaarathi-snl"),
        (["minority", "minorities"], "post-matric-minorities"),
        (["jindal", "sitaram"], "sitaram-jindal"),
        (["kvpy", "inspire"], "kvpy-inspire"),
        (["faea"], "faea-scholarship"),
        (["loreal", "l'oreal"], "loreal-for-women"),
    ]

    for keys, sid in alias_map:
        if any(k in lower for k in keys):
            match = next((s for s in scholarships if s["id"] == sid), None)
            if match:
                return match

    for s in scholarships:
        if s["id"].lower() in lower or lower in s["id"].lower():
            return s
        if s["name"].lower() in lower or lower in s["name"].lower():
            return s

    return None


def generate_chat_reply(user_message, language_code, student_profile):
    scholarships = load_scholarships()
    intent, target = classify_user_intent(user_message)

    if intent == "SPECIFIC_QUERY":
        specific = find_specific_scholarship(target or user_message, scholarships)
        if specific:
            docs_list = "\n".join([f"- ✅ **{d}**" for d in specific.get("documents", [])])
            steps_list = "\n".join([f"{i+1}. {st}" for i, st in enumerate(specific.get("applicationSteps", []))])
            official_url = specific.get("officialLink") or specific.get("officialUrl") or "#"

            reply = (
                f"### 🏛️ {specific['name']}\n"
                f"**Provider:** {specific.get('provider') or specific.get('organization', 'Official Authority')}  \n"
                f"💰 **Grant Amount:** {specific['amount']} | 🗓️ **Deadline:** {specific['deadline']}\n\n"
                f"{specific.get('description', '')}\n\n"
                f"📋 **Required Documents Checklist:**\n"
                f"{docs_list}\n\n"
                f"📝 **Step-by-Step Application Guide:**\n"
                f"{steps_list}\n\n"
                f"🔗 **Official Portal:** [Apply on Official Portal]({official_url})"
            )
            return reply, [specific], "SPECIFIC_QUERY"
        else:
            reply = (
                f"I couldn't find a verified scheme matching '{target or user_message}' in our database. "
                "You can ask about SSP Karnataka, AICTE Pragati, Reliance Foundation, or NSP Central Sector."
            )
            return reply, [], "SPECIFIC_QUERY"

    # PROFILE_MATCH intent
    matches = match_student_scholarships(student_profile)
    eligible = [m for m in matches if m["isEligible"]]
    display_list = eligible[:4] if eligible else matches[:3]

    course = student_profile.get("course") or "Technical/Degree"
    income = student_profile.get("income") or 200000
    income_fmt = f"₹{int(income):,}"

    reply = (
        f"Hello! 👋 Based on your profile ({course}, annual income {income_fmt}), "
        f"SevaSathi AI has discovered **{len(display_list)} verified scholarships** matching your eligibility. "
        "Review key details and apply directly using the cards below:"
    )

    return reply, display_list, "PROFILE_MATCH"

