from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pathlib import Path
import json
from typing import Optional, List
from pydantic import BaseModel, Field

from services.matcher import match_services
from services.ai_agent import process_user_request

router = APIRouter()

SUPPORTED_LANGUAGES = ["en", "kn", "hi", "te", "ta", "ml"]


class MatchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000,
                       description="User's natural-language request describing their need")
    language: Optional[str] = Field(
        None,
        description="Optional explicit language code. Auto-detected if omitted. Supported: en, kn, hi, te, ta, ml"
    )


class AssistantRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000,
                       description="User's natural-language request describing their need")
    language: Optional[str] = Field(
        None,
        description="Optional explicit language code. Auto-detected if omitted. Supported: en, kn, hi, te, ta, ml"
    )


def load_services_data():
    file_path = Path(__file__).resolve().parent.parent / "data" / "services.json"
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def apply_explicit_language(result, language):
    """
    Override the matched-service display language when the caller
    explicitly requested one. Only mutates dict-style payloads that
    already contain display strings.
    """
    if language not in SUPPORTED_LANGUAGES:
        return result

    services = load_services_data()

    # /assistant result with top service
    if isinstance(result, dict) and result.get("response_type") == "service_found":
        top = None
        for svc in services:
            localized = svc.get("translations", {}).get(language, {})
            candidate_name = localized.get("name", svc["name"])
            if candidate_name == result.get("message", "").replace(
                "You may be looking for ", ""
            ).replace(".", "") or (
                result.get("why_it_matches")
                and (
                    result["why_it_matches"] == svc.get("why_it_matches")
                    or result["why_it_matches"] == localized.get("why_it_matches")
                )
            ):
                top = svc
                break

        if top:
            localized = top.get("translations", {}).get(language, {})
            result["why_it_matches"] = localized.get(
                "why_it_matches", top["why_it_matches"]
            )
            result["documents"] = localized.get("documents", top["documents"])
            result["action_plan"] = [
                {"step": i + 1, "action": step}
                for i, step in enumerate(
                    localized.get("next_steps", top["next_steps"])
                )
            ]

        for ms in result.get("matched_services", []):
            for svc in services:
                localized = svc.get("translations", {}).get(language, {})
                if (
                    localized.get("name", svc["name"]) == ms.get("name")
                    or svc.get("why_it_matches") == ms.get("why_it_matches")
                    or localized.get("why_it_matches") == ms.get("why_it_matches")
                ):
                    ms["name"] = localized.get("name", svc["name"])
                    ms["category"] = localized.get("category", svc["category"])
                    ms["description"] = localized.get(
                        "description", svc["description"]
                    )
                    ms["why_it_matches"] = localized.get(
                        "why_it_matches", svc["why_it_matches"]
                    )
                    ms["documents"] = localized.get("documents", svc["documents"])
                    ms["next_steps"] = localized.get(
                        "next_steps", svc["next_steps"]
                    )
                    break

    # /match list result
    if isinstance(result, list):
        services_by_why = {}
        for svc in services:
            services_by_why[svc.get("why_it_matches")] = svc
            for lang, loc in svc.get("translations", {}).items():
                services_by_why[loc.get("why_it_matches")] = svc

        for ms in result:
            svc = (
                services_by_why.get(ms.get("why_it_matches"))
                if ms.get("why_it_matches")
                else None
            )
            if svc:
                localized = svc.get("translations", {}).get(language, {})
                ms["name"] = localized.get("name", svc["name"])
                ms["category"] = localized.get("category", svc["category"])
                ms["description"] = localized.get(
                    "description", svc["description"]
                )
                ms["why_it_matches"] = localized.get(
                    "why_it_matches", svc["why_it_matches"]
                )
                ms["documents"] = localized.get("documents", svc["documents"])
                ms["next_steps"] = localized.get(
                    "next_steps", svc["next_steps"]
                )

    return result


def validate_language(language: Optional[str]):
    if language is not None and language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Unsupported language",
                "supported": SUPPORTED_LANGUAGES,
                "message": f"Language '{language}' is not supported. Use one of: {', '.join(SUPPORTED_LANGUAGES)}"
            }
        )


@router.get("/")
def get_services(language: Optional[str] = Query(
    None,
    description="Optional language code for translations. Supported: en, kn, hi, te, ta, ml"
)):
    validate_language(language)
    services = load_services_data()

    if language is None or language == "en":
        return {
            "count": len(services),
            "services": services
        }

    translated = []
    for svc in services:
        localized = svc.get("translations", {}).get(language, {})
        translated.append({
            "id": svc["id"],
            "name": localized.get("name", svc["name"]),
            "category": localized.get("category", svc["category"]),
            "description": localized.get("description", svc["description"]),
            "keywords": svc["keywords"],
            "why_it_matches": localized.get("why_it_matches", svc["why_it_matches"]),
            "documents": localized.get("documents", svc["documents"]),
            "next_steps": localized.get("next_steps", svc["next_steps"]),
            "official_link": svc.get("official_link"),
            "language": language
        })

    return {
        "count": len(translated),
        "services": translated,
        "language": language
    }


@router.get("/match")
def find_matching_services(
    query: str = Query(..., min_length=2, max_length=1000),
    language: Optional[str] = Query(
        None,
        description="Optional explicit language code. Auto-detected if omitted."
    )
):
    validate_language(language)
    if not query or not query.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Empty query",
                "message": "Please provide a non-empty search query."
            }
        )

    result = match_services(query.strip())
    if language:
        result = apply_explicit_language(result, language)

    if isinstance(result, dict) and "message" in result and "matched_services" not in result:
        return JSONResponse(status_code=200, content={
            "matched": False,
            "query": query.strip(),
            "language": language or "auto",
            **result
        })

    return {
        "matched": True,
        "count": len(result),
        "query": query.strip(),
        "language": language or "auto",
        "services": result
    }


@router.post("/match")
def find_matching_services_post(request: MatchRequest):
    validate_language(request.language)
    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Empty query",
                "message": "Please provide a non-empty search query."
            }
        )

    result = match_services(request.query.strip())
    if request.language:
        result = apply_explicit_language(result, request.language)

    if isinstance(result, dict) and "message" in result and "matched_services" not in result:
        return {
            "matched": False,
            "query": request.query.strip(),
            "language": request.language or "auto",
            **result
        }

    return {
        "matched": True,
        "count": len(result),
        "query": request.query.strip(),
        "language": request.language or "auto",
        "services": result
    }


@router.get("/assistant")
def assistant_request(
    query: str = Query(..., min_length=2, max_length=1000),
    language: Optional[str] = Query(
        None,
        description="Optional explicit language code. Auto-detected if omitted."
    )
):
    validate_language(language)
    if not query or not query.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Empty query",
                "message": "Please provide a non-empty query describing your need."
            }
        )

    result = process_user_request(query.strip())
    if language:
        result = apply_explicit_language(result, language)
    return result


@router.post("/assistant")
def assistant_request_post(request: AssistantRequest):
    validate_language(request.language)
    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Empty query",
                "message": "Please provide a non-empty query describing your need."
            }
        )

    result = process_user_request(request.query.strip())
    if request.language:
        result = apply_explicit_language(result, request.language)
    return result


@router.get("/meta/languages")
def get_supported_languages():
    return {
        "count": len(SUPPORTED_LANGUAGES),
        "languages": [
            {"code": "en", "name": "English", "native": "English"},
            {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ"},
            {"code": "hi", "name": "Hindi", "native": "हिन्दी"},
            {"code": "te", "name": "Telugu", "native": "తెలుగు"},
            {"code": "ta", "name": "Tamil", "native": "தமிழ்"},
            {"code": "ml", "name": "Malayalam", "native": "മലയാളം"}
        ]
    }


@router.get("/{service_id}")
def get_service_by_id(
    service_id: str,
    language: Optional[str] = Query(
        None,
        description="Optional language code for translations. Supported: en, kn, hi, te, ta, ml"
    )
):
    validate_language(language)
    services = load_services_data()

    for svc in services:
        if svc["id"] == service_id:
            if language is None or language == "en":
                return svc
            localized = svc.get("translations", {}).get(language, {})
            return {
                "id": svc["id"],
                "name": localized.get("name", svc["name"]),
                "category": localized.get("category", svc["category"]),
                "description": localized.get("description", svc["description"]),
                "keywords": svc["keywords"],
                "why_it_matches": localized.get("why_it_matches", svc["why_it_matches"]),
                "documents": localized.get("documents", svc["documents"]),
                "next_steps": localized.get("next_steps", svc["next_steps"]),
                "official_link": svc.get("official_link"),
                "language": language
            }

    raise HTTPException(
        status_code=404,
        detail={
            "error": "Service not found",
            "message": f"No service with id '{service_id}' exists."
        }
    )
