// Comprehensive Database of Verified Indian Scholarships for SevaSathi AI

export const SCHOLARSHIPS_DATA = [
  {
    id: "ssp-karnataka",
    name: "SSP Karnataka Post-Matric Scholarship",
    organization: "Government of Karnataka",
    category: "Government",
    description: "State-funded fee concession, maintenance allowance, and hostel assistance for pre-university, undergraduate, and post-graduate students residing in Karnataka.",
    maxIncome: 250000, // INR per year (relaxable up to 2.5L or 10L for specific SC/ST subcategories)
    allowedCategories: ["SC", "ST", "OBC", "Minority", "EWS", "General"],
    allowedGenders: ["All"],
    allowedStates: ["Karnataka"],
    courses: ["B.Tech", "BE", "Diploma", "B.Sc", "B.Com", "B.A", "MBBS", "Post-Graduate", "PUC"],
    minPercentage: 50,
    amount: "₹25,000 – ₹60,000 / year",
    deadline: "30 Nov 2026",
    daysLeft: 65,
    officialUrl: "https://ssp.postmatric.karnataka.gov.in/",
    tags: ["State Scheme", "Tuition Reimbursement", "Karnataka", "Hostel Fee"],
    documents: [
      "Aadhaar Number (seeded with Bank Account)",
      "Caste & Income Certificate RD Number (Nadakacheri)",
      "College Registration Number & Fee Receipt",
      "SSLC / 10th & PUC / 12th Marks Card",
      "e-Attestation of study documents"
    ],
    applicationSteps: [
      "Create an account on the Karnataka SSP Post-Matric portal with your Aadhaar.",
      "Get your study, fee, and previous marksheets e-Attested by your college e-Attestation officer.",
      "Enter your Caste/Income Certificate RD numbers from Nadakacheri.",
      "Submit the application and download the acknowledgement receipt to submit to your college scholarship desk."
    ]
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship for Girl Students",
    organization: "All India Council for Technical Education (AICTE)",
    category: "Government",
    description: "Prestigious scheme by Ministry of Education to empower girl students pursuing technical diploma or degree courses in AICTE-approved institutions.",
    maxIncome: 800000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["Female"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Telangana", "Andhra Pradesh", "Delhi", "Uttar Pradesh"],
    courses: ["B.Tech", "BE", "B.Arch", "B.Pharm", "Diploma"],
    minPercentage: 60,
    amount: "₹50,000 / year",
    deadline: "15 Dec 2026",
    daysLeft: 80,
    officialUrl: "https://scholarships.gov.in/",
    tags: ["Girls Only", "AICTE", "Engineering & Tech", "Central Govt"],
    documents: [
      "Mark sheet of Class 10th & 12th / ITI",
      "Annual Family Income Certificate issued by Tahsildar (< 8 LPA)",
      "Admission Letter from AICTE approved institute",
      "Tuition Fee Receipt paid to the college",
      "Bank passbook copy with IFSC and Aadhaar seeding declaration"
    ],
    applicationSteps: [
      "Register on National Scholarship Portal (NSP) with One-Time Registration (OTR).",
      "Select 'AICTE Pragati Scheme for Girls (Degree/Diploma)'.",
      "Upload verified parent income certificate and fee receipts.",
      "Application is verified at Institute Level (INM) followed by State Nodal Officer."
    ]
  },
  {
    id: "reliance-foundation-ug",
    name: "Reliance Foundation Undergraduate Scholarship",
    organization: "Reliance Foundation",
    category: "Private / Corporate CSR",
    description: "One of India's largest private scholarship programs supporting first-year undergraduate students with grants, mentorship, and leadership development.",
    maxIncome: 1500000, // Preference to < 2.5L
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi", "Uttar Pradesh", "West Bengal"],
    courses: ["B.Tech", "BE", "B.Sc", "B.Com", "B.A", "MBBS", "B.Pharm", "Diploma"],
    minPercentage: 60,
    amount: "Up to ₹2,00,000 over course duration",
    deadline: "10 Oct 2026",
    daysLeft: 14,
    officialUrl: "https://www.scholarships.reliancefoundation.org/",
    tags: ["Corporate CSR", "Mentorship", "Merit-cum-Means", "Any Stream"],
    documents: [
      "12th Standard Board Examination Mark sheet",
      "Family Income Proof (ITR / Salary slip / Tehsildar certificate)",
      "Proof of admission in full-time undergraduate program",
      "Government Identity Proof (Aadhaar / Voter ID)",
      "Passport size photograph"
    ],
    applicationSteps: [
      "Complete initial eligibility questionnaire on Reliance Foundation portal.",
      "Submit personal details, academic scores, and write a statement of purpose.",
      "Appear for the online aptitude test (60 minutes, logical & numerical reasoning).",
      "Shortlisted candidates receive scholarship disbursement in phased tranches."
    ]
  },
  {
    id: "nsp-central-sector",
    name: "PM-USP Central Sector Scheme of Scholarship (CSSS)",
    organization: "Department of Higher Education (Govt of India)",
    category: "Government",
    description: "Awarded to meritorious students who scored above 80th percentile in their respective 12th State/CBSE Board exams pursuing regular higher education.",
    maxIncome: 450000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi", "Uttar Pradesh"],
    courses: ["B.Tech", "BE", "B.Sc", "B.Com", "B.A", "MBBS", "B.Pharm"],
    minPercentage: 75,
    amount: "₹12,000 – ₹20,000 / year",
    deadline: "31 Dec 2026",
    daysLeft: 96,
    officialUrl: "https://scholarships.gov.in/",
    tags: ["Central Govt", "Merit-Based", "Degree Students", "Direct Bank Transfer"],
    documents: [
      "Class 12th Board Marksheet showing merit percentile",
      "Income Certificate from authorized competent revenue authority",
      "Aadhaar linked Bank Account details",
      "College Bonafide Certificate with Roll Number",
      "Minority / Caste declaration if claiming reservation quota"
    ],
    applicationSteps: [
      "Visit National Scholarship Portal (NSP) and login with OTR.",
      "Look for 'Central Sector Scheme of Scholarships for College and University Students'.",
      "Verify that your 12th Roll Number matches the Board Merit List.",
      "Submit for college online verification."
    ]
  },
  {
    id: "hdfc-parivartan",
    name: "HDFC Bank Parivartan's ECSS Programme",
    organization: "HDFC Bank CSR",
    category: "Private / Corporate CSR",
    description: "Educational Crisis Support Scholarship for students from underprivileged families or those facing sudden financial hardship to prevent dropout.",
    maxIncome: 250000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"],
    courses: ["B.Tech", "BE", "Diploma", "B.Sc", "B.Com", "B.A", "MBBS", "Post-Graduate"],
    minPercentage: 55,
    amount: "Up to ₹75,000 / year",
    deadline: "20 Nov 2026",
    daysLeft: 55,
    officialUrl: "https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-programme",
    tags: ["Crisis Support", "Low Income", "Quick Approval", "Underprivileged"],
    documents: [
      "Previous year marksheet (min 55% marks)",
      "Identity proof (Aadhaar / Passport / Driving License)",
      "Current year admission proof (Fee receipt / Admission letter / ID card)",
      "Income Proof (Gram Panchayat / Ward Councillor / Income Certificate / ITR)",
      "Crisis proof if applicable (loss of breadwinner / medical crisis)"
    ],
    applicationSteps: [
      "Fill online application with family income background details.",
      "Upload scanned copies of fee receipt and marksheets.",
      "Telephonic verification by HDFC Bank screening committee.",
      "Funds credited directly to bank account via DBT."
    ]
  },
  {
    id: "kotak-kanya",
    name: "Kotak Kanya Scholarship for Girl Students",
    organization: "Kotak Education Foundation",
    category: "Private / Corporate CSR",
    description: "Financial assistance for meritorious girl students from low-income families pursuing professional graduation courses (Engineering, MBBS, Architecture, Law).",
    maxIncome: 600000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["Female"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"],
    courses: ["B.Tech", "BE", "MBBS", "B.Arch", "B.Pharm", "Law"],
    minPercentage: 80,
    amount: "₹1,50,000 / year (until graduation)",
    deadline: "30 Oct 2026",
    daysLeft: 34,
    officialUrl: "https://kotakeducation.org/kotak-kanya-scholarship/",
    tags: ["Girls Only", "High Value", "₹1.5 Lakh/yr", "Professional Degree"],
    documents: [
      "Class 12th marksheet with minimum 80% marks",
      "Annual family income certificate (< 6 LPA)",
      "Proof of admission (seat allotment letter / college fee receipt)",
      "Entrance exam scorecard (JEE / NEET / CET)",
      "Aadhaar card and bank account details"
    ],
    applicationSteps: [
      "Register online and fill academic + entrance rank details.",
      "Submit parents' occupation and income documentation.",
      "Online interview round with Kotak Education Foundation panel.",
      "Final sanction letter and mentorship onboarding."
    ]
  },
  {
    id: "tata-trusts-scholarship",
    name: "Tata Trusts Means-cum-Merit Scholarship",
    organization: "Tata Trusts",
    category: "Charitable Trust",
    description: "Prestigious grants from Tata Trusts covering tuition fees for students in engineering, medical, and professional disciplines across India.",
    maxIncome: 450000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"],
    courses: ["B.Tech", "BE", "MBBS", "B.Sc", "Post-Graduate"],
    minPercentage: 65,
    amount: "₹30,000 – ₹70,000 / year",
    deadline: "15 Nov 2026",
    daysLeft: 50,
    officialUrl: "https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants",
    tags: ["Tata Trusts", "Merit & Means", "Professional Courses", "Tuition Grant"],
    documents: [
      "Attested mark sheets of previous two academic years",
      "Fee estimate statement issued by college registrar/dean",
      "Original cancelled cheque / passbook copy",
      "Parents' IT returns / Salary slip / Revenue department income certificate"
    ],
    applicationSteps: [
      "Fill online education grant application during the intake window.",
      "Provide breakup of institutional tuition fee and hostel charges.",
      "Verification by Tata Trusts evaluators.",
      "Grant disbursed directly to college or verified student account."
    ]
  },
  {
    id: "ongc-scholarship",
    name: "ONGC Foundation Merit Scholarship for SC/ST/OBC",
    organization: "ONGC Foundation",
    category: "Public Sector (PSU)",
    description: "Exclusive scholarship for meritorious SC, ST, OBC, and EWS students admitted to 1st year of Engineering (B.Tech), MBBS, MBA, or Master in Geophysics.",
    maxIncome: 200000,
    allowedCategories: ["SC", "ST", "OBC", "EWS"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi", "Uttar Pradesh"],
    courses: ["B.Tech", "BE", "MBBS", "Post-Graduate"],
    minPercentage: 60,
    amount: "₹48,000 / year (₹4,000 / month)",
    deadline: "05 Dec 2026",
    daysLeft: 70,
    officialUrl: "https://www.ongcscholar.org/",
    tags: ["PSU Scholarship", "Monthly Stipend", "SC/ST/OBC Priority", "Tech & Med"],
    documents: [
      "Caste / Community Certificate from authorized revenue authority",
      "Proof of family income (< ₹2,00,000 / year)",
      "Class 12th marksheet and Entrance rank card",
      "Bonafide certificate issued by Head of Department/Principal",
      "ECS mandate form certified by bank manager"
    ],
    applicationSteps: [
      "Apply through ONGC Scholar portal within 60 days of course commencement.",
      "Upload certified category and income certificates.",
      "State-wise and zone-wise merit list published by ONGC CSR team.",
      "Annual renewal upon scoring minimum 60% or 6.0 CGPA."
    ]
  },
  {
    id: "aicte-saksham",
    name: "AICTE Saksham Scholarship for Specially-Abled Students",
    organization: "AICTE / Ministry of Education",
    category: "Government",
    description: "Supports differently abled students (with not less than 40% disability) pursuing technical degree or diploma courses in AICTE approved institutions.",
    maxIncome: 800000,
    allowedCategories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"],
    courses: ["B.Tech", "BE", "Diploma", "B.Pharm", "B.Arch"],
    minPercentage: 45,
    amount: "₹50,000 / year",
    deadline: "20 Dec 2026",
    daysLeft: 85,
    officialUrl: "https://scholarships.gov.in/",
    tags: ["Divyang / Specially Abled", "AICTE", "Technical Degree", "Central Govt"],
    documents: [
      "Disability Certificate issued by Competent Medical Authority (UDID Card)",
      "Class 10th and 12th marks card",
      "Annual family income certificate (< ₹8 Lakhs)",
      "Tuition fee receipt paid to institute",
      "Aadhaar seeded bank account proof"
    ],
    applicationSteps: [
      "Register on National Scholarship Portal with UDID Number.",
      "Choose Saksham Scholarship for Specially-Abled Students.",
      "Submit medical certificate and bonafide college letter.",
      "Direct benefit transfer (DBT) directly into student's Aadhaar linked account."
    ]
  },
  {
    id: "post-matric-minorities",
    name: "Post-Matric Scholarship for Minorities (MoMA)",
    organization: "Ministry of Minority Affairs, Govt of India",
    category: "Government",
    description: "Financial assistance for meritorious students belonging to notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).",
    maxIncome: 200000,
    allowedCategories: ["Minority"],
    allowedGenders: ["All"],
    allowedStates: ["All India", "Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Delhi"],
    courses: ["B.Tech", "BE", "Diploma", "B.Sc", "B.Com", "B.A", "MBBS", "Post-Graduate"],
    minPercentage: 50,
    amount: "₹10,000 – ₹30,000 / year",
    deadline: "15 Jan 2027",
    daysLeft: 111,
    officialUrl: "https://scholarships.gov.in/",
    tags: ["Minority Affairs", "Central Govt", "National Scholarship", "College Fee"],
    documents: [
      "Self-declaration of minority community certificate",
      "Income certificate issued by designated state authority",
      "Previous qualifying examination marksheet (min 50%)",
      "Fee receipt of current academic semester",
      "Bank passbook copy with IFSC code"
    ],
    applicationSteps: [
      "Login to NSP Portal using Student OTR credentials.",
      "Fill scholarship scheme under 'Ministry of Minority Affairs'.",
      "Institute Nodal Officer verifies student enrollment.",
      "Disbursement via PFMS (Public Financial Management System)."
    ]
  },
  {
    id: "mahadbt-post-matric",
    name: "MahaDBT Rajarshi Chhatrapati Shahu Maharaj Scheme",
    organization: "Government of Maharashtra",
    category: "Government",
    description: "Reimbursement of 50% to 100% of tuition and examination fees for students pursuing higher and technical education in Maharashtra.",
    maxIncome: 800000,
    allowedCategories: ["General", "OBC", "EWS", "SC", "ST"],
    allowedGenders: ["All"],
    allowedStates: ["Maharashtra"],
    courses: ["B.Tech", "BE", "Diploma", "B.Sc", "B.Com", "B.A", "MBBS", "Post-Graduate"],
    minPercentage: 50,
    amount: "50% to 100% Tuition Fee Waiver",
    deadline: "31 Dec 2026",
    daysLeft: 96,
    officialUrl: "https://mahadbt.maharashtra.gov.in/",
    tags: ["Maharashtra", "State Portal", "Fee Waiver", "Technical Education"],
    documents: [
      "Domicile Certificate of Maharashtra State",
      "Income Certificate issued by Tahsildar (< 8 Lakhs)",
      "CAP Allotment Letter for technical courses",
      "Class 10th and 12th marksheet",
      "Ration Card / Family Declaration"
    ],
    applicationSteps: [
      "Register on MahaDBT portal with Aadhaar OTP authentication.",
      "Select Directorate of Technical Education / Higher Education.",
      "Fill applicant details and upload Tahsildar income certificate.",
      "Track department approval and fee reimbursement to college."
    ]
  }
];

// Helper: Intelligent Matching Engine
export function matchStudentScholarships(studentProfile) {
  const {
    name = "Student",
    income = 200000,
    category = "OBC",
    gender = "Female",
    state = "Karnataka",
    course = "B.Tech",
    score = 75,
    isSpeciallyAbled = false
  } = studentProfile;

  const numIncome = Number(income) || 200000;
  const numScore = Number(score) || 75;

  const results = SCHOLARSHIPS_DATA.map((scholarship) => {
    let matchScore = 100;
    const qualifyReasons = [];
    const flags = [];

    // 1. Income Check
    if (numIncome <= scholarship.maxIncome) {
      const incomePercentile = ((scholarship.maxIncome - numIncome) / scholarship.maxIncome) * 100;
      if (incomePercentile > 50) {
        qualifyReasons.push(`Strong financial fit: Family income ₹${numIncome.toLocaleString('en-IN')} is well below ₹${scholarship.maxIncome.toLocaleString('en-IN')} cap`);
      } else {
        qualifyReasons.push(`Income criteria met (within ₹${scholarship.maxIncome.toLocaleString('en-IN')} limit)`);
      }
    } else {
      matchScore -= 45;
      flags.push(`Income ₹${numIncome.toLocaleString('en-IN')} exceeds ceiling of ₹${scholarship.maxIncome.toLocaleString('en-IN')}`);
    }

    // 2. Gender Check
    if (scholarship.allowedGenders.includes("All")) {
      // Eligible
    } else if (scholarship.allowedGenders.includes(gender)) {
      matchScore += 10;
      qualifyReasons.push(`Targeted benefit for ${gender} candidates`);
    } else {
      matchScore -= 60;
      flags.push(`Reserved exclusively for ${scholarship.allowedGenders.join(", ")} applicants`);
    }

    // 3. Category Check
    if (scholarship.allowedCategories.includes(category) || scholarship.allowedCategories.includes("General")) {
      qualifyReasons.push(`Category '${category}' is fully eligible`);
    } else {
      matchScore -= 40;
      flags.push(`Eligible categories: ${scholarship.allowedCategories.join(", ")}`);
    }

    // 4. State / Domicile Check
    if (scholarship.allowedStates.includes("All India") || scholarship.allowedStates.includes(state)) {
      qualifyReasons.push(`State of domicile '${state}' eligible`);
    } else {
      matchScore -= 35;
      flags.push(`Restricted to ${scholarship.allowedStates.join(", ")} residents`);
    }

    // 5. Course / Degree Check
    const courseMatches = scholarship.courses.some(c => 
      course.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(course.toLowerCase())
    );
    if (courseMatches) {
      qualifyReasons.push(`Covers your course '${course}'`);
    } else {
      matchScore -= 25;
      flags.push(`Primary courses: ${scholarship.courses.slice(0, 3).join(", ")}`);
    }

    // 6. Minimum Percentage Check
    if (numScore >= scholarship.minPercentage) {
      qualifyReasons.push(`Academic score (${numScore}%) meets minimum cutoff (${scholarship.minPercentage}%)`);
    } else {
      matchScore -= 20;
      flags.push(`Minimum ${scholarship.minPercentage}% required in previous board/exam`);
    }

    // 7. Specially-Abled check
    if (scholarship.id === "aicte-saksham") {
      if (isSpeciallyAbled) {
        matchScore += 25;
        qualifyReasons.push(`Priority match for specially-abled students with UDID`);
      } else {
        matchScore -= 50;
        flags.push(`Requires 40%+ physical disability certification`);
      }
    }

    // Cap match score between 10% and 99%
    matchScore = Math.max(15, Math.min(99, matchScore));

    return {
      ...scholarship,
      matchScore,
      isEligible: matchScore >= 70,
      qualifyReasons,
      flags
    };
  });

  // Sort by highest match score first, then by days left
  results.sort((a, b) => b.matchScore - a.matchScore || a.daysLeft - b.daysLeft);

  return results;
}
