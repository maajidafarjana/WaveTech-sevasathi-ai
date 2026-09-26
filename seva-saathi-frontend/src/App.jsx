import React, { useState, useMemo, useEffect } from "react";
import {
  Home,
  GraduationCap,
  Bell,
  Briefcase,
  User,
  AlertTriangle,
  FileText,
  Menu,
  X,
  MessageSquare,
  Search,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  ThumbsUp,
  Share2,
  Download,
  PhoneCall,
  Volume2,
  FileCheck,
  Building,
  HelpCircle,
  Compass,
  ArrowRight,
  Send
} from "lucide-react";

import SmartScholar from "./SmartScholar";
import ScholarshipModal from "./components/ScholarshipModal";
import { SCHOLARSHIPS_DATA, matchStudentScholarships } from "./data/scholarshipsData";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState("");

  // Global Student Profile State
  const [studentProfile, setStudentProfile] = useState({
    name: "Ananya Rao",
    income: 200000,
    category: "OBC",
    gender: "Female",
    course: "B.Tech",
    year: "2nd Year",
    state: "Karnataka",
    college: "Dayananda Sagar College of Engineering",
    studentId: "SS-2026-KA-4819",
    score: 82,
    documents: {
      aadhaarSeeded: true,
      incomeCert: true,
      casteCert: true,
      marksheet: true,
      bonafide: false,
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "SSP Karnataka Deadline Approaching",
      desc: "Post-Matric portal application closes in 65 days. Verify your e-Attestation.",
      time: "2h ago",
      unread: true,
      page: "SmartScholar"
    },
    {
      id: 2,
      title: "AICTE Pragati Portal Open",
      desc: "Fresh registrations open for technical girl students. ₹50,000/year grant.",
      time: "5h ago",
      unread: true,
      page: "SmartScholar"
    },
    {
      id: 3,
      title: "Campus Wi-Fi Maintenance Update",
      desc: "Block B hostel Wi-Fi routers upgraded to Wi-Fi 6.",
      time: "1d ago",
      unread: false,
      page: "Report Problem"
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Real-time matched scholarships for the student profile
  const matchedScholarships = useMemo(() => {
    return matchStudentScholarships(studentProfile);
  }, [studentProfile]);

  const eligibleScholarships = useMemo(() => {
    return matchedScholarships.filter(s => s.isEligible);
  }, [matchedScholarships]);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, badge: null },
    { name: "SmartScholar", icon: <GraduationCap size={20} />, badge: "AI" },
    { name: "Opportunities", icon: <Briefcase size={20} />, badge: "4 New" },
    { name: "Notices", icon: <Bell size={20} />, badge: unreadCount > 0 ? `${unreadCount}` : null },
    { name: "Report Problem", icon: <FileText size={20} />, badge: null },
    { name: "Emergency", icon: <AlertTriangle size={20} />, badge: "SOS", isEmergency: true },
    { name: "Profile", icon: <User size={20} />, badge: null },
  ];

  const handlePageChange = (page, prompt = "") => {
    setActivePage(page);
    setMenuOpen(false);
    setNotificationsOpen(false);
    if (prompt) {
      setChatInitialPrompt(prompt);
    } else {
      setChatInitialPrompt("");
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="app">
      {/* MOBILE MENU BUTTON */}
      <button
        className="mobileMenuButton"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR NAVIGATION */}
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="logoArea" onClick={() => handlePageChange("Dashboard")} role="button">
          <div className="logoIcon">
            <GraduationCap size={26} />
          </div>
          <div>
            <h2>SevaSathi AI</h2>
            <p>Smart Student Companion</p>
          </div>
        </div>

        <div className="sidebarScholarshipPill">
          <Sparkles size={14} className="sparkleIcon" />
          <span>{eligibleScholarships.length} Scholarships Matched</span>
        </div>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`navItem ${activePage === item.name ? "active" : ""} ${
                item.isEmergency ? "navEmergency" : ""
              }`}
              onClick={() => handlePageChange(item.name)}
            >
              <span className="navIconWrapper">{item.icon}</span>
              <span className="navText">{item.name}</span>
              {item.badge && (
                <span className={`navBadge ${item.isEmergency ? "badgeEmergency" : ""}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* SIDEBAR PROFILE CARD */}
        <div className="sidebarBottom">
          <div
            className="studentMiniProfile"
            onClick={() => handlePageChange("Profile")}
            role="button"
          >
            <div className="avatar">{studentProfile.name.charAt(0)}</div>
            <div className="studentMeta">
              <strong>{studentProfile.name}</strong>
              <small>{studentProfile.course} • {studentProfile.state}</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="mainContent">
        {/* TOP NAVBAR */}
        <header className="topBar">
          <div className="topBarLeft">
            <span className="smallTitle">SevaSathi AI Student Portal</span>
            <h1>{activePage}</h1>
          </div>

          <div className="topActions">
            {/* Global Search */}
            <div className="globalSearchContainer">
              <Search size={16} className="searchIcon" />
              <input
                type="text"
                placeholder="Search scholarships, notices, services..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && globalSearch.trim()) {
                    handlePageChange("SmartScholar", globalSearch);
                  }
                }}
              />
            </div>

            {/* Notifications Button & Dropdown */}
            <div className="notificationWrapper">
              <button
                className={`notificationButton ${unreadCount > 0 ? "hasUnread" : ""}`}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && <span className="notificationDot">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="notificationsDropdown">
                  <div className="notificationsHeader">
                    <strong>Notifications & Alerts</strong>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead} className="markReadBtn">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notificationsList">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notificationItem ${n.unread ? "unread" : ""}`}
                        onClick={() => handlePageChange(n.page)}
                      >
                        <div className="notifDot" />
                        <div>
                          <strong>{n.title}</strong>
                          <p>{n.desc}</p>
                          <small>{n.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <div
              className="profileCircle"
              onClick={() => handlePageChange("Profile")}
              title="View Student Profile"
            >
              {studentProfile.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* ACTIVE PAGE CONTENT ROUTER */}
        {activePage === "Dashboard" && (
          <Dashboard
            studentProfile={studentProfile}
            onUpdateProfile={setStudentProfile}
            matchedScholarships={matchedScholarships}
            eligibleScholarships={eligibleScholarships}
            onOpenModal={setSelectedScholarship}
            onNavigate={handlePageChange}
          />
        )}

        {activePage === "SmartScholar" && (
          <div className="page">
            <SmartScholar
              studentProfile={studentProfile}
              onUpdateProfile={setStudentProfile}
              initialPrompt={chatInitialPrompt}
            />
          </div>
        )}

        {activePage === "Emergency" && <Emergency studentProfile={studentProfile} />}

        {activePage === "Report Problem" && <ReportProblem studentProfile={studentProfile} />}

        {activePage === "Notices" && <Notices onNavigate={handlePageChange} />}

        {activePage === "Opportunities" && <Opportunities onNavigate={handlePageChange} />}

        {activePage === "Profile" && (
          <Profile
            studentProfile={studentProfile}
            onUpdateProfile={setStudentProfile}
            eligibleCount={eligibleScholarships.length}
          />
        )}

        {/* Global Scholarship Details Modal */}
        {selectedScholarship && (
          <ScholarshipModal
            scholarship={selectedScholarship}
            onClose={() => setSelectedScholarship(null)}
            onAskAI={(sch) => {
              handlePageChange(
                "SmartScholar",
                `Tell me step-by-step how to apply for ${sch.name} and what documents are required.`
              );
            }}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   1. DASHBOARD PAGE — INTEGRATED ELIGIBILITY ENGINE
========================================================= */

function Dashboard({
  studentProfile,
  onUpdateProfile,
  matchedScholarships,
  eligibleScholarships,
  onOpenModal,
  onNavigate
}) {
  const [filterCategory, setFilterCategory] = useState("All");

  const totalFundingEstimate = useMemo(() => {
    let total = 0;
    eligibleScholarships.forEach((s) => {
      const match = s.amount.match(/₹([0-9,]+)/);
      if (match) {
        total += parseInt(match[1].replace(/,/g, ""), 10);
      } else {
        total += 45000;
      }
    });
    return total;
  }, [eligibleScholarships]);

  const displayScholarships = useMemo(() => {
    if (filterCategory === "All") return matchedScholarships.slice(0, 6);
    if (filterCategory === "Eligible") return eligibleScholarships;
    if (filterCategory === "Government")
      return matchedScholarships.filter((s) => s.category === "Government");
    if (filterCategory === "CSR")
      return matchedScholarships.filter((s) => s.category.includes("Corporate") || s.category.includes("CSR") || s.category.includes("Trust"));
    return matchedScholarships;
  }, [matchedScholarships, eligibleScholarships, filterCategory]);

  return (
    <div className="page dashboardPage">
      {/* HERO BANNER */}
      <section className="dashboardHero">
        <div className="heroContent">
          <div className="heroBadge">
            <Sparkles size={15} />
            <span>AI SCHOLARSHIP MATCHMAKER & STUDENT COPILOT</span>
          </div>
          <h2>
            Empowering Your Education, <br />
            <span className="heroHighlight">{studentProfile.name || "Student"}!</span>
          </h2>
          <p>
            India hosts hundreds of Central, State, and Corporate scholarships. Enter your income
            and stream below to immediately calculate which scholarships you qualify for and how to apply!
          </p>

          <div className="heroStatStrip">
            <div className="heroStat">
              <strong className="textSuccess">{eligibleScholarships.length}</strong>
              <span>Scholarships Eligible</span>
            </div>
            <div className="heroStatDivider" />
            <div className="heroStat">
              <strong className="textPrimary">Up to ₹{totalFundingEstimate.toLocaleString('en-IN')}</strong>
              <span>Est. Annual Grants</span>
            </div>
            <div className="heroStatDivider" />
            <div className="heroStat">
              <strong className="textWarning">{studentProfile.state} & Central</strong>
              <span>Coverage Available</span>
            </div>
          </div>
        </div>

        <div className="heroGraphic">
          <div className="floatingShield">
            <GraduationCap size={48} />
          </div>
          <div className="floatingGlowSphere" />
        </div>
      </section>

      {/* CORE FEATURE: INTERACTIVE 1-CLICK ELIGIBILITY MATCHER */}
      <section className="section eligibilitySection">
        <div className="eligibilityCard">
          <div className="eligibilityCardHeader">
            <div>
              <span className="cardMiniLabel">INTERACTIVE PROFILE MATCHER</span>
              <h3>🎯 Check Your Real-Time Scholarship Eligibility</h3>
              <p>
                Adjust your income, course, or category to immediately see which scholarships you can apply for!
              </p>
            </div>
            <button
              className="voiceMatchBtn"
              onClick={() => onNavigate("SmartScholar", "Find all scholarships I am eligible for with my details")}
              title="Speak with Voice"
            >
              <Volume2 size={16} />
              <span>Or Match with Voice</span>
            </button>
          </div>

          <div className="eligibilityFormGrid">
            {/* Name */}
            <div className="inputCol">
              <label>Your Name</label>
              <input
                type="text"
                value={studentProfile.name}
                onChange={(e) => onUpdateProfile({ ...studentProfile, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            {/* Income */}
            <div className="inputCol">
              <label>
                Annual Family Income: <strong>₹{Number(studentProfile.income).toLocaleString('en-IN')}</strong>
              </label>
              <div className="incomeQuickChips">
                {[150000, 250000, 450000, 800000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    className={`incomeChip ${studentProfile.income === inc ? "active" : ""}`}
                    onClick={() => onUpdateProfile({ ...studentProfile, income: inc })}
                  >
                    &lt; ₹{(inc / 100000).toFixed(1)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Course / Degree */}
            <div className="inputCol">
              <label>Degree / Course</label>
              <select
                value={studentProfile.course}
                onChange={(e) => onUpdateProfile({ ...studentProfile, course: e.target.value })}
              >
                <option value="B.Tech">B.Tech / BE (Engineering)</option>
                <option value="Diploma">Polytechnic Diploma</option>
                <option value="MBBS">MBBS / Medical / Dental</option>
                <option value="B.Sc">B.Sc / General Degree</option>
                <option value="B.Com">B.Com / BBA</option>
                <option value="PUC">Class 11 / 12 (PUC)</option>
                <option value="Post-Graduate">Post-Graduate (M.Tech/MBA)</option>
              </select>
            </div>

            {/* Category */}
            <div className="inputCol">
              <label>Social Category / Caste</label>
              <select
                value={studentProfile.category}
                onChange={(e) => onUpdateProfile({ ...studentProfile, category: e.target.value })}
              >
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="General">General / Open</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Minority (Muslim, Christian, Jain, etc.)</option>
              </select>
            </div>

            {/* Gender */}
            <div className="inputCol">
              <label>Gender</label>
              <div className="genderToggleGroup">
                <button
                  type="button"
                  className={`genderBtn ${studentProfile.gender === "Female" ? "active" : ""}`}
                  onClick={() => onUpdateProfile({ ...studentProfile, gender: "Female" })}
                >
                  Female (Girls Priority)
                </button>
                <button
                  type="button"
                  className={`genderBtn ${studentProfile.gender === "Male" ? "active" : ""}`}
                  onClick={() => onUpdateProfile({ ...studentProfile, gender: "Male" })}
                >
                  Male / Other
                </button>
              </div>
            </div>

            {/* State of Domicile */}
            <div className="inputCol">
              <label>State Domicile</label>
              <select
                value={studentProfile.state}
                onChange={(e) => onUpdateProfile({ ...studentProfile, state: e.target.value })}
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="All India">All India</option>
              </select>
            </div>
          </div>

          {/* Real-time Match Summary Banner */}
          <div className="matchSummaryNotice">
            <div className="matchSummaryLeft">
              <CheckCircle2 size={20} className="textSuccess" />
              <span>
                Found <strong>{eligibleScholarships.length} scholarships</strong> that strictly match your income, gender, and course!
              </span>
            </div>
            <button
              className="openChatWithProfileBtn"
              onClick={() => onNavigate("SmartScholar", `Tell me which scholarships I can apply for as a ${studentProfile.gender} student studying ${studentProfile.course} with ₹${Number(studentProfile.income).toLocaleString('en-IN')} income in ${studentProfile.state}.`)}
            >
              <span>Ask AI Detailed Guidance</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* MATCHED SCHOLARSHIPS CARDS GRID */}
      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>Matched Scholarships For You</h2>
            <p>Click on any scholarship to review step-by-step application instructions and mandatory documents.</p>
          </div>

          <div className="filterPillsRow">
            {["All", "Eligible", "Government", "CSR"].map((f) => (
              <button
                key={f}
                className={`filterPill ${filterCategory === f ? "active" : ""}`}
                onClick={() => setFilterCategory(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="scholarshipsGrid">
          {displayScholarships.map((sch) => (
            <div
              key={sch.id}
              className={`scholarshipCardModern ${sch.isEligible ? "cardEligible" : "cardIneligible"}`}
              onClick={() => onOpenModal(sch)}
            >
              <div className="cardModernTop">
                <span className="orgTag">
                  <Building size={13} />
                  {sch.organization || sch.provider}
                </span>

                <span className={`matchBadge ${sch.matchScore >= 80 ? "highMatch" : "mediumMatch"}`}>
                  <Sparkles size={12} />
                  {sch.matchScore}% Match
                </span>
              </div>

              <h3>{sch.name}</h3>

              <div className="cardKeyMetrics">
                <div className="metric">
                  <DollarSign size={15} className="metricIcon green" />
                  <div>
                    <small>Grant Amount</small>
                    <strong>{sch.amount}</strong>
                  </div>
                </div>

                <div className="metric">
                  <Clock size={15} className="metricIcon amber" />
                  <div>
                    <small>Days Left</small>
                    <strong>{sch.daysLeft} Days</strong>
                  </div>
                </div>
              </div>

              {sch.qualifyReasons && sch.qualifyReasons.length > 0 && (
                <div className="whyEligibleBox">
                  <CheckCircle2 size={13} />
                  <span>{sch.qualifyReasons[0]}</span>
                </div>
              )}

              <div className="cardModernFooter">
                <button
                  className="stepGuideBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenModal(sch);
                  }}
                >
                  <span>Steps & Checklist</span>
                  <ChevronRight size={15} />
                </button>

                <a
                  href={sch.officialUrl || sch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portalDirectBtn"
                  onClick={(e) => e.stopPropagation()}
                  title="Open Portal"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS FOR CAMPUS SERVICES */}
      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>Campus & Student Services</h2>
            <p>One-touch access to essential campus resources, safety, and problem reporting.</p>
          </div>
        </div>

        <div className="quickGrid">
          <div className="quickCard cardScholar" onClick={() => onNavigate("SmartScholar")}>
            <div className="quickIcon">🤖</div>
            <h3>SmartScholar AI</h3>
            <p>Multilingual voice & text assistant to guide your scholarship applications.</p>
            <span className="cardLinkText">Open Assistant →</span>
          </div>

          <div className="quickCard cardEmergency" onClick={() => onNavigate("Emergency")}>
            <div className="quickIcon">🚨</div>
            <h3>Campus Emergency SOS</h3>
            <p>Instant SOS trigger, campus warden contacts, ambulance, and women helplines.</p>
            <span className="cardLinkText">Emergency Hub →</span>
          </div>

          <div className="quickCard cardProblem" onClick={() => onNavigate("Report Problem")}>
            <div className="quickIcon">📝</div>
            <h3>Report Problem</h3>
            <p>Report hostel, Wi-Fi, sanitation, or academic issues with live ticket tracking.</p>
            <span className="cardLinkText">Track Tickets →</span>
          </div>

          <div className="quickCard cardOpportunities" onClick={() => onNavigate("Opportunities")}>
            <div className="quickIcon">💼</div>
            <h3>Opportunities Radar</h3>
            <p>Explore verified student internships, hackathons, and research fellowships.</p>
            <span className="cardLinkText">Explore Radar →</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   2. EMERGENCY & CAMPUS SOS PAGE
========================================================= */

function Emergency({ studentProfile }) {
  const [sosCounting, setSosCounting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sosTriggered, setSosTriggered] = useState(false);

  const startSosCountdown = () => {
    setSosCounting(true);
    setCountdown(3);
    setSosTriggered(false);

    let counter = 3;
    const interval = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter <= 0) {
        clearInterval(interval);
        setSosCounting(false);
        setSosTriggered(true);
        triggerSirenAudio();
      }
    }, 1000);
  };

  const cancelSos = () => {
    setSosCounting(false);
    setCountdown(3);
    setSosTriggered(false);
  };

  // Safe synthesized web audio beep for emergency simulation
  const triggerSirenAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log("Audio siren error:", e);
    }
  };

  const sendWhatsAppSos = () => {
    const message = encodeURIComponent(
      `🚨 EMERGENCY SOS from ${studentProfile.name}! Student ID: ${studentProfile.studentId}, Course: ${studentProfile.course}. I need urgent assistance on campus. Please contact me immediately!`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  return (
    <div className="page emergencyPage">
      {/* SOS HERO TRIGGER */}
      <div className="sosHeroCard">
        <div className="sosHeroContent">
          <span className="sosBadge">CAMPUS RESCUE & RAPID RESPONSE</span>
          <h2>Campus Emergency SOS Hub</h2>
          <p>
            If you are in immediate danger, feel unsafe, or need medical attention, press the SOS button
            or use the verified one-touch helplines below.
          </p>

          <div className="sosActionsRow">
            {!sosCounting && !sosTriggered && (
              <button className="bigSosBtn" onClick={startSosCountdown}>
                <ShieldAlert size={28} />
                <span>TRIGGER SOS (3 SECONDS)</span>
              </button>
            )}

            {sosCounting && (
              <div className="countdownBox">
                <span className="countNumber">{countdown}</span>
                <p>Sending alert to Campus Security in {countdown} seconds...</p>
                <button className="cancelSosBtn" onClick={cancelSos}>
                  Cancel SOS
                </button>
              </div>
            )}

            {sosTriggered && (
              <div className="sosTriggeredNotice">
                <CheckCircle2 size={24} />
                <div>
                  <strong>🚨 SOS Alert Broadcasted!</strong>
                  <p>Campus Security & Emergency responders have been alerted with your profile.</p>
                </div>
                <button className="cancelSosBtn" onClick={cancelSos}>
                  Reset
                </button>
              </div>
            )}

            <button className="whatsappSosBtn" onClick={sendWhatsAppSos}>
              <span>Share Location via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* EMERGENCY HELPLINES DIRECTORY */}
      <div className="section">
        <div className="sectionHeader">
          <div>
            <h2>24x7 Emergency Hotlines</h2>
            <p>Verified government and campus emergency telephone numbers.</p>
          </div>
        </div>

        <div className="emergencyGrid">
          <div className="emergencyCard medicalCard">
            <div className="emIcon">🚑</div>
            <h3>Ambulance & Medical</h3>
            <p>National Emergency Medical Services for road or campus health crises.</p>
            <a href="tel:108" className="emCallBtn red">
              <PhoneCall size={15} />
              <span>Call 108</span>
            </a>
          </div>

          <div className="emergencyCard policeCard">
            <div className="emIcon">🚓</div>
            <h3>Police Helpline</h3>
            <p>Immediate police assistance and crime reporting across India.</p>
            <a href="tel:112" className="emCallBtn blue">
              <PhoneCall size={15} />
              <span>Call 112</span>
            </a>
          </div>

          <div className="emergencyCard womenCard">
            <div className="emIcon">🛡️</div>
            <h3>Women Safety Helpline</h3>
            <p>24x7 dedicated emergency line for women safety and harassment protection.</p>
            <a href="tel:1091" className="emCallBtn purple">
              <PhoneCall size={15} />
              <span>Call 1091</span>
            </a>
          </div>

          <div className="emergencyCard raggingCard">
            <div className="emIcon">🚫</div>
            <h3>Anti-Ragging Helpline</h3>
            <p>UGC National Anti-Ragging Toll Free 24x7 hotline.</p>
            <a href="tel:18001805522" className="emCallBtn orange">
              <PhoneCall size={15} />
              <span>Call 1800-180-5522</span>
            </a>
          </div>

          <div className="emergencyCard mentalHealthCard">
            <div className="emIcon">🧠</div>
            <h3>Tele-MANAS Mental Health</h3>
            <p>Government mental health counseling and emotional crisis support.</p>
            <a href="tel:14416" className="emCallBtn green">
              <PhoneCall size={15} />
              <span>Call 14416</span>
            </a>
          </div>

          <div className="emergencyCard campusGuardCard">
            <div className="emIcon">🏢</div>
            <h3>Campus Security Desk</h3>
            <p>Main gate security and night hostel patrol warden.</p>
            <a href="tel:08026662222" className="emCallBtn dark">
              <PhoneCall size={15} />
              <span>Call Campus Guard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   3. REPORT A PROBLEM (WITH LIVE TICKET TRACKER)
========================================================= */

function ReportProblem({ studentProfile }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wi-Fi & Internet");
  const [urgency, setUrgency] = useState("Medium");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Initial campus tickets & live sync with MongoDB SevaSaathi database
  const [tickets, setTickets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tickets from MongoDB SevaSaathi collection
  const fetchGrievances = () => {
    fetch("http://localhost:5000/api/grievances")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tickets) {
          const formatted = data.tickets.map((t) => ({
            id: t.ticketId,
            title: t.problemTitle,
            category: t.category,
            location: t.location,
            urgency: t.urgency,
            status: t.status,
            date: new Date(t.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            upvotes: t.upvotes || 0,
            author: t.anonymous
              ? "Anonymous Student"
              : (t.studentId ? `Student (${t.studentId})` : "Student"),
          }));
          setTickets(formatted);
        }
      })
      .catch((err) => {
        console.log("Database offline or syncing locally:", err);
      });
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill in problem title and description.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ticketId: `SS-${Math.floor(1000 + Math.random() * 9000)}`,
      problemTitle: title.trim(),
      category,
      urgency,
      location: location.trim() || "Campus Main Area",
      description: description.trim(),
      anonymous: isAnonymous,
      studentId: isAnonymous ? null : studentProfile.studentId,
      status: "Submitted",
      assignedTo: "Campus Maintenance Team",
    };

    try {
      const res = await fetch("http://localhost:5000/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        const saved = data.ticket;
        const newTicket = {
          id: saved.ticketId,
          title: saved.problemTitle,
          category: saved.category,
          location: saved.location,
          urgency: saved.urgency,
          status: saved.status,
          date: "Just now",
          upvotes: saved.upvotes || 0,
          author: saved.anonymous ? "Anonymous Student" : studentProfile.name,
        };
        setTickets([newTicket, ...tickets]);
      } else {
        throw new Error(data.error || "Failed to save to database");
      }
    } catch (err) {
      console.log("Saving locally as fallback:", err);
      const fallbackTicket = {
        id: payload.ticketId,
        title: payload.problemTitle,
        category: payload.category,
        location: payload.location,
        urgency: payload.urgency,
        status: payload.status,
        date: "Just now",
        upvotes: 0,
        author: isAnonymous ? "Anonymous Student" : studentProfile.name,
      };
      setTickets([fallbackTicket, ...tickets]);
    } finally {
      setIsSubmitting(false);
    }

    setTitle("");
    setLocation("");
    setDescription("");
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  const handleUpvote = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/grievances/${id}/upvote`, {
        method: "PATCH",
      });
    } catch (err) {
      console.log("Upvote offline:", err);
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
  };

  return (
    <div className="page reportProblemPage">
      <div className="problemLayoutGrid">
        {/* Left: Reporting Form */}
        <div className="problemFormCard">
          <div className="formHeader">
            <span className="cardMiniLabel">STUDENT GRIEVANCE REDRESSAL</span>
            <h2>Report a Campus Problem</h2>
            <p>Submit campus infrastructure, mess, or facility issues for immediate resolution.</p>
          </div>

          {submittedMessage && (
            <div className="ticketSuccessAlert">
              <CheckCircle2 size={18} />
              <span>Ticket submitted successfully! You can track live progress on the right.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="formGroup">
              <label>Problem Title *</label>
              <input
                type="text"
                placeholder="e.g. Wi-Fi router dead in room 302, Hostel A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Wi-Fi & Internet">Wi-Fi & Internet</option>
                  <option value="Hostel & Mess">Hostel & Mess Food</option>
                  <option value="Classroom & Labs">Classroom & Lab Equipment</option>
                  <option value="Sanitation & Water">Sanitation & Drinking Water</option>
                  <option value="Campus Safety">Campus Safety & Lighting</option>
                  <option value="Scholarship Desk">Scholarship / Fee Desk</option>
                </select>
              </div>

              <div className="formGroup">
                <label>Urgency Level</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="Normal">Normal (Within 48 hours)</option>
                  <option value="Medium">Medium (Within 24 hours)</option>
                  <option value="Urgent">Urgent (Immediate attention)</option>
                </select>
              </div>
            </div>

            <div className="formGroup">
              <label>Location / Room / Building</label>
              <input
                type="text"
                placeholder="e.g. Mechanical Block 2nd Floor, Room 204"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>Detailed Explanation *</label>
              <textarea
                rows="4"
                placeholder="Describe the issue, when it started, and who it affects..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="formGroup checkboxGroup">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Submit anonymously (hides your name from public tickets)</span>
              </label>
            </div>

            <button type="submit" className="primaryButton">
              Submit Grievance Ticket
            </button>
          </form>
        </div>

        {/* Right: Live Ticket Tracker */}
        <div className="ticketsTrackerCard">
          <div className="trackerHeader">
            <h3>Live Campus Ticket Tracker</h3>
            <span className="badgeCount">{tickets.length} Active</span>
          </div>

          <div className="ticketsList">
            {tickets.map((t) => (
              <div key={t.id} className="ticketCard">
                <div className="ticketTop">
                  <span className="ticketId">#{t.id}</span>
                  <span className={`statusPill status-${t.status.replace(/\s+/g, "").toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>

                <h4>{t.title}</h4>
                <small className="ticketLocation">📍 {t.location}</small>

                <div className="ticketFooter">
                  <span className="ticketMeta">{t.category} • {t.date}</span>
                  <button className="upvoteBtn" onClick={() => handleUpvote(t.id)}>
                    <ThumbsUp size={13} />
                    <span>{t.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   4. NOTICES & CIRCULARS PAGE
========================================================= */

function Notices({ onNavigate }) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const noticesList = [
    {
      id: 1,
      title: "Karnataka SSP Post-Matric e-Attestation Drive",
      tag: "Scholarship",
      date: "Today, 09:00 AM",
      desc: "All students applying for SSP Karnataka 2026 are required to get their college fee receipts and previous year marksheets e-Attested at the college administrative block desk 4.",
      isPinned: true
    },
    {
      id: 2,
      title: "Semester End Exam Registration Schedule Released",
      tag: "Academic",
      date: "Yesterday",
      desc: "Exam registration portal for B.Tech, M.Tech, and Diploma even semesters is now live. Last date without late fee is 15th of next month.",
      isPinned: true
    },
    {
      id: 3,
      title: "AICTE Pragati & Saksham Scholarship Verification",
      tag: "Scholarship",
      date: "2 days ago",
      desc: "Institute-level verification for girl students and specially-abled students who applied on the National Scholarship Portal (NSP) will conclude this Friday.",
      isPinned: false
    },
    {
      id: 4,
      title: "Smart India Hackathon 2026 Internal Campus Nominations",
      tag: "Events",
      date: "3 days ago",
      desc: "Teams wishing to participate in SIH 2026 can submit their project abstracts via SevaSathi Opportunities radar.",
      isPinned: false
    }
  ];

  const filteredNotices = noticesList.filter((n) => {
    const matchesTag = selectedTag === "All" || n.tag === selectedTag;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="page noticesPage">
      <div className="noticesHeaderBar">
        <div>
          <h2>Campus Circulars & Official Notices</h2>
          <p>Stay updated with verified college notifications, exam dates, and scholarship circulars.</p>
        </div>

        <div className="noticesSearchWrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="noticesFilterRow">
        {["All", "Scholarship", "Academic", "Events"].map((t) => (
          <button
            key={t}
            className={`filterPill ${selectedTag === t ? "active" : ""}`}
            onClick={() => setSelectedTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="noticesCardsList">
        {filteredNotices.map((n) => (
          <div key={n.id} className={`noticeCardItem ${n.isPinned ? "pinnedNotice" : ""}`}>
            <div className="noticeHeaderRow">
              <span className="noticeTagBadge">{n.tag}</span>
              <span className="noticeDateText">{n.date}</span>
            </div>

            <h3>{n.title}</h3>
            <p>{n.desc}</p>

            <div className="noticeCardActions">
              <button
                className="actionLinkBtn"
                onClick={() => {
                  if (n.tag === "Scholarship") onNavigate("SmartScholar", n.title);
                }}
              >
                <span>View Details & Actions</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   5. OPPORTUNITIES & HACKATHONS RADAR
========================================================= */

function Opportunities({ onNavigate }) {
  const [filterType, setFilterType] = useState("All");

  const opportunitiesList = [
    {
      id: "opp-1",
      title: "Smart India Hackathon (SIH) 2026",
      organization: "Ministry of Education & AICTE",
      type: "Hackathon",
      stipend: "₹1,00,000 Grand Prize",
      deadline: "25 Oct 2026",
      tags: ["National", "Hardware/Software", "College Teams"],
      desc: "World's biggest open innovation model challenging students to solve real problems of ministries, departments, and industries.",
      link: "https://www.sih.gov.in/"
    },
    {
      id: "opp-2",
      title: "Google Summer of Code (GSoC) 2026",
      organization: "Google Open Source",
      type: "Internship",
      stipend: "$1,500 – $3,000 USD Stipend",
      deadline: "04 Nov 2026",
      tags: ["Remote", "Open Source", "Global"],
      desc: "Global online program focusing on bringing new contributors into open source software development organizations.",
      link: "https://summerofcode.withgoogle.com/"
    },
    {
      id: "opp-3",
      title: "DRDO Student Research Apprenticeship",
      organization: "Defence Research & Development Organisation",
      type: "Fellowship",
      stipend: "₹12,000 / month",
      deadline: "18 Nov 2026",
      tags: ["Government", "R&D", "Electronics/CS/Mech"],
      desc: "Hands-on engineering research apprenticeship in DRDO defense laboratories across India.",
      link: "https://www.drdo.gov.in/"
    },
    {
      id: "opp-4",
      title: "Tata Technologies InnoVent Challenge",
      organization: "Tata Technologies",
      type: "Hackathon",
      stipend: "₹3,00,000 + PPO Opportunity",
      deadline: "12 Dec 2026",
      tags: ["EV", "AI", "Pre-Placement Offer"],
      desc: "Competition for 3rd and 4th year engineering students to innovate next-generation electric vehicles and AI mobility solutions.",
      link: "https://www.tatatechnologies.com/"
    }
  ];

  const filteredOpportunities = opportunitiesList.filter((item) => {
    if (filterType === "All") return true;
    return item.type === filterType;
  });

  return (
    <div className="page opportunitiesPage">
      <div className="sectionHeader">
        <div>
          <h2>Career & Student Opportunities Radar</h2>
          <p>Handpicked national hackathons, government apprenticeships, and paid tech internships.</p>
        </div>

        <div className="filterPillsRow">
          {["All", "Hackathon", "Internship", "Fellowship"].map((t) => (
            <button
              key={t}
              className={`filterPill ${filterType === t ? "active" : ""}`}
              onClick={() => setFilterType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="opportunitiesGrid">
        {filteredOpportunities.map((item) => (
          <div key={item.id} className="opportunityCard">
            <div className="oppTop">
              <span className="oppOrg">{item.organization}</span>
              <span className={`oppTypeBadge type-${item.type.toLowerCase()}`}>{item.type}</span>
            </div>

            <h3>{item.title}</h3>
            <p className="oppDesc">{item.desc}</p>

            <div className="oppKeyDetails">
              <div className="oppDetail">
                <small>Stipend / Award</small>
                <strong>{item.stipend}</strong>
              </div>
              <div className="oppDetail">
                <small>Deadline</small>
                <strong>{item.deadline}</strong>
              </div>
            </div>

            <div className="oppTags">
              {item.tags.map((tag, idx) => (
                <span key={idx} className="oppTag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="oppFooter">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="oppApplyBtn"
              >
                <span>Apply / Register</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   6. PROFILE & SCHOLARSHIP DOCUMENT LOCKER
========================================================= */

function Profile({ studentProfile, onUpdateProfile, eligibleCount }) {
  const [docStatuses, setDocStatuses] = useState(studentProfile.documents);

  const toggleDoc = (key) => {
    const updated = { ...docStatuses, [key]: !docStatuses[key] };
    setDocStatuses(updated);
    onUpdateProfile({ ...studentProfile, documents: updated });
  };

  const docsReadyCount = Object.values(docStatuses).filter(Boolean).length;
  const docsTotal = Object.keys(docStatuses).length;
  const readinessPercentage = Math.round((docsReadyCount / docsTotal) * 100);

  return (
    <div className="page profilePage">
      {/* DIGITAL STUDENT IDENTITY CARD */}
      <div className="studentIdBanner">
        <div className="studentIdCard">
          <div className="idCardTop">
            <div className="idCardLogo">
              <GraduationCap size={22} />
              <span>SevaSathi Digital ID</span>
            </div>
            <span className="verifiedStudentTag">
              <CheckCircle2 size={13} />
              Verified Student
            </span>
          </div>

          <div className="idCardBody">
            <div className="idAvatar">{studentProfile.name.charAt(0)}</div>
            <div className="idDetails">
              <h3>{studentProfile.name}</h3>
              <p className="collegeText">{studentProfile.college}</p>
              <div className="idChipsRow">
                <span>{studentProfile.course}</span>
                <span>{studentProfile.year}</span>
                <span>{studentProfile.state}</span>
              </div>
              <small className="idNum">ID: {studentProfile.studentId}</small>
            </div>
          </div>
        </div>

        {/* Quick Readiness Score Widget */}
        <div className="readinessMeterCard">
          <div className="meterTop">
            <span className="meterTitle">Scholarship Document Readiness</span>
            <span className="meterScore">{readinessPercentage}%</span>
          </div>

          <div className="meterBarTrack">
            <div className="meterBarFill" style={{ width: `${readinessPercentage}%` }} />
          </div>

          <p className="meterHint">
            {readinessPercentage === 100
              ? "🎉 Excellent! All mandatory documents are ready for instant scholarship submission."
              : "⚠️ Keep your pending certificates ready to prevent application rejection on government portals."}
          </p>

          <div className="readinessStats">
            <div>
              <strong>{eligibleCount}</strong>
              <small>Eligible Scholarships</small>
            </div>
            <div className="divider" />
            <div>
              <strong>{docsReadyCount} of {docsTotal}</strong>
              <small>Documents Ready</small>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT VAULT CHECKLIST */}
      <div className="section">
        <div className="sectionHeader">
          <div>
            <h2>Mandatory Scholarship Documents Vault</h2>
            <p>Ensure your digital certificates and bank seeding are active to avoid portal rejection.</p>
          </div>
        </div>

        <div className="docsVaultGrid">
          <div
            className={`docVaultCard ${docStatuses.aadhaarSeeded ? "ready" : "pending"}`}
            onClick={() => toggleDoc("aadhaarSeeded")}
          >
            <div className="docCardIcon">💳</div>
            <div className="docCardInfo">
              <h4>Aadhaar Seeded Bank Account (DBT)</h4>
              <p>Mandatory for direct benefit transfer of scholarship funds.</p>
              <span className="statusLabel">
                {docStatuses.aadhaarSeeded ? "✓ Verified & Active" : "⚠️ Needs NPCI Seeding"}
              </span>
            </div>
          </div>

          <div
            className={`docVaultCard ${docStatuses.incomeCert ? "ready" : "pending"}`}
            onClick={() => toggleDoc("incomeCert")}
          >
            <div className="docCardIcon">📜</div>
            <div className="docCardInfo">
              <h4>Income Certificate (Tahsildar / RD)</h4>
              <p>Annual family income proof (under ₹{Number(studentProfile.income).toLocaleString('en-IN')}).</p>
              <span className="statusLabel">
                {docStatuses.incomeCert ? "✓ RD Number Active" : "⚠️ Needs Renewal"}
              </span>
            </div>
          </div>

          <div
            className={`docVaultCard ${docStatuses.casteCert ? "ready" : "pending"}`}
            onClick={() => toggleDoc("casteCert")}
          >
            <div className="docCardIcon">🏛️</div>
            <div className="docCardInfo">
              <h4>Caste / Category Certificate ({studentProfile.category})</h4>
              <p>Reserved category concession verification certificate.</p>
              <span className="statusLabel">
                {docStatuses.casteCert ? "✓ Verified" : "⚠️ Pending"}
              </span>
            </div>
          </div>

          <div
            className={`docVaultCard ${docStatuses.marksheet ? "ready" : "pending"}`}
            onClick={() => toggleDoc("marksheet")}
          >
            <div className="docCardIcon">🎓</div>
            <div className="docCardInfo">
              <h4>Previous Year Marksheet / Board Score</h4>
              <p>Score: {studentProfile.score}% in previous qualifying examination.</p>
              <span className="statusLabel">
                {docStatuses.marksheet ? "✓ e-Attested" : "⚠️ Pending e-Attestation"}
              </span>
            </div>
          </div>

          <div
            className={`docVaultCard ${docStatuses.bonafide ? "ready" : "pending"}`}
            onClick={() => toggleDoc("bonafide")}
          >
            <div className="docCardIcon">🏫</div>
            <div className="docCardInfo">
              <h4>College Bonafide & Fee Receipt</h4>
              <p>Official study certificate signed by college principal / registrar.</p>
              <span className="statusLabel">
                {docStatuses.bonafide ? "✓ Uploaded" : "⚠️ Pending College Attestation"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;