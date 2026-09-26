import os
import json

from dotenv import load_dotenv
from openai import OpenAI

from services.matcher import match_services


# Load environment variables from .env
load_dotenv()

# Read the OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")

# Create OpenAI client
client = OpenAI(api_key=api_key) if api_key else None


def detect_language(user_text):
    # Kannada
    if any("\u0C80" <= char <= "\u0CFF" for char in user_text):
        return "kn"

    # Telugu
    if any("\u0C00" <= char <= "\u0C7F" for char in user_text):
        return "te"

    # Tamil
    if any("\u0B80" <= char <= "\u0BFF" for char in user_text):
        return "ta"

    # Malayalam
    if any("\u0D00" <= char <= "\u0D7F" for char in user_text):
        return "ml"

    # Hindi / Devanagari
    if any("\u0900" <= char <= "\u097F" for char in user_text):
        return "hi"

    # English or other language
    return "en"


def create_action_plan(next_steps):
    action_plan = []

    for index, step in enumerate(next_steps, start=1):
        action_plan.append({
            "step": index,
            "action": step
        })

    return action_plan


def get_localized_service(service, language):
    """
    Select the translated service information
    based on the detected language.

    If a translation is not available, English
    information is used as a fallback.
    """

    translation = service.get("translations", {}).get(language, {})

    return {
        "name": translation.get(
            "name",
            service["name"]
        ),
        "category": translation.get(
            "category",
            service["category"]
        ),
        "description": translation.get(
            "description",
            service["description"]
        ),
        "why_it_matches": translation.get(
            "why_it_matches",
            service["why_it_matches"]
        ),
        "documents": translation.get(
            "documents",
            service["documents"]
        ),
        "next_steps": translation.get(
            "next_steps",
            service["next_steps"]
        ),
        "official_link": service["official_link"]
    }


def generate_ai_response(user_text, service):
    """
    Uses OpenAI to generate a natural-language explanation
    using only the information provided by the service database.
    """

    if client is None:
        return None

    language = detect_language(user_text)

    service_data = {
        "name": service["name"],
        "category": service["category"],
        "description": service["description"],
        "why_it_matches": service["why_it_matches"],
        "documents": service["documents"],
        "next_steps": service["next_steps"],
        "official_link": service["official_link"]
    }

    prompt = f"""
You are SevaSathi AI, a multilingual public-service assistant.

The user said:
{user_text}

The retrieved service information is:
{json.dumps(service_data, ensure_ascii=False, indent=2)}

Your job is to explain this service naturally and clearly.

Rules:
1. Use only the information provided in the retrieved service information.
2. Never invent eligibility rules, documents, fees, deadlines, websites, or government procedures.
3. Do not claim that an application has been submitted.
4. Explain why the service may match the user's problem.
5. Give the available documents and next steps clearly.
6. Keep the response concise and easy for a first-time applicant to understand.
7. Respond in the same language as the user whenever possible.
8. If the user wrote in Kannada, respond completely in Kannada.
9. If the user wrote in Hindi, respond completely in Hindi.
10. If the user wrote in Telugu, respond completely in Telugu.
11. If the user wrote in Tamil, respond completely in Tamil.
12. If the user wrote in Malayalam, respond completely in Malayalam.
13. Do not mention internal matching scores or technical implementation.
14. Treat the official link as a reference link only.

Detected language:
{language}
"""

    try:
        response = client.responses.create(
            model="gpt-5",
            input=prompt
        )

        return response.output_text

    except Exception:
        return None


def process_user_request(user_text):
    matched_services = match_services(user_text)

    language = detect_language(user_text)

    # -----------------------------------------
    # No service found
    # -----------------------------------------

    if isinstance(matched_services, dict):

        if language == "kn":
            return {
                "user_request": user_text,
                "response_type": "clarification",
                "message": "ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಸಹಾಯ ಬೇಕು ಎಂಬುದನ್ನು ಸ್ವಲ್ಪ ಹೆಚ್ಚು ವಿವರಿಸಬಹುದೇ?",
                "clarification_question": (
                    "ನಿಮಗೆ ಶಿಕ್ಷಣ, ಹಿರಿಯ ನಾಗರಿಕರ ಸಹಾಯ, "
                    "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಬೇರೆ ಯಾವುದೇ ಸರ್ಕಾರಿ ಸೇವೆ ಬೇಕೇ?"
                ),
                "suggestion": matched_services["suggestion"]
            }

        return {
            "user_request": user_text,
            "response_type": "clarification",
            "message": "Could you describe what kind of help you need?",
            "clarification_question": (
                "Are you looking for education support, "
                "senior-citizen support, an income certificate, "
                "or another government service?"
            ),
            "suggestion": matched_services["suggestion"]
        }

    # -----------------------------------------
    # Service found
    # -----------------------------------------

    if matched_services:

        # Get the best matching service
        top_service = matched_services[0]

        # Get service information in user's language
        localized_service = get_localized_service(
            top_service,
            language
        )

        # Create localized action plan
        action_plan = create_action_plan(
            localized_service["next_steps"]
        )

        # Generate natural-language AI explanation
        ai_response = generate_ai_response(
            user_text,
            localized_service
        )

        # -----------------------------------------
        # Localized message
        # -----------------------------------------

        if language == "kn":
            message = (
                f"ನೀವು ಬಹುಶಃ "
                f"{localized_service['name']} "
                f"ಸೇವೆಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ."
            )

        elif language == "hi":
            message = (
                f"आप शायद "
                f"{localized_service['name']} "
                f"सेवा की तलाश कर रहे हैं।"
            )

        elif language == "te":
            message = (
                f"మీరు బహుశా "
                f"{localized_service['name']} "
                f"సేవ కోసం చూస్తున్నారు."
            )

        elif language == "ta":
            message = (
                f"நீங்கள் ஒருவேளை "
                f"{localized_service['name']} "
                f"சேவையைத் தேடுகிறீர்கள்."
            )

        elif language == "ml":
            message = (
                f"നിങ്ങൾ ഒരുപക്ഷേ "
                f"{localized_service['name']} "
                f"സേവനമാണ് അന്വേഷിക്കുന്നത്."
            )

        else:
            message = (
                f"You may be looking for "
                f"{localized_service['name']}."
            )

        # Keep response_type consistent for frontend/API use
        response_type = "service_found"

        # -----------------------------------------
        # Final response
        # -----------------------------------------

        result = {
            "user_request": user_text,
            "response_type": response_type,
            "message": message,
            "why_it_matches": localized_service["why_it_matches"],
            "documents": localized_service["documents"],
            "action_plan": action_plan,
            "official_link": localized_service["official_link"],
            "matched_services": matched_services
        }

        # Add AI-generated explanation if available
        if ai_response:
            result["ai_response"] = ai_response

        return result

    # -----------------------------------------
    # Safety fallback
    # -----------------------------------------

    return {
        "user_request": user_text,
        "response_type": "clarification",
        "message": "I need a little more information to help you.",
        "clarification_question": (
            "Please tell me whether you need help with "
            "education, certificates, welfare, or another service."
        ),
        "suggestion": (
            "Please describe what kind of government service "
            "or support you need."
        )
    }