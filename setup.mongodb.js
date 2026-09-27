use("sevasathi");

// Drop existing collection if needed (comment out after first run)
// db.schemes.deleteMany({});

db.schemes.insertMany([
  {
    id: "scheme_001",
    name: "Prototype Scholarship",
    category: "education",
    state: "Karnataka",
    description: "Sample scholarship record for the SevaSathi prototype.",
    descriptionMultilingual: {
      english: "Sample scholarship record for the SevaSathi prototype.",
      hindi: "SevaSathi प्रोटोटाइप के लिए नमूना छात्रवृत्ति रिकॉर्ड।",
      kannada: "SevaSathi ಪ್ರೋಟೋಟೈಪ್‌ಗಾಗಿ ಮಾದರಿ ವೃತ್ತಿವೇತನ ರೆಕಾರ್ಡ್।",
      tamil: "SevaSathi முன்மாதிரிக்கான மாதிரி छात्रवृत्ति பதிவு।",
      telugu: "SevaSathi ప్రోటోటైప్ కోసం నమూనా స్కాలర్‌షిప్ రికార్డ్.",
      malayalam: "SevaSathi പ്രോട്ടോടൈപ്പിന് സാമ്പിൾ സ്കോളർഷിപ്പ് റെക്കോർഡ്."
    },
    eligibility: [
      "Student",
      "Resident of Karnataka"
    ],
    incomeLimit: 250000,
    documents: [
      "Aadhaar Card",
      "Income Certificate",
      "Marks Card"
    ],
    applicationSteps: [
      "Check eligibility",
      "Prepare required documents",
      "Apply through the official portal",
      "Complete verification"
    ],
    languages: [
      "English",
      "Hindi",
      "Kannada",
      "Tamil",
      "Telugu",
      "Malayalam"
    ]
  },

  {
    id: "scheme_002",
    name: "Prototype Income Certificate",
    category: "certificate",
    state: "Karnataka",
    descriptionMultilingual: {
      english: "Digital income certificate service for verification purposes.",
      hindi: "सत्यापन उद्देश्यों के लिए डिजिटल आय प्रमाण पत्र सेवा।",
      kannada: "ಪರಿಶೀಲನೆಯ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಡಿಜಿಟಲ್ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಸೇವೆ।",
      tamil: "சரிபார்ப்பு நோக்கங்களுக்கான டிজிটல் வருமான சான்றிதழ் சேவை.",
      telugu: "సत్యాపన ప్రయోజనాల కోసం డిజిటల్ ఆదాయ సర్టिఫिকేట్ సేవ.",
      malayalam: "സാക്ഷ്യപ്പെടുത്തൽ ആവശ്യങ്ങൾക്കുള്ള ഡിജിറ്റൽ വരുമാന സർട്ടിഫിക്കേറ്റ് സേവ."
    },
    documents: [
      "Aadhaar Card",
      "Address Proof"
    ],
    applicationSteps: [
      "Check required documents",
      "Submit application",
      "Complete verification"
    ],
    languages: [
      "English",
      "Hindi",
      "Kannada",
      "Tamil",
      "Telugu",
      "Malayalam"
    ]
  }
]);

// Create indexes for better performance
db.schemes.createIndex({ state: 1 });
db.schemes.createIndex({ category: 1 });
db.schemes.createIndex({ languages: 1 });

print("✅ SevaSathi database setup completed with multilingual support!");
print("📊 Languages supported: English, Hindi, Kannada, Tamil, Telugu, Malayalam");