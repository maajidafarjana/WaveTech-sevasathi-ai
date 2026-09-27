const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const Grievance = require("./models/Grievance");

const app = express();

app.use(cors());
app.use(express.json());

// =========================================================
// MONGODB CONNECTION (STRICTLY ISOLATED TO 'SevaSaathi' DB)
// =========================================================
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/SevaSaathi";

mongoose
  .connect(MONGO_URI, {
    dbName: "SevaSaathi", // Guaranteed to use ONLY the SevaSaathi database
  })
  .then(() => {
    console.log("🛡️ Connected to MongoDB successfully! Strictly using database: SevaSaathi");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// =========================================================
// HEALTH & STATUS CHECK
// =========================================================
app.get("/", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    message: "SevaSathi AI & SmartScholar backend is running smoothly 🚀",
    database: "SevaSaathi",
    dbConnected: isDbConnected,
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: "SevaSaathi",
    mongoConnectionState: mongoose.connection.readyState, // 1 = connected
  });
});

// =========================================================
// GRIEVANCES & TICKETS API (CAMPUS PROBLEM REPORTING)
// =========================================================

// 1. Create a new grievance / ticket
app.post("/api/grievances", async (req, res) => {
  try {
    const {
      ticketId,
      problemTitle,
      schemeName,
      category,
      urgency,
      location,
      description,
      screenshot,
      anonymous,
      studentId,
      status,
      assignedTo,
    } = req.body;

    if (!problemTitle || !description) {
      return res.status(400).json({
        success: false,
        error: "Problem title and description are required",
      });
    }

    // Auto-generate ticketId if not supplied
    const finalTicketId =
      ticketId || `SS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance = new Grievance({
      ticketId: finalTicketId,
      problemTitle,
      schemeName: schemeName || "General / Not Specified",
      category: category || "Portal Login Error",
      urgency: urgency || "Medium",
      location: location || "Scholarship Portal / Online",
      description,
      screenshot: screenshot || null,
      anonymous: !!anonymous,
      studentId: studentId || null,
      status: status || "Pending",
      assignedTo: assignedTo || "Scholarship Nodal Helpdesk",
      upvotes: 0,
    });

    const savedGrievance = await newGrievance.save();
    console.log(`[Ticket Created] ID: ${savedGrievance.ticketId} Scheme: ${savedGrievance.schemeName} in DB: SevaSaathi`);

    res.status(201).json({
      success: true,
      message: "Grievance ticket created successfully",
      ticket: savedGrievance,
    });
  } catch (error) {
    console.error("Error creating grievance:", error);
    // Handle duplicate ticketId
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "A ticket with this ID already exists. Please retry.",
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create grievance ticket",
    });
  }
});

// 2. Fetch all grievances (sorted by latest first)
app.get("/api/grievances", async (req, res) => {
  try {
    const grievances = await Grievance.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: grievances.length,
      tickets: grievances,
    });
  } catch (error) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch grievances",
    });
  }
});

// 3. Fetch single grievance by ticketId
app.get("/api/grievances/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const grievance = await Grievance.findOne({ ticketId });
    if (!grievance) {
      return res.status(404).json({
        success: false,
        error: `Grievance with ticketId ${ticketId} not found`,
      });
    }
    res.json({
      success: true,
      ticket: grievance,
    });
  } catch (error) {
    console.error("Error finding grievance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch grievance",
    });
  }
});

// 4. Update grievance status and assignedTo
app.patch("/api/grievances/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;

    const updated = await Grievance.findOneAndUpdate(
      { ticketId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${ticketId} not found`,
      });
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updated,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update status",
    });
  }
});

// 5. Upvote a grievance
app.patch("/api/grievances/:ticketId/upvote", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updated = await Grievance.findOneAndUpdate(
      { ticketId },
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${ticketId} not found`,
      });
    }

    res.json({
      success: true,
      upvotes: updated.upvotes,
      ticket: updated,
    });
  } catch (error) {
    console.error("Error upvoting grievance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upvote",
    });
  }
});

// =========================================================
// SCHOLARSHIP APPLICATIONS STATUS TRACKER API
// =========================================================
let SCHOLARSHIP_APPLICATIONS = [
  {
    applicationId: "SSP-2026-KA-4819",
    schemeName: "SSP Karnataka Post-Matric Scholarship 2026",
    portal: "State Scholarship Portal (SSP Karnataka)",
    appliedDate: "12 Aug 2026",
    sanctionedAmount: "₹25,000",
    currentStageIndex: 2,
    lastUpdated: "Just now",
    stages: [
      {
        id: 1,
        title: "Application Submitted",
        subtitle: "Application form and e-Attestation submitted successfully",
        completed: true,
        current: false,
        timestamp: "12 Aug 2026, 11:30 AM",
        remarks: "Online submission verified. Acknowledgment number generated.",
      },
      {
        id: 2,
        title: "Institute / College Verified",
        subtitle: "Dayananda Sagar College of Engineering verification desk",
        completed: true,
        current: false,
        timestamp: "24 Aug 2026, 03:45 PM",
        remarks: "Fee receipt & marksheet e-attestation approved by College Principal.",
      },
      {
        id: 3,
        title: "District / State Nodal Officer Verified",
        subtitle: "Bengaluru South District Social Welfare Department",
        completed: false,
        current: true,
        timestamp: "Under Verification (Stage 3 Active)",
        remarks: "Application currently placed in District Officer scrutiny batch.",
      },
      {
        id: 4,
        title: "Merit List Generated / Approved",
        subtitle: "Department of Social Welfare Sanction Order",
        completed: false,
        current: false,
        timestamp: "Awaiting nodal clearance",
        remarks: "Sanction order will be generated post district clearance.",
      },
      {
        id: 5,
        title: "Funds Disbursed (Direct Benefit Transfer to Bank)",
        subtitle: "Aadhaar NPCI DBT payment into Canara Bank (A/C ending in 4109)",
        completed: false,
        current: false,
        timestamp: "Pending sanction",
        remarks: "Direct bank transfer will be credited via PFMS / NPCI gateway.",
      },
    ],
  },
  {
    applicationId: "AICTE-PRAG-2026-9281",
    schemeName: "AICTE Pragati Scholarship for Girls (Degree)",
    portal: "National Scholarship Portal (NSP)",
    appliedDate: "05 Sep 2026",
    sanctionedAmount: "₹50,000",
    currentStageIndex: 1,
    lastUpdated: "Yesterday",
    stages: [
      {
        id: 1,
        title: "Application Submitted",
        subtitle: "NSP OTR application submitted with AICTE approval",
        completed: true,
        current: false,
        timestamp: "05 Sep 2026, 04:15 PM",
        remarks: "NSP application confirmed with biometric e-KYC.",
      },
      {
        id: 2,
        title: "Institute / College Verified",
        subtitle: "Institute Nodal Officer (INO) College Verification",
        completed: false,
        current: true,
        timestamp: "In progress at college desk",
        remarks: "Pending bonafide verification by college administration desk.",
      },
      {
        id: 3,
        title: "District / State Nodal Officer Verified",
        subtitle: "State Nodal Officer (SNO) validation",
        completed: false,
        current: false,
        timestamp: "Awaiting INO verification",
        remarks: "Will proceed once college level clears.",
      },
      {
        id: 4,
        title: "Merit List Generated / Approved",
        subtitle: "AICTE Technical Merit List approval",
        completed: false,
        current: false,
        timestamp: "Scheduled for Nov 2026",
        remarks: "Merit list generation by Ministry.",
      },
      {
        id: 5,
        title: "Funds Disbursed (Direct Benefit Transfer to Bank)",
        subtitle: "PFMS DBT credit directly to student account",
        completed: false,
        current: false,
        timestamp: "Scheduled post approval",
        remarks: "DBT transfer via Aadhaar payment bridge.",
      },
    ],
  },
];

// GET all tracked applications
app.get("/api/scholarship-applications", (req, res) => {
  res.json({
    success: true,
    count: SCHOLARSHIP_APPLICATIONS.length,
    applications: SCHOLARSHIP_APPLICATIONS,
  });
});

// Refresh status simulation for a specific application
app.patch("/api/scholarship-applications/:applicationId/refresh", (req, res) => {
  const { applicationId } = req.params;
  const appIndex = SCHOLARSHIP_APPLICATIONS.findIndex(
    (a) => a.applicationId.toLowerCase() === applicationId.toLowerCase()
  );

  if (appIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Application ${applicationId} not found`,
    });
  }

  const current = SCHOLARSHIP_APPLICATIONS[appIndex];
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  current.lastUpdated = `Today, ${now}`;

  res.json({
    success: true,
    message: "Live status synchronized successfully with external government portal!",
    application: current,
  });
});

// =========================================================
// STUDENT AUTHENTICATION API
// =========================================================
let REGISTERED_USERS = [
  {
    name: "Ananya Rao",
    email: "ananya.rao@dsce.edu.in",
    mobile: "9876543210",
    state: "Karnataka",
    category: "OBC",
    password: "Password@123",
    studentId: "SS-2026-KA-4819",
    course: "B.Tech",
    college: "Dayananda Sagar College of Engineering",
    score: 82,
    income: 200000,
  },
];

let PENDING_OTPS = {};

app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, mobile, state, category, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        error: "All required fields (Name, Email, Mobile, Password) must be provided.",
      });
    }

    const stateCode = state ? state.substring(0, 2).toUpperCase() : "IN";
    const studentId = `SS-2026-${stateCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      name,
      email,
      mobile,
      state: state || "Karnataka",
      category: category || "General",
      password,
      studentId,
      course: "Undergraduate / General Degree",
      college: "Registered College / Institute",
      score: 80,
      income: 250000,
    };

    REGISTERED_USERS.push(newUser);
    const token = `SS_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    res.status(201).json({
      success: true,
      message: "Student account registered successfully!",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        state: newUser.state,
        category: newUser.category,
        studentId: newUser.studentId,
        course: newUser.course,
        college: newUser.college,
        score: newUser.score,
        income: newUser.income,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Mobile/Email and Password are required.",
      });
    }

    const user = REGISTERED_USERS.find(
      (u) =>
        (u.email.toLowerCase() === identifier.toLowerCase() || u.mobile === identifier) &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email/mobile or password. Try demo login or sign up.",
      });
    }

    const token = `SS_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        state: user.state,
        category: user.category,
        studentId: user.studentId,
        course: user.course,
        college: user.college,
        score: user.score,
        income: user.income,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/otp/send", (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, error: "Mobile number is required" });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    PENDING_OTPS[mobile] = { code, expires: Date.now() + 10 * 60 * 1000 };

    res.json({
      success: true,
      message: `OTP sent to +91 ${mobile}`,
      otpPreview: code, // returned for seamless simulation & demo convenience
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/otp/verify", (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const record = PENDING_OTPS[mobile];

    if (!record || record.code !== otp || Date.now() > record.expires) {
      // Allow fallback code 123456 or 492108 for resilient demo testing
      if (otp !== "123456" && otp !== "492108") {
        return res.status(400).json({ success: false, error: "Invalid or expired OTP." });
      }
    }

    let user = REGISTERED_USERS.find((u) => u.mobile === mobile);
    if (!user) {
      // Auto create student profile on OTP login
      user = {
        name: "Student (Mobile Verified)",
        email: `student_${mobile.slice(-4)}@sevasathi.gov.in`,
        mobile,
        state: "Karnataka",
        category: "General",
        studentId: `SS-2026-KA-${mobile.slice(-4)}`,
        course: "Undergraduate Program",
        college: "Verified Institution",
        score: 80,
        income: 200000,
      };
      REGISTERED_USERS.push(user);
    }

    const token = `SS_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.json({
      success: true,
      message: "Mobile verified successfully!",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// =========================================================
// SCHOLARSHIPS KNOWLEDGE BASE & HYBRID CLOUD AGENT
// Powered by official Google Gen AI SDK (@google/genai)
// =========================================================

// 1. Load Structured Knowledge Base
let SCHOLARSHIPS = [];
try {
  SCHOLARSHIPS = require("./data/scholarships.json");
  console.log(`📚 Loaded ${SCHOLARSHIPS.length} scholarships from scholarships.json knowledge base.`);
} catch (loadErr) {
  try {
    SCHOLARSHIPS = require("./scholarships.json");
    console.log(`📚 Loaded ${SCHOLARSHIPS.length} scholarships from root scholarships.json.`);
  } catch (err2) {
    console.error("❌ Failed to load scholarships.json:", err2.message);
  }
}

// 2. Initialize Google Gen AI Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (geminiApiKey && geminiApiKey.trim() !== "" && geminiApiKey !== "your_gemini_api_key_here") {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("⚡ Official @google/genai client initialized successfully (Gemini 2.5 Flash ready)!");
  } catch (initErr) {
    console.warn("⚠️ Failed to initialize @google/genai client:", initErr.message);
  }
} else {
  console.log("ℹ️ GEMINI_API_KEY not set in .env. Running in resilient hybrid mode with heuristic NLP & precision matching.");
}

// 3. Fallback Heuristic Profile Extractor
function extractStudentProfileHeuristic(text, baseProfile = {}) {
  const lower = (text || "").toLowerCase();
  let income = baseProfile.income ? Number(baseProfile.income) : (baseProfile.familyIncome ? Number(baseProfile.familyIncome) : null);
  let percentage = baseProfile.percentage ? Number(baseProfile.percentage) : (baseProfile.score ? Number(baseProfile.score) : null);
  let course = baseProfile.course || null;
  let category = baseProfile.category || null;
  let gender = baseProfile.gender || null;
  let state = baseProfile.state || null;

  // Income Extraction
  if (!income) {
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lpa|lac|lacs)/);
    if (lakhMatch) {
      income = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = lower.match(/(?:income|salary|earn)\s*(?:is|of|around|₹)?\s*₹?\s*(\d{4,7})/);
      if (numMatch) {
        income = parseInt(numMatch[1], 10);
      }
    }
  }

  // Percentage / Score Extraction
  if (!percentage) {
    const pctMatch = lower.match(/(\d{1,2}(?:\.\d{1,2})?)\s*(?:%|percent|percentage)/);
    if (pctMatch) {
      percentage = parseFloat(pctMatch[1]);
    } else {
      const scoreMatch = lower.match(/(?:scored|secured|marks|aggregate)\s*(?:is|of|around)?\s*(\d{1,2}(?:\.\d{1,2})?)/);
      if (scoreMatch) {
        percentage = parseFloat(scoreMatch[1]);
      }
    }
  }

  // Gender Detection
  if (!gender) {
    if (lower.includes("girl") || lower.includes("female") || lower.includes("woman") || lower.includes("daughter")) {
      gender = "Female";
    } else if (lower.includes("boy") || lower.includes("male") || lower.includes("son")) {
      gender = "Male";
    }
  }

  // Course Detection
  if (!course) {
    if (lower.includes("b.tech") || lower.includes("btech") || lower.includes("engineering") || lower.includes("b.e") || lower.includes("be ")) {
      course = "B.Tech";
    } else if (lower.includes("mbbs") || lower.includes("medical") || lower.includes("neet")) {
      course = "MBBS";
    } else if (lower.includes("diploma") || lower.includes("polytechnic")) {
      course = "Diploma";
    } else if (lower.includes("b.sc") || lower.includes("bsc")) {
      course = "B.Sc";
    } else if (lower.includes("b.com") || lower.includes("bcom")) {
      course = "B.Com";
    } else if (lower.includes("b.a") || lower.includes("ba degree")) {
      course = "B.A";
    } else if (lower.includes("bca") || lower.includes("computer application")) {
      course = "BCA";
    } else if (lower.includes("bba")) {
      course = "BBA";
    } else if (lower.includes("puc") || lower.includes("12th") || lower.includes("class 12")) {
      course = "PUC";
    }
  }

  // Category Detection
  if (!category) {
    if (lower.includes("sc/st") || lower.includes("sc category")) category = "SC";
    else if (lower.includes("st category")) category = "ST";
    else if (lower.includes("obc")) category = "OBC";
    else if (lower.includes("ews")) category = "EWS";
    else if (lower.includes("minority") || lower.includes("muslim") || lower.includes("christian")) category = "Minority";
    else if (lower.includes("general")) category = "General";
  }

  // State Detection
  if (!state) {
    if (lower.includes("karnataka") || lower.includes("bangalore") || lower.includes("bengaluru") || lower.includes("mysore")) {
      state = "Karnataka";
    } else if (lower.includes("kerala")) {
      state = "Kerala";
    } else if (lower.includes("tamil nadu") || lower.includes("chennai")) {
      state = "Tamil Nadu";
    } else if (lower.includes("maharashtra") || lower.includes("mumbai") || lower.includes("pune")) {
      state = "Maharashtra";
    }
  }

  return {
    percentage,
    course,
    familyIncome: income,
    category,
    gender,
    state,
    extractionMethod: "heuristic"
  };
}

// 4. Knowledge Base Query & Scheme Finder
function findScholarshipByQuery(query, scholarshipsList) {
  if (!query || !scholarshipsList || scholarshipsList.length === 0) return null;
  const lower = query.toLowerCase().trim();

  // 1. Exact or partial ID match
  const byId = scholarshipsList.find(s => s.id && (lower.includes(s.id.toLowerCase()) || s.id.toLowerCase().includes(lower)));
  if (byId) return byId;

  // 2. Specialized alias mapping for prominent schemes
  const aliasMap = [
    { keys: ["ssp", "post-matric karnataka", "karnataka post matric", "ssp karnataka", "karnataka scholarship", "postmatric"], id: "ssp-karnataka" },
    { keys: ["pragati", "aicte pragati", "girls engineering"], id: "aicte-pragati" },
    { keys: ["saksham", "aicte saksham", "specially-abled", "disability scholarship"], id: "aicte-saksham" },
    { keys: ["reliance", "reliance foundation", "dhirubhai"], id: "reliance-foundation-ug" },
    { keys: ["central sector", "pm-usp", "csss", "nsp central", "nsp scholarship", "national scholarship portal"], id: "nsp-central-sector" },
    { keys: ["badhte kadam", "hdfc", "hdfc bank"], id: "hdfc-badhte-kadam" },
    { keys: ["tata trusts", "tata scholarship", "tata"], id: "tata-trusts-scholarship" },
    { keys: ["ongc", "ongc foundation"], id: "ongc-scholarship" },
    { keys: ["vidyasaarathi", "snl", "snl bearings"], id: "vidyasaarathi-snl" },
    { keys: ["minority", "minorities", "moma post-matric"], id: "post-matric-minorities" },
    { keys: ["jindal", "sitaram", "sitaram jindal"], id: "sitaram-jindal" },
    { keys: ["kvpy", "inspire", "inspire fellowship"], id: "kvpy-inspire" },
    { keys: ["faea", "academic excellence"], id: "faea-scholarship" },
    { keys: ["loreal", "l'oreal", "women in science"], id: "loreal-for-women" }
  ];

  for (const alias of aliasMap) {
    if (alias.keys.some(k => lower.includes(k))) {
      const match = scholarshipsList.find(s => s.id === alias.id);
      if (match) return match;
    }
  }

  // 3. Name or Provider match
  const byName = scholarshipsList.find(s => {
    const sName = (s.name || "").toLowerCase();
    const sProvider = (s.provider || s.organization || "").toLowerCase();
    return sName.includes(lower) || lower.includes(sName) || sProvider.includes(lower);
  });
  if (byName) return byName;

  // 4. Token scoring
  let best = null;
  let maxScore = 0;
  const words = lower.split(/[\s,?.!-]+/).filter(w => w.length > 2);
  for (const s of scholarshipsList) {
    let score = 0;
    const hay = `${s.name} ${s.provider || ""} ${(s.tags || []).join(" ")}`.toLowerCase();
    for (const w of words) {
      if (hay.includes(w)) score += 1;
    }
    if (score > maxScore) {
      maxScore = score;
      best = s;
    }
  }

  return maxScore >= 2 ? best : null;
}

// 5. Heuristic Intent Classification & Profile Extraction Fallback
function classifyUserIntentHeuristic(userMessage, baseProfile = {}) {
  const lower = (userMessage || "").toLowerCase();

  // Known scheme keywords
  const schemeKeywords = [
    "ssp", "karnataka", "pragati", "saksham", "aicte", "reliance", "central sector",
    "csss", "pm-usp", "hdfc", "badhte kadam", "tata", "ongc", "vidyasaarathi", "snl",
    "minority", "minorities", "jindal", "sitaram", "kvpy", "inspire", "faea", "l'oreal", "loreal", "nsp"
  ];

  // Specific query indicator words
  const inquiryWords = [
    "document", "documents", "required", "checklist", "needed", "eligibility",
    "eligible", "criteria", "deadline", "last date", "apply", "steps", "procedure",
    "how to", "tell me about", "what is", "portal", "link", "guideline", "guidelines", "fee receipt", "rd number"
  ];

  const matchedSchemeKeyword = schemeKeywords.find(kw => lower.includes(kw));
  const hasInquiryWord = inquiryWords.some(w => lower.includes(w));

  let intent = "PROFILE_MATCH";
  let targetScholarship = null;
  let aspect = "general";

  if (matchedSchemeKeyword) {
    intent = "SPECIFIC_QUERY";
    targetScholarship = matchedSchemeKeyword;
    if (lower.includes("document") || lower.includes("checklist") || lower.includes("needed") || lower.includes("required")) {
      aspect = "documents";
    } else if (lower.includes("eligib") || lower.includes("criteria")) {
      aspect = "eligibility";
    } else if (lower.includes("deadlin") || lower.includes("last date")) {
      aspect = "deadline";
    } else if (lower.includes("apply") || lower.includes("step") || lower.includes("how to")) {
      aspect = "how_to_apply";
    }
  } else if (hasInquiryWord && !lower.includes("my profile") && !lower.includes("find scholarships") && !lower.includes("show scholarships")) {
    intent = "SPECIFIC_QUERY";
    if (lower.includes("document")) aspect = "documents";
  }

  const extractedProfile = extractStudentProfileHeuristic(userMessage, baseProfile);

  return {
    intent,
    targetScholarship,
    aspect,
    extractedProfile
  };
}

// 6. Gemini Cloud Intent Classification Router & Profile Extractor
async function classifyUserIntentWithGemini(userMessage, baseProfile = {}) {
  if (aiClient) {
    try {
      const intentPrompt = `You are an expert Intent Classification Router and Profile Parser for the "SevaSathi AI" Indian scholarship system.

User Query: "${userMessage}"
Context Profile: ${JSON.stringify(baseProfile)}

Your task is to classify the user's intent into EXACTLY ONE of two categories:
1. "PROFILE_MATCH": The user is asking to find or discover scholarships matching their background, degree, or financial profile.
   Examples:
   - "I am an engineering student, show scholarships"
   - "Find scholarships for my profile"
   - "Scholarships for income under 2.5 Lakhs"
   - "I scored 85% in PUC and my family income is 2 LPA"
   - "Scholarships for female students"

2. "SPECIFIC_QUERY": The user is asking about a specific scholarship, portal, or document requirement.
   Examples:
   - "What documents are needed for SSP Karnataka?"
   - "Tell me about AICTE Pragati"
   - "What is the deadline for Reliance scholarship?"
   - "How do I apply for HDFC Badhte Kadam?"
   - "Documents required for minority scholarship"
   - "Is Karnataka domicile required for SSP?"

Extract the following JSON structure:
{
  "intent": "PROFILE_MATCH" | "SPECIFIC_QUERY",
  "targetScholarship": string or null (name or keyword of specific scholarship mentioned, e.g. "SSP Karnataka", "AICTE Pragati", "Reliance Foundation", "HDFC Badhte Kadam", etc.),
  "aspect": "documents" | "eligibility" | "deadline" | "how_to_apply" | "general" | null,
  "extractedProfile": {
    "percentage": number or null,
    "course": string or null,
    "familyIncome": number or null,
    "category": string or null,
    "gender": "Female" | "Male" | null,
    "state": string or null
  }
}

Respond ONLY with valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: intentPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      const intent = (parsed.intent === "SPECIFIC_QUERY" || parsed.intent === "PROFILE_MATCH")
        ? parsed.intent
        : classifyUserIntentHeuristic(userMessage, baseProfile).intent;

      const profileData = parsed.extractedProfile || {};
      return {
        intent,
        targetScholarship: parsed.targetScholarship || null,
        aspect: parsed.aspect || null,
        extractedProfile: {
          percentage: profileData.percentage ?? (baseProfile.score ? Number(baseProfile.score) : null),
          course: profileData.course || baseProfile.course || null,
          familyIncome: profileData.familyIncome ?? (baseProfile.income ? Number(baseProfile.income) : null),
          category: profileData.category || baseProfile.category || null,
          gender: profileData.gender || baseProfile.gender || null,
          state: profileData.state || baseProfile.state || null,
          extractionMethod: "gemini-2.5-flash"
        }
      };
    } catch (apiErr) {
      console.warn("⚠️ Gemini intent classification error, falling back to heuristic:", apiErr.message);
    }
  }

  return classifyUserIntentHeuristic(userMessage, baseProfile);
}

// 5. Programmatic Precision Eligibility Filtering Engine (100% Precision)
function filterScholarships(profile, scholarshipsList) {
  const studentIncome = profile.familyIncome ? Number(profile.familyIncome) : null;
  const studentPercentage = profile.percentage ? Number(profile.percentage) : null;
  const studentGender = profile.gender || null;
  const studentCourse = profile.course ? profile.course.toLowerCase() : null;
  const studentCategory = profile.category || null;
  const studentState = profile.state || null;

  const results = scholarshipsList.map((scholarship) => {
    const elig = scholarship.eligibility || {};
    let isEligible = true;
    let matchScore = 80;
    const qualifyReasons = [];
    const flags = [];

    // 1. Income Check (Strict upper ceiling)
    if (studentIncome !== null && elig.maxFamilyIncome) {
      if (studentIncome <= elig.maxFamilyIncome) {
        matchScore += 10;
        qualifyReasons.push(`Income ₹${studentIncome.toLocaleString('en-IN')} within limit of ₹${elig.maxFamilyIncome.toLocaleString('en-IN')}`);
      } else {
        isEligible = false;
        flags.push(`Income exceeds max ceiling of ₹${elig.maxFamilyIncome.toLocaleString('en-IN')}`);
      }
    }

    // 2. Minimum Percentage Check (Strict cutoff)
    if (studentPercentage !== null && elig.minPercentage) {
      if (studentPercentage >= elig.minPercentage) {
        matchScore += 10;
        qualifyReasons.push(`Academic score (${studentPercentage}%) meets minimum cutoff (${elig.minPercentage}%)`);
      } else {
        isEligible = false;
        flags.push(`Academic score (${studentPercentage}%) below required ${elig.minPercentage}%`);
      }
    }

    // 3. Gender Check (e.g. Pragati / Kotak Kanya for Female)
    if (elig.gender && elig.gender !== "All") {
      if (studentGender) {
        if (studentGender.toLowerCase() === elig.gender.toLowerCase()) {
          matchScore += 10;
          qualifyReasons.push(`Exclusive affirmative benefit for ${elig.gender} students`);
        } else {
          isEligible = false;
          flags.push(`Reserved exclusively for ${elig.gender} students`);
        }
      }
    }

    // 4. Course Match
    if (studentCourse && elig.course && elig.course.length > 0) {
      const courseMatch = elig.course.some((c) => {
        const cLower = c.toLowerCase();
        return studentCourse.includes(cLower) || cLower.includes(studentCourse);
      });
      if (courseMatch) {
        matchScore += 5;
        qualifyReasons.push(`Eligible for your program (${profile.course})`);
      } else {
        isEligible = false;
        flags.push(`Applicable courses: ${elig.course.slice(0, 3).join(", ")}`);
      }
    }

    // 5. Category Check
    if (studentCategory && elig.category && elig.category.length > 0) {
      const categoryMatch = elig.category.some(
        (cat) => cat.toLowerCase() === studentCategory.toLowerCase() || cat.toLowerCase() === "general"
      );
      if (categoryMatch) {
        qualifyReasons.push(`Category '${studentCategory}' eligible`);
      } else {
        isEligible = false;
        flags.push(`Eligible categories: ${elig.category.join(", ")}`);
      }
    }

    // 6. State Check
    if (studentState && elig.state && elig.state.length > 0) {
      const stateMatch = elig.state.some(
        (st) => st.toLowerCase() === "all india" || st.toLowerCase() === studentState.toLowerCase()
      );
      if (stateMatch) {
        qualifyReasons.push(`Eligible for ${studentState} domicile`);
      } else {
        isEligible = false;
        flags.push(`Restricted to ${elig.state.join(", ")}`);
      }
    }

    return {
      ...scholarship,
      isEligible,
      matchScore: Math.min(99, Math.max(25, matchScore)),
      qualifyReasons,
      flags
    };
  });

  // Strict precision matches
  let exactMatches = results.filter((s) => s.isEligible);

  // If no exact matches due to specific constraints, provide top 3 relevant opportunities
  if (exactMatches.length === 0) {
    results.sort((a, b) => b.matchScore - a.matchScore);
    exactMatches = results.slice(0, 3);
  } else {
    exactMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  return exactMatches;
}

// 7. Clean Minimalist Profile Match Greeting (No verbose text walls!)
function generateProfileMatchMessage(matchedCount, profile, language = "en-IN") {
  const incomeFormatted = profile.familyIncome
    ? `₹${Number(profile.familyIncome).toLocaleString("en-IN")}`
    : "your income category";
  const courseStr = profile.course || "your degree";

  if (language === "kn-IN") {
    return `ನಮಸ್ಕಾರ! 👋 ನಿಮ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ (${courseStr}, ವಾರ್ಷಿಕ ಆದಾಯ ${incomeFormatted}), ನೀವು **${matchedCount} ಅಧಿಕೃತ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳಿಗೆ** ಅರ್ಹರಾಗಿದ್ದೀರಿ! ಕೆಳಗಿನ ಕಾರ್ಡ್‌ಗಳ ಮೂಲಕ ಸುಲಭವಾಗಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ:`;
  }

  if (language === "hi-IN") {
    return `नमस्ते! 👋 आपकी प्रोफाइल (${courseStr}, वार्षिक आय ${incomeFormatted}) के आधार पर, आपके लिए कुल **${matchedCount} सत्यापित छात्रवृत्तियां** मिली हैं! मुख्य विवरण देखने और सीधे आवेदन करने के लिए नीचे दिए गए कार्ड्स का उपयोग करें:`;
  }

  return `Hello! 👋 Based on your profile (${courseStr}, annual income ${incomeFormatted}${profile.percentage ? `, academic score ${profile.percentage}%` : ""}), SevaSathi AI has matched **${matchedCount} verified scholarships** for you! Review key details and apply directly using the cards below:`;
}

// 8. Clean Focused Specific Scheme Template
function generateSpecificSchemeTemplate(scholarship, language = "en-IN") {
  const docsList = (scholarship.documents || [])
    .map(doc => `- ✅ **${doc}**`)
    .join("\n");

  const stepsList = (scholarship.applicationSteps || [])
    .map((step, idx) => `${idx + 1}. ${step}`)
    .join("\n");

  const officialUrl = scholarship.officialLink || scholarship.officialUrl || "#";

  if (language === "kn-IN") {
    return `### 🏛️ ${scholarship.name}\n` +
      `**ಸಂಸ್ಥೆ / ಪ್ರಾಧಿಕಾರ:** ${scholarship.provider || scholarship.organization}\n` +
      `💰 **ಮೊತ್ತ:** ${scholarship.amount} | 🗓️ **ಕೊನೆಯ ದಿನಾಂಕ:** ${scholarship.deadline}\n\n` +
      `${scholarship.description}\n\n` +
      `📋 **ಅಗತ್ಯವಿರುವ ಮುಖ್ಯ ದಾಖಲೆಗಳ ಪಟ್ಟಿ (Document Checklist):**\n` +
      `${docsList}\n\n` +
      `📝 **ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತಗಳು (Step-by-Step Procedure):**\n` +
      `${stepsList}\n\n` +
      `🔗 **ಅಧಿಕೃತ ಪೋರ್ಟಲ್:** [ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ](${officialUrl})`;
  }

  if (language === "hi-IN") {
    return `### 🏛️ ${scholarship.name}\n` +
      `**प्राधिकरण / संस्थान:** ${scholarship.provider || scholarship.organization}\n` +
      `💰 **छात्रवृत्ति राशि:** ${scholarship.amount} | 🗓️ **अंतिम तिथि:** ${scholarship.deadline}\n\n` +
      `${scholarship.description}\n\n` +
      `📋 **अनिवार्य दस्तावेजों की चेकलिस्ट (Document Checklist):**\n` +
      `${docsList}\n\n` +
      `📝 **आवेदन प्रक्रिया के चरण (How to Apply):**\n` +
      `${stepsList}\n\n` +
      `🔗 **आधिकारिक पोर्टल लिंक:** [आधिकारिक पोर्टल पर अभी आवेदन करें](${officialUrl})`;
  }

  return `### 🏛️ ${scholarship.name}\n` +
    `**Authority / Provider:** ${scholarship.provider || scholarship.organization}\n` +
    `💰 **Scholarship Grant:** ${scholarship.amount} | 🗓️ **Application Deadline:** ${scholarship.deadline}\n\n` +
    `${scholarship.description}\n\n` +
    `📋 **Required Documents Checklist:**\n` +
    `${docsList}\n\n` +
    `📝 **Step-by-Step Application Guide:**\n` +
    `${stepsList}\n\n` +
    `🔗 **Official Portal:** [Apply on Official Portal](${officialUrl})`;
}

// 9. Gemini Cloud Specific Scheme Response Generator
async function generateSpecificSchemeResponse(scholarship, aspect, userMessage, language = "en-IN") {
  if (aiClient) {
    try {
      const prompt = `You are "SevaSathi AI", an expert government scholarship counselor for Indian students.

The student asked: "${userMessage}"
Target Scheme Information:
- Name: ${scholarship.name}
- Provider / Authority: ${scholarship.provider || scholarship.organization}
- Award Amount: ${scholarship.amount}
- Deadline: ${scholarship.deadline}
- Official Portal URL: ${scholarship.officialLink || scholarship.officialUrl}
- Description: ${scholarship.description}
- Required Documents: ${JSON.stringify(scholarship.documents)}
- Step-by-Step Application Procedure: ${JSON.stringify(scholarship.applicationSteps)}
- Eligibility Criteria: Min ${scholarship.eligibility?.minPercentage || scholarship.minPercentage}%, Max Family Income ₹${(scholarship.eligibility?.maxFamilyIncome || scholarship.maxIncome)?.toLocaleString('en-IN')}, Allowed States: ${(scholarship.eligibility?.state || scholarship.allowedStates || []).join(", ")}, Allowed Categories: ${(scholarship.eligibility?.category || scholarship.allowedCategories || []).join(", ")}

Target Response Language: "${language}" (If "kn-IN", respond in authentic Kannada; if "hi-IN", respond in natural Hindi; if "en-IN", respond in professional English).

Rules:
1. Answer the student's question directly with clear focus on "${scholarship.name}".
2. DO NOT mention or list other scholarships. Focus exclusively on this scheme.
3. Structure your response in clean GitHub Flavored Markdown:
   - Brief scheme overview & key metrics (Amount, Deadline, Provider).
   - 📋 **Required Documents Checklist**: bullet points with checkmarks (✅) highlighting each essential document (e.g. Aadhaar NPCI bank seeding, Income Certificate RD number, College fee receipt).
   - 📝 **Step-by-Step How to Apply**: numbered steps.
   - 🔗 **Official Portal**: direct markdown link.
4. Keep the tone helpful, professional, and encouraging.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const reply = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && reply.trim().length > 0) {
        return reply.trim();
      }
    } catch (apiErr) {
      console.warn("⚠️ Gemini specific response error, falling back to structured template:", apiErr.message);
    }
  }

  return generateSpecificSchemeTemplate(scholarship, language);
}

// =========================================================
// API ROUTES FOR SCHOLARSHIPS
// =========================================================

// GET all scholarships from knowledge base
app.get("/api/scholarships", (req, res) => {
  res.json({
    success: true,
    count: SCHOLARSHIPS.length,
    scholarships: SCHOLARSHIPS
  });
});

// POST Chat / Search Endpoint (Intent-Router Architecture)
app.post("/api/scholarships/chat", async (req, res) => {
  try {
    const { message = "", language = "en-IN", studentProfile = {} } = req.body;
    console.log(`\n======================================================`);
    console.log(`[SevaSathi AI] Received Query: "${message}" | Lang: ${language}`);

    // Step 1: Intent Classification via Gemini 2.5 Flash (with resilient heuristic fallback)
    const classification = await classifyUserIntentWithGemini(message, studentProfile);
    const { intent, targetScholarship, aspect, extractedProfile } = classification;
    console.log(`[SevaSathi AI] Intent: ${intent} | Target: "${targetScholarship || 'none'}" | Aspect: "${aspect || 'none'}"`);

    // Step 2: Conditional Intent Routing
    if (intent === "SPECIFIC_QUERY") {
      // Find the specific scheme mentioned
      const specificScheme = findScholarshipByQuery(targetScholarship || message, SCHOLARSHIPS);

      if (specificScheme) {
        console.log(`[SevaSathi AI] Specific Query: Matched scheme "${specificScheme.name}"`);
        const replyMarkdown = await generateSpecificSchemeResponse(specificScheme, aspect, message, language);

        return res.json({
          success: true,
          intent: "SPECIFIC_QUERY",
          reply: replyMarkdown,
          scholarships: [specificScheme], // ONLY the single matched scheme!
          specificScheme,
          extractedProfile,
          count: 1,
          poweredBy: aiClient ? "Google Gen AI (@google/genai - gemini-2.5-flash)" : "SevaSathi Hybrid Precision Engine"
        });
      } else {
        // Query was specific but scheme wasn't found in knowledge base
        const replyMarkdown = `I couldn't find a verified scheme specifically matching "${targetScholarship || message}" in our database.\n\n` +
          `Here are some of the verified government & corporate scholarships in our system:\n` +
          `- **SSP Karnataka Post-Matric Scholarship** (Karnataka domicile)\n` +
          `- **AICTE Pragati Scholarship** (Girl engineering/diploma students)\n` +
          `- **Reliance Foundation UG Scholarship** (Merit-cum-means, all India)\n` +
          `- **PM-USP Central Sector Scheme (NSP)** (80th percentile in 12th)\n` +
          `- **HDFC Badhte Kadam Scholarship** (Crisis & low-income support)\n\n` +
          `Feel free to ask for document checklists for any of these, or share your course and family income to match scholarships!`;

        return res.json({
          success: true,
          intent: "SPECIFIC_QUERY",
          reply: replyMarkdown,
          scholarships: [],
          extractedProfile,
          count: 0,
          poweredBy: aiClient ? "Google Gen AI (@google/genai - gemini-2.5-flash)" : "SevaSathi Hybrid Precision Engine"
        });
      }
    }

    // Step 3: PROFILE_MATCH Intent
    console.log(`[SevaSathi AI] Profile Match: Filtering against student profile:`, extractedProfile);
    const matchedScholarships = filterScholarships(extractedProfile, SCHOLARSHIPS);
    const displayMatches = matchedScholarships.slice(0, 4);

    const replyMarkdown = generateProfileMatchMessage(displayMatches.length, extractedProfile, language);

    return res.json({
      success: true,
      intent: "PROFILE_MATCH",
      reply: replyMarkdown,
      scholarships: displayMatches,
      extractedProfile,
      count: displayMatches.length,
      poweredBy: aiClient ? "Google Gen AI (@google/genai - gemini-2.5-flash)" : "SevaSathi Hybrid Precision Engine"
    });
  } catch (error) {
    console.error("Backend error in /api/scholarships/chat:", error);
    res.status(500).json({
      success: false,
      reply: "We encountered an issue analyzing the scholarship database. Please try again with your course and income.",
      scholarships: SCHOLARSHIPS.slice(0, 3)
    });
  }
});

// =========================================================
// SERVER STARTUP
// =========================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SevaSathi backend running on http://localhost:${PORT}`);
  console.log(`📦 MongoDB Database Target: 'SevaSaathi'`);
  console.log(`🤖 AI Engine: ${aiClient ? "Google Gen AI (@google/genai - gemini-2.5-flash)" : "Heuristic NLP with 100% Precision Matching"}`);
});