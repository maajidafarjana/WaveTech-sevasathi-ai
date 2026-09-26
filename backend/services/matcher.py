import json
from pathlib import Path


def load_services():
    file_path = Path(__file__).resolve().parent.parent / "data" / "services.json"

    with open(file_path, "r", encoding="utf-8") as file:
        services = json.load(file)

    return services


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

    # Hindi
    if any("\u0900" <= char <= "\u097F" for char in user_text):
        return "hi"

    return "en"


def match_services(user_text):
    original_text = user_text
    user_text = user_text.lower()

    services = load_services()
    matched_services = []

    language = detect_language(original_text)

    # -----------------------------------------
    # English problem phrases
    # -----------------------------------------

    problem_phrases = {
        "student-scholarship": [
            "college fees",
            "school fees",
            "education fees",
            "pay my fees",
            "paying my fees",
            "help with fees",
            "financial help for studies",
            "financial help for education",
            "money for studies",
            "money for education",
            "education financial support",
            "study financial support",
            "cannot afford fees",
            "can't afford fees",
            "need financial support for studies",
            "need financial support for education",
            "help paying college",
            "help paying college fees",
            "tuition fees",
            "funding for studies",
            "funding for education",
            "student financial assistance"
        ],

        "senior-citizen-support": [
            "help for my elderly parents",
            "help for elderly",
            "support for elderly",
            "support for old people",
            "financial help for elderly",
            "financial support for elderly",
            "help for senior citizen",
            "support for senior citizen",
            "old age support",
            "old age financial help",
            "pension help",
            "need pension",
            "elderly welfare"
        ],

        "income-certificate": [
            "proof of income",
            "need proof of income",
            "official proof of income",
            "document showing income",
            "certificate for income",
            "income document",
            "family income proof",
            "family income certificate",
            "need an income certificate",
            "need income certificate"
        ]
    }

    # -----------------------------------------
    # Kannada problem phrases
    # -----------------------------------------

    kannada_problem_phrases = {
        "student-scholarship": [
            "ಫೀಸ್ ಕಟ್ಟಲು ಸಹಾಯ",
            "ಕಾಲೇಜು ಫೀಸ್",
            "ಶಿಕ್ಷಣಕ್ಕೆ ಹಣದ ಸಹಾಯ",
            "ಓದಲು ಹಣದ ಸಹಾಯ",
            "ಓದಿಗೆ ಆರ್ಥಿಕ ಸಹಾಯ",
            "ಶಿಕ್ಷಣಕ್ಕೆ ಆರ್ಥಿಕ ಸಹಾಯ"
        ],

        "senior-citizen-support": [
            "ಹಿರಿಯರಿಗೆ ಸಹಾಯ",
            "ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಸಹಾಯ",
            "ವಯಸ್ಸಾದವರಿಗೆ ಸಹಾಯ",
            "ಹಿರಿಯರಿಗೆ ಆರ್ಥಿಕ ಸಹಾಯ",
            "ಪಿಂಚಣಿ ಸಹಾಯ"
        ],

        "income-certificate": [
            "ಆದಾಯದ ಪುರಾವೆ",
            "ಆದಾಯದ ದಾಖಲೆ",
            "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಬೇಕು",
            "ಕುಟುಂಬದ ಆದಾಯದ ಪುರಾವೆ"
        ]
    }

    # -----------------------------------------
    # Telugu problem phrases
    # -----------------------------------------

    telugu_problem_phrases = {
        "student-scholarship": [
            "కాలేజీ ఫీజు",
            "ఫీజు చెల్లించడానికి సహాయం",
            "ఫీజు చెల్లించేందుకు సహాయం",
            "చదువుకు ఆర్థిక సహాయం",
            "విద్యకు ఆర్థిక సహాయం",
            "చదువుకోవడానికి డబ్బు సహాయం",
            "విద్య కోసం ఆర్థిక సహాయం",
            "కాలేజీ ఫీజు చెల్లించడానికి",
            "విద్యార్థులకు ఆర్థిక సహాయం"
        ],

        "senior-citizen-support": [
            "వృద్ధులకు సహాయం",
            "వృద్ధులకు ఆర్థిక సహాయం",
            "వృద్ధుల సహాయం",
            "వృద్ధులకు సంక్షేమం",
            "పెన్షన్ సహాయం",
            "వృద్ధుల కోసం సహాయం"
        ],

        "income-certificate": [
            "ఆదాయ ధృవీకరణ పత్రం",
            "ఆదాయ ధృవీకరణ",
            "ఆదాయానికి రుజువు",
            "ఆదాయ పత్రం",
            "కుటుంబ ఆదాయ ధృవీకరణ",
            "ఆదాయ సర్టిఫికెట్"
        ]
    }

    # -----------------------------------------
    # Tamil problem phrases
    # -----------------------------------------

    tamil_problem_phrases = {
        "student-scholarship": [
            "கல்லூரி கட்டணம்",
            "கல்லூரி கட்டணத்தை செலுத்த உதவி",
            "என் கல்லூரி கட்டணத்தை செலுத்த உதவி",
            "கட்டணம் செலுத்த உதவி",
            "படிப்புக்கு நிதி உதவி",
            "கல்விக்கு நிதி உதவி",
            "படிப்பதற்கு பண உதவி",
            "கல்லூரி கட்டணம் செலுத்த",
            "மாணவர்களுக்கு நிதி உதவி"
        ],

        "senior-citizen-support": [
            "மூத்த குடிமக்களுக்கு உதவி",
            "வயதானவர்களுக்கு உதவி",
            "மூத்தவர்களுக்கு நிதி உதவி",
            "மூத்த குடிமக்கள் உதவி",
            "ஓய்வூதிய உதவி",
            "வயதானவர்களுக்கு நலத்திட்ட உதவி"
        ],

        "income-certificate": [
            "வருமானச் சான்றிதழ்",
            "வருமான சான்றிதழ்",
            "வருமானத்திற்கான சான்று",
            "வருமான ஆவணம்",
            "குடும்ப வருமானச் சான்று",
            "வருமான சான்று"
        ]
    }

    # -----------------------------------------
    # Malayalam problem phrases
    # -----------------------------------------

    malayalam_problem_phrases = {
        "student-scholarship": [
            "കോളേജ് ഫീസ്",
            "ഫീസ് അടയ്ക്കാൻ സഹായം",
            "പഠനത്തിന് സാമ്പത്തിക സഹായം",
            "വിദ്യാഭ്യാസത്തിന് സാമ്പത്തിക സഹായം",
            "പഠിക്കാൻ പണം സഹായം",
            "കോളേജ് ഫീസ് അടയ്ക്കാൻ",
            "വിദ്യാർത്ഥികൾക്ക് സാമ്പത്തിക സഹായം"
        ],

        "senior-citizen-support": [
            "മുതിർന്നവർക്ക് സഹായം",
            "മുതിർന്ന പൗരന്മാർക്ക് സഹായം",
            "വയസ്സായവർക്ക് സഹായം",
            "മുതിർന്നവർക്ക് സാമ്പത്തിക സഹായം",
            "പെൻഷൻ സഹായം",
            "മുതിർന്ന പൗരന്മാരുടെ സഹായം"
        ],

        "income-certificate": [
            "വരുമാന സർട്ടിഫിക്കറ്റ്",
            "വരുമാനത്തിന്റെ തെളിവ്",
            "വരുമാന രേഖ",
            "കുടുംബ വരുമാന സർട്ടിഫിക്കറ്റ്",
            "വരുമാന സർട്ടിഫിക്കറ്റ് വേണം"
        ]
    }

    # -----------------------------------------
    # Hindi problem phrases
    # -----------------------------------------

    hindi_problem_phrases = {
        "student-scholarship": [
            "कॉलेज की फीस",
            "फीस भरने में मदद",
            "फीस भरने के लिए मदद",
            "पढ़ाई के लिए आर्थिक सहायता",
            "शिक्षा के लिए आर्थिक सहायता",
            "पढ़ाई के लिए पैसे की मदद",
            "कॉलेज फीस भरने",
            "छात्रों के लिए आर्थिक सहायता"
        ],

        "senior-citizen-support": [
            "बुजुर्गों के लिए सहायता",
            "वरिष्ठ नागरिकों के लिए सहायता",
            "बुजुर्गों के लिए आर्थिक सहायता",
            "वृद्ध लोगों की मदद",
            "पेंशन सहायता",
            "वरिष्ठ नागरिक सहायता"
        ],

        "income-certificate": [
            "आय प्रमाण पत्र",
            "आय का प्रमाण",
            "आय से संबंधित दस्तावेज",
            "परिवार की आय का प्रमाण",
            "आय प्रमाण पत्र चाहिए"
        ]
    }

    # -----------------------------------------
    # General multilingual keywords
    # -----------------------------------------

    multilingual_keywords = {
        "student-scholarship": [
            # Kannada
            "ವಿದ್ಯಾರ್ಥಿ",
            "ವಿದ್ಯಾರ್ಥಿವೇತನ",
            "ಶಿಕ್ಷಣ",
            "ಫೀಸ್",
            "ಸ್ಕಾಲರ್‌ಶಿಪ್",

            # Telugu
            "విద్యార్థి",
            "స్కాలర్‌షిప్",
            "విద్య",
            "ఫీజు",

            # Tamil
            "மாணவர்",
            "உதவித்தொகை",
            "கல்வி",
            "கட்டணம்",

            # Malayalam
            "വിദ്യാർത്ഥി",
            "സ്കോളർഷിപ്പ്",
            "വിദ്യാഭ്യാസം",
            "ഫീസ്",

            # Hindi
            "छात्र",
            "छात्रवृत्ति",
            "शिक्षा",
            "फीस"
        ],

        "senior-citizen-support": [
            # Kannada
            "ಹಿರಿಯ ನಾಗರಿಕ",
            "ಹಿರಿಯ",
            "ಪಿಂಚಣಿ",
            "ಮುದಿಯೆರೆ",

            # Telugu
            "వృద్ధ",
            "పెన్షన్",
            "వృద్ధులు",

            # Tamil
            "மூத்த",
            "ஓய்வூதியம்",
            "வயதானவர்",

            # Malayalam
            "മുതിർന്ന",
            "പെൻഷൻ",
            "വയസ്സായ",

            # Hindi
            "वरिष्ठ",
            "बुजुर्ग",
            "पेंशन"
        ],

        "income-certificate": [
            # Kannada
            "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
            "ಆದಾಯ",
            "ಆದಾಯದ ಪ್ರಮಾಣಪತ್ರ",

            # Telugu
            "ఆదాయ ధృవీకరణ",
            "ఆదాయం",
            "ఆదాయ సర్టిఫికెట్",

            # Tamil
            "வருமானச் சான்றிதழ்",
            "வருமானம்",
            "வருமான சான்றிதழ்",

            # Malayalam
            "വരുമാന സർട്ടിഫിക്കറ്റ്",
            "വരുമാനം",
            "വരുമാന സാക്ഷ്യപത്രം",

            # Hindi
            "आय प्रमाण पत्र",
            "आय",
            "आय प्रमाण"
        ]
    }

    # -----------------------------------------
    # Match every service
    # -----------------------------------------

    for service in services:
        score = 0

        service_id = service["id"]

        # Direct English keywords from services.json
        for keyword in service["keywords"]:
            if keyword.lower() in user_text:
                score += 1

        # Multilingual keywords
        for keyword in multilingual_keywords.get(service_id, []):
            if keyword.lower() in original_text.lower():
                score += 1

        # English problem phrases
        for phrase in problem_phrases.get(service_id, []):
            if phrase.lower() in user_text:
                score += 2

        # Kannada problem phrases
        for phrase in kannada_problem_phrases.get(service_id, []):
            if phrase in original_text:
                score += 2

        # Telugu problem phrases
        for phrase in telugu_problem_phrases.get(service_id, []):
            if phrase in original_text:
                score += 2

        # Tamil problem phrases
        for phrase in tamil_problem_phrases.get(service_id, []):
            if phrase in original_text:
                score += 2

        # Malayalam problem phrases
        for phrase in malayalam_problem_phrases.get(service_id, []):
            if phrase in original_text:
                score += 2

        # Hindi problem phrases
        for phrase in hindi_problem_phrases.get(service_id, []):
            if phrase in original_text:
                score += 2

        # -----------------------------------------
        # Add matched service
        # -----------------------------------------

        if score > 0:

            translated = service.get(
                "translations",
                {}
            ).get(language)

            if translated:
                display_name = translated.get(
                    "name",
                    service["name"]
                )

                display_category = translated.get(
                    "category",
                    service["category"]
                )

                display_description = translated.get(
                    "description",
                    service["description"]
                )

                display_why = translated.get(
                    "why_it_matches",
                    service["why_it_matches"]
                )

                display_documents = translated.get(
                    "documents",
                    service["documents"]
                )

                display_next_steps = translated.get(
                    "next_steps",
                    service["next_steps"]
                )

            else:
                display_name = service["name"]
                display_category = service["category"]
                display_description = service["description"]
                display_why = service["why_it_matches"]
                display_documents = service["documents"]
                display_next_steps = service["next_steps"]

            matched_services.append({
                "name": display_name,
                "category": display_category,
                "description": display_description,
                "why_it_matches": display_why,
                "documents": display_documents,
                "next_steps": display_next_steps,
                "official_link": service["official_link"],
                "match_score": score
            })

    # -----------------------------------------
    # Highest matching service first
    # -----------------------------------------

    matched_services.sort(
        key=lambda service: service["match_score"],
        reverse=True
    )

    # -----------------------------------------
    # No service found
    # -----------------------------------------

    if not matched_services:

        if language == "kn":
            return {
                "message": "ನಿಮ್ಮ ವಿನಂತಿಗೆ ಹೊಂದುವ ಯಾವುದೇ ಪರಿಶೀಲಿತ ಸೇವೆ ಕಂಡುಬಂದಿಲ್ಲ.",
                "suggestion": "ದಯವಿಟ್ಟು ನಿಮಗೆ ಬೇಕಾದ ಸಹಾಯ ಅಥವಾ ಸೇವೆಯ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಿನ ವಿವರ ನೀಡಿ."
            }

        elif language == "te":
            return {
                "message": "మీ అభ్యర్థనకు సరిపోయే సేవ ఏదీ కనుగొనబడలేదు.",
                "suggestion": "దయచేసి మీకు కావాల్సిన సహాయం లేదా సేవ గురించి మరింత వివరంగా చెప్పండి."
            }

        elif language == "ta":
            return {
                "message": "உங்கள் கோரிக்கைக்கு பொருந்தும் சேவை எதுவும் கிடைக்கவில்லை.",
                "suggestion": "உங்களுக்கு தேவையான உதவி அல்லது சேவையைப் பற்றி மேலும் விவரமாக கூறவும்."
            }

        elif language == "ml":
            return {
                "message": "നിങ്ങളുടെ അഭ്യർത്ഥനയ്ക്ക് അനുയോജ്യമായ സേവനം കണ്ടെത്താനായില്ല.",
                "suggestion": "നിങ്ങൾക്ക് ആവശ്യമായ സഹായമോ സേവനമോ കൂടുതൽ വിശദമായി പറയുക."
            }

        elif language == "hi":
            return {
                "message": "आपके अनुरोध से मेल खाने वाली कोई सेवा नहीं मिली।",
                "suggestion": "कृपया अपनी समस्या या आवश्यक सेवा के बारे में अधिक जानकारी दें।"
            }

        return {
            "message": "I could not find a verified service matching your request.",
            "suggestion": "Please describe your problem in more detail so I can try again."
        }

    return matched_services