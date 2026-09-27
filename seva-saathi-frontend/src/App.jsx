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
  Send,
  LogOut,
} from "lucide-react";

import SmartScholar from "./SmartScholar";
import ScholarshipModal from "./components/ScholarshipModal";
import AuthPage from "./components/AuthPage";
import ScholarshipTracker from "./components/ScholarshipTracker";
import ScholarshipHelpdesk from "./components/ScholarshipHelpdesk";
import { matchStudentScholarships } from "./data/scholarshipsData";
import { apiUrl } from "./config/api";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState("");

  // Authenticated Student State (Saved in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sevasathi_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Global Student Profile State
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("sevasathi_user");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      name: "Ananya Rao",
      email: "ananya.rao@dsce.edu.in",
      mobile: "9876543210",
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
      },
    };
  });

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("sevasathi_user");
    localStorage.removeItem("sevasathi_token");
    setCurrentUser(null);
    setActivePage("Dashboard");
  };

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "SSP Karnataka Deadline Approaching",
      desc: "Post-Matric portal application closes in 65 days. Verify your e-Attestation.",
      time: "2h ago",
      unread: true,
      page: "Track Application",
    },
    {
      id: 2,
      title: "AICTE Pragati Portal Open",
      desc: "Fresh registrations open for technical girl students. ₹50,000/year grant.",
      time: "5h ago",
      unread: true,
      page: "SmartScholar",
    },
    {
      id: 3,
      title: "Scholarship Grievance Nodal Update",
      desc: "Your ticket #SS-7192 has been picked up by District Officer.",
      time: "1d ago",
      unread: false,
      page: "Scholarship Helpdesk",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Matched scholarships from FastAPI, with local engine as fallback
  const [matchedScholarships, setMatchedScholarships] = useState(() =>
    matchStudentScholarships(studentProfile)
  );

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl("/api/scholarships/match"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentProfile }),
        });
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.scholarships)) {
          setMatchedScholarships(data.scholarships);
          return;
        }
      } catch (err) {
        console.log("Scholarship match API unavailable, using local engine:", err);
      }
      if (!cancelled) {
        setMatchedScholarships(matchStudentScholarships(studentProfile));
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [studentProfile]);

  const eligibleScholarships = useMemo(() => {
    return matchedScholarships.filter((s) => s.isEligible);
  }, [matchedScholarships]);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, badge: null },
    { name: "SmartScholar", icon: <GraduationCap size={20} />, badge: "AI" },
    { name: "Track Application", icon: <Clock size={20} />, badge: "5 Stages" },
    { name: "Scholarship Helpdesk", icon: <HelpCircle size={20} />, badge: "Support" },
    { name: "Opportunities", icon: <Briefcase size={20} />, badge: "4 New" },
    { name: "Notices", icon: <Bell size={20} />, badge: unreadCount > 0 ? `${unreadCount}` : null },
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

  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setStudentProfile((prev) => ({
            ...prev,
            ...user,
            documents: user.documents || prev.documents,
          }));
          setActivePage("Dashboard");
        }}
      />
    );
  }

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
              className={`navItem ${activePage === item.name ? "active" : ""}`}
              onClick={() => handlePageChange(item.name)}
            >
              <span className="navIconWrapper">{item.icon}</span>
              <span className="navText">{item.name}</span>
              {item.badge && (
                <span className="navBadge">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* SIDEBAR PROFILE & LOGOUT */}
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
          <button
            type="button"
            className="sidebarLogoutBtn"
            onClick={handleLogout}
            title="Log out of SevaSathi"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
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

            {/* Top Sign Out Button */}
            <button
              type="button"
              className="topLogoutBtn"
              onClick={handleLogout}
              title="Sign Out of SevaSathi"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
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

        {activePage === "Track Application" && (
          <div className="page">
            <ScholarshipTracker onNavigateHelpdesk={handlePageChange} />
          </div>
        )}

        {(activePage === "Scholarship Helpdesk" || activePage === "Report Problem") && (
          <div className="page">
            <ScholarshipHelpdesk
              studentProfile={studentProfile}
              initialTopic={chatInitialPrompt}
            />
          </div>
        )}

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

      {/* LIVE SCHOLARSHIP APPLICATION TRACKER SECTION */}
      <section className="section dashboardTrackerSection">
        <ScholarshipTracker compact={true} onNavigateHelpdesk={onNavigate} />
      </section>

      {/* QUICK ACTIONS FOR SCHOLARSHIP SERVICES & HELPDESK */}
      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>Scholarship Services & Student Helpdesk</h2>
            <p>One-touch access to AI matching, live 5-stage tracking, and priority grievance redressal.</p>
          </div>
        </div>

        <div className="quickGrid">
          <div className="quickCard cardScholar" onClick={() => onNavigate("SmartScholar")}>
            <div className="quickIcon">🤖</div>
            <h3>SmartScholar AI</h3>
            <p>Multilingual voice & text assistant to guide your scholarship applications.</p>
            <span className="cardLinkText">Open Assistant →</span>
          </div>

          <div className="quickCard cardTracker" onClick={() => onNavigate("Track Application")}>
            <div className="quickIcon">⏱️</div>
            <h3>Track Your Scholarship</h3>
            <p>Visual 5-stage progress from college verification to bank DBT credit.</p>
            <span className="cardLinkText">Check Status →</span>
          </div>

          <div className="quickCard cardHelpdesk" onClick={() => onNavigate("Scholarship Helpdesk")}>
            <div className="quickIcon">🛡️</div>
            <h3>Scholarship Helpdesk</h3>
            <p>Report portal login errors, certificate upload failures, or Aadhaar mismatches.</p>
            <span className="cardLinkText">Report Issue →</span>
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
   4. NOTICES & CIRCULARS PAGE
========================================================= */

function Notices({ onNavigate }) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fallbackNotices = [
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

  const [noticesList, setNoticesList] = useState(fallbackNotices);

  useEffect(() => {
    fetch(apiUrl("/api/notices"))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notices) && data.notices.length) {
          setNoticesList(data.notices);
        }
      })
      .catch((err) => console.log("Notices API unavailable:", err));
  }, []);

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

  const fallbackOpportunities = [
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

  const [opportunitiesList, setOpportunitiesList] = useState(fallbackOpportunities);

  useEffect(() => {
    fetch(apiUrl("/api/opportunities"))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.opportunities) && data.opportunities.length) {
          setOpportunitiesList(data.opportunities);
        }
      })
      .catch((err) => console.log("Opportunities API unavailable:", err));
  }, []);

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