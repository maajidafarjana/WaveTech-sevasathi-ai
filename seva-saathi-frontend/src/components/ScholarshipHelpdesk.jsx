import React, { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Search,
  Filter,
  Clock,
  ThumbsUp,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { apiUrl } from "../config/api";

const ISSUE_CATEGORIES = [
  "Portal Login Error",
  "Income/Caste Certificate Upload Failure",
  "Aadhaar-Bank Seeding Mismatch",
  "College Verification Pending",
  "Name Mismatch (Aadhaar vs Marksheet)",
  "Application Form Submission Error",
  "Payment / DBT Disbursement Issue",
  "Scholarship Renewal Technical Failure",
  "Other Scholarship Issue",
];

const COMMON_SCHEMES = [
  "SSP Karnataka Post-Matric Scholarship",
  "AICTE Pragati Scholarship for Girls",
  "NSP Central Sector Scheme of Scholarship (CSSS)",
  "Post-Matric Scholarship for SC/ST Students",
  "Reliance Foundation Undergraduate Scholarship",
  "HDFC Badhte Kadam Scholarship",
  "Vidyasiri / Food & Accommodation Scheme",
];

export default function ScholarshipHelpdesk({ studentProfile, initialTopic = "" }) {
  // Form fields
  const [issueCategory, setIssueCategory] = useState("Portal Login Error");
  const [schemeName, setSchemeName] = useState("");
  const [problemTitle, setProblemTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Screenshot upload state
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotSize, setScreenshotSize] = useState("");
  const fileInputRef = useRef(null);

  // Ticket submission & tracking state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);

  // Set initial topic if provided
  useEffect(() => {
    if (initialTopic) {
      setProblemTitle(initialTopic);
      if (initialTopic.toLowerCase().includes("ssp")) {
        setSchemeName("SSP Karnataka Post-Matric Scholarship");
      } else if (initialTopic.toLowerCase().includes("pragati")) {
        setSchemeName("AICTE Pragati Scholarship for Girls");
      }
    }
  }, [initialTopic]);

  // Seed sample scholarship tickets
  const defaultTickets = [
    {
      id: "SS-7192",
      ticketId: "SS-7192",
      title: "e-Attestation document upload failing with Server 500 error",
      schemeName: "SSP Karnataka Post-Matric Scholarship",
      category: "Income/Caste Certificate Upload Failure",
      urgency: "Urgent",
      location: "SSP Portal (e-Attestation Portal)",
      description:
        "When attempting to upload the Tahsildar RD certificate for income verification, the portal displays 'Service Unavailable - 500' and rejects the PDF.",
      status: "In Progress",
      date: "Yesterday",
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      author: studentProfile.name,
      screenshot: null,
      upvotes: 4,
      assignedTo: "State Welfare IT Cell",
      resolutionNote: "Server cache cleared on SSP e-Attestation nodes. Officer currently validating RD certificate manually.",
    },
    {
      id: "SS-5401",
      ticketId: "SS-5401",
      title: "Bank seeding mismatch: Aadhaar active on NPCI but portal says unseeded",
      schemeName: "NSP Central Sector Scheme of Scholarship (CSSS)",
      category: "Aadhaar-Bank Seeding Mismatch",
      urgency: "High",
      location: "National Scholarship Portal (NSP 2.0)",
      description:
        "My Canara Bank account is seeded with Aadhaar as confirmed by bank branch manager, but NSP verification status still shows red flag 'Aadhaar not linked'.",
      status: "Resolved",
      date: "3 days ago",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      author: studentProfile.name,
      screenshot: null,
      upvotes: 9,
      assignedTo: "PFMS / NPCI Nodal Cell",
      resolutionNote: "NPCI mapper status synchronized via PFMS bridge. The portal now displays green verified status.",
    },
    {
      id: "SS-8830",
      ticketId: "SS-8830",
      title: "College INO verification pending past 14 days deadline",
      schemeName: "AICTE Pragati Scholarship for Girls",
      category: "College Verification Pending",
      urgency: "Medium",
      location: "College Administrative Block",
      description:
        "Submitted bonafide certificate and 1st year fee receipt on 1st of this month. Institute Nodal Officer has not approved the application on NSP yet.",
      status: "Pending",
      date: "Today, 10:15 AM",
      createdAt: new Date().toISOString(),
      author: studentProfile.name,
      screenshot: null,
      upvotes: 2,
      assignedTo: "Dayananda Sagar College INO Desk",
      resolutionNote: "Ticket assigned to College Principal Desk for scheduled verification batch.",
    },
  ];

  // Fetch tickets from database or load defaults
  const fetchTickets = () => {
    fetch(apiUrl("/api/grievances"))
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
          const formatted = data.tickets.map((t) => ({
            id: t.ticketId,
            ticketId: t.ticketId,
            title: t.problemTitle,
            schemeName: t.schemeName || "General Scholarship",
            category: t.category,
            location: t.location || "Online Portal",
            urgency: t.urgency,
            description: t.description,
            status: t.status === "Submitted" ? "Pending" : t.status,
            date: new Date(t.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            author: t.anonymous ? "Anonymous Student" : studentProfile.name,
            screenshot: t.screenshot,
            upvotes: t.upvotes || 0,
            assignedTo: t.assignedTo || "Scholarship Nodal Helpdesk",
            resolutionNote: t.resolutionNote || "Under investigation by scholarship grievance team.",
          }));
          setTickets(formatted);
        } else {
          setTickets(defaultTickets);
        }
      })
      .catch(() => {
        setTickets(defaultTickets);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle Screenshot Upload & Thumbnail Conversion
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB.");
      return;
    }

    setScreenshotName(file.name);
    setScreenshotSize((file.size / 1024).toFixed(1) + " KB");

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotData(null);
    setScreenshotName("");
    setScreenshotSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemTitle.trim() || !description.trim()) {
      alert("Please provide the problem title and detailed description.");
      return;
    }

    setIsSubmitting(true);
    const generatedTicketId = `SS-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      ticketId: generatedTicketId,
      problemTitle: problemTitle.trim(),
      schemeName: schemeName.trim() || "General Scholarship",
      category: issueCategory,
      urgency,
      location: `${schemeName.trim() || "Scholarship Portal"} Helpdesk`,
      description: description.trim(),
      screenshot: screenshotData,
      anonymous: isAnonymous,
      studentId: isAnonymous ? null : studentProfile.studentId,
      status: "Pending",
      assignedTo: "Scholarship Nodal Grievance Cell",
    };

    try {
      const res = await fetch(apiUrl("/api/grievances"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      const newTicket = {
        id: generatedTicketId,
        ticketId: generatedTicketId,
        title: payload.problemTitle,
        schemeName: payload.schemeName,
        category: payload.category,
        location: payload.location,
        urgency: payload.urgency,
        description: payload.description,
        status: "Pending",
        date: "Just now",
        author: isAnonymous ? "Anonymous Student" : studentProfile.name,
        screenshot: screenshotData,
        upvotes: 0,
        assignedTo: "Scholarship Nodal Grievance Cell",
        resolutionNote: "Grievance ticket created. Assigned to nodal verification desk for resolution.",
      };

      setTickets([newTicket, ...tickets]);
    } catch {
      // Local fallback
      const fallbackTicket = {
        id: generatedTicketId,
        ticketId: generatedTicketId,
        title: payload.problemTitle,
        schemeName: payload.schemeName,
        category: payload.category,
        location: payload.location,
        urgency: payload.urgency,
        description: payload.description,
        status: "Pending",
        date: "Just now",
        author: isAnonymous ? "Anonymous Student" : studentProfile.name,
        screenshot: screenshotData,
        upvotes: 0,
        assignedTo: "Scholarship Nodal Grievance Cell",
        resolutionNote: "Ticket logged into SevaSathi offline helpdesk. Review in progress.",
      };
      setTickets([fallbackTicket, ...tickets]);
    } finally {
      setIsSubmitting(false);
      setProblemTitle("");
      setDescription("");
      removeScreenshot();
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 6000);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await fetch(apiUrl(`/api/grievances/${id}/upvote`), { method: "PATCH" });
    } catch {
      // upvote offline
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      filterStatus === "All" ||
      t.status.toLowerCase().replace(/\s+/g, "") === filterStatus.toLowerCase().replace(/\s+/g, "");

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="scholarshipHelpdeskWrap">
      {/* Page Header */}
      <div className="helpdeskHeaderCard">
        <div className="helpdeskHeaderLeft">
          <div className="helpdeskBadgeRow">
            <span className="helpdeskBadge">
              <ShieldCheck size={14} /> SCHOLARSHIP GRIEVANCE REDRESSAL DESK
            </span>
            <span className="resolutionSpeedTag">Average Resolution: Within 24-48 Hours</span>
          </div>
          <h2>Scholarship Helpdesk / Report Issue</h2>
          <p>
            Encountering errors with portal logins, income certificate uploads, Aadhaar-bank seeding, or college
            attestation? Submit a formal support ticket directly to the nodal scholarship authority.
          </p>
        </div>

        <div className="helpdeskStatsStrip">
          <div className="hStat">
            <strong>{tickets.length}</strong>
            <small>Total Tickets</small>
          </div>
          <div className="hDivider" />
          <div className="hStat">
            <strong className="statusPendingCount">
              {tickets.filter((t) => t.status === "Pending").length}
            </strong>
            <small>Pending</small>
          </div>
          <div className="hDivider" />
          <div className="hStat">
            <strong className="statusResolvedCount">
              {tickets.filter((t) => t.status === "Resolved").length}
            </strong>
            <small>Resolved</small>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="helpdeskLayoutGrid">
        {/* Left Column: Issue Reporting Form */}
        <div className="helpdeskFormCard">
          <div className="formHeader">
            <span className="cardMiniLabel">NEW SUPPORT TICKET</span>
            <h3>Report a Scholarship Problem</h3>
            <p>Fill out the details below. Providing scheme name and error screenshots speeds up resolution.</p>
          </div>

          {submitSuccess && (
            <div className="ticketSuccessAlert">
              <CheckCircle2 size={18} />
              <div>
                <strong>Support Ticket Logged Successfully!</strong>
                <p>Track live progress, officer assignments, and resolution notes in the tracking table on the right.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="ticketForm">
            {/* Issue Category Dropdown */}
            <div className="formGroup">
              <label>Issue Category *</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                required
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Scholarship Scheme Name */}
            <div className="formGroup">
              <label>Scholarship Scheme Name *</label>
              <input
                type="text"
                list="schemesDatalist"
                placeholder="e.g. SSP Karnataka Post-Matric / AICTE Pragati / NSP Central Sector"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                required
              />
              <datalist id="schemesDatalist">
                {COMMON_SCHEMES.map((sch) => (
                  <option key={sch} value={sch} />
                ))}
              </datalist>
            </div>

            {/* Problem Title & Urgency */}
            <div className="formRow">
              <div className="formGroup">
                <label>Problem Summary / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar NPCI error while verifying bank details"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Urgency Level</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="Normal">Normal (Within 48h)</option>
                  <option value="Medium">Medium (Within 24h)</option>
                  <option value="Urgent">Urgent (Portal Closing Soon)</option>
                </select>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="formGroup">
              <label>Detailed Explanation of the Issue *</label>
              <textarea
                rows="4"
                placeholder="Describe what occurred, any error codes shown on screen, application stage, and steps you already tried..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Screenshot Upload Field with Thumbnail Preview */}
            <div className="formGroup">
              <label>Upload Error Screenshot (Optional but recommended)</label>
              <div className="screenshotUploadArea">
                {!screenshotData ? (
                  <label className="uploadDropzone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <UploadCloud size={28} className="uploadIcon" />
                    <div>
                      <strong>Click to upload or drag & drop screenshot</strong>
                      <p>Supports PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                    </div>
                  </label>
                ) : (
                  <div className="screenshotPreviewCard">
                    <img
                      src={screenshotData}
                      alt="Uploaded Screenshot Preview"
                      className="screenshotThumbnail"
                    />
                    <div className="previewDetails">
                      <div className="previewTitleRow">
                        <ImageIcon size={16} />
                        <strong>{screenshotName}</strong>
                      </div>
                      <span className="fileSizeTag">{screenshotSize}</span>
                    </div>
                    <button
                      type="button"
                      className="removeScreenshotBtn"
                      onClick={removeScreenshot}
                      title="Remove attachment"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Student ID & Anonymous Toggle */}
            <div className="formOptionsRow">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Submit as anonymous student (hides name from public list)</span>
              </label>

              <span className="studentIdTag">
                Student ID: <strong>{studentProfile.studentId}</strong>
              </span>
            </div>

            <button type="submit" className="primaryButton fullWidth" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btnLoadingWrap">
                  <RefreshCw size={16} className="spinIcon" /> Submitting Ticket...
                </span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Tracking Table Showing Raised Support Tickets */}
        <div className="helpdeskTrackingCard">
          <div className="trackerCardHeader">
            <div>
              <h3>My Raised Support Tickets</h3>
              <p>Real-time grievance resolution and nodal officer updates.</p>
            </div>

            <button
              type="button"
              className="refreshTicketsBtn"
              onClick={fetchTickets}
              title="Refresh tickets list"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="tableControlsBar">
            <div className="ticketsSearchWrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search ticket #, scheme, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="statusFilterPills">
              {["All", "Pending", "In Progress", "Resolved"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filterPill ${filterStatus === st ? "active" : ""}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Table */}
          <div className="ticketsTableWrapper">
            {filteredTickets.length === 0 ? (
              <div className="emptyTicketsState">
                <FileText size={32} />
                <p>No support tickets found matching your filter.</p>
              </div>
            ) : (
              <table className="ticketsTable">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Scheme & Issue Details</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="ticketRow">
                      <td className="colTicketId">
                        <span className="ticketIdBadge">#{t.ticketId}</span>
                        {t.screenshot && (
                          <span className="hasAttachmentTag" title="Screenshot attached">
                            <ImageIcon size={11} /> Attached
                          </span>
                        )}
                      </td>

                      <td className="colDetails">
                        <div className="ticketSchemeTitle">{t.schemeName}</div>
                        <h4 className="ticketProblemTitle">{t.title}</h4>
                        <div className="ticketSubMeta">
                          <span className="categoryBadge">{t.category}</span>
                          <span className={`urgencyBadge urgency-${t.urgency.toLowerCase()}`}>
                            {t.urgency}
                          </span>
                        </div>
                      </td>

                      <td className="colDate">
                        <span className="ticketDateText">{t.date}</span>
                      </td>

                      <td className="colStatus">
                        <span
                          className={`statusPill status-${t.status.replace(/\s+/g, "").toLowerCase()}`}
                        >
                          {t.status === "Pending" && <Clock size={11} />}
                          {t.status === "In Progress" && <RefreshCw size={11} className="spinIconSlow" />}
                          {t.status === "Resolved" && <CheckCircle2 size={11} />}
                          <span>{t.status}</span>
                        </span>
                      </td>

                      <td className="colAction">
                        <div className="actionButtonsWrap">
                          <button
                            type="button"
                            className="viewDetailsBtn"
                            onClick={() => setSelectedTicketModal(t)}
                            title="View Officer Remarks"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            className="ticketUpvoteBtn"
                            onClick={() => handleUpvote(t.id)}
                            title="Upvote grievance priority"
                          >
                            <ThumbsUp size={12} />
                            <span>{t.upvotes}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details & Nodal Resolution Modal */}
      {selectedTicketModal && (
        <div className="modalOverlay" onClick={() => setSelectedTicketModal(null)}>
          <div className="ticketModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="ticketModalTop">
              <div className="ticketModalBadgeRow">
                <span className="ticketIdLarge">#{selectedTicketModal.ticketId}</span>
                <span
                  className={`statusPill status-${selectedTicketModal.status
                    .replace(/\s+/g, "")
                    .toLowerCase()}`}
                >
                  {selectedTicketModal.status}
                </span>
              </div>
              <button
                type="button"
                className="closeModalBtn"
                onClick={() => setSelectedTicketModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modalBody">
              <span className="modalSchemeTag">{selectedTicketModal.schemeName}</span>
              <h3>{selectedTicketModal.title}</h3>

              <div className="ticketMetaGrid">
                <div>
                  <small>Category</small>
                  <strong>{selectedTicketModal.category}</strong>
                </div>
                <div>
                  <small>Urgency</small>
                  <strong>{selectedTicketModal.urgency}</strong>
                </div>
                <div>
                  <small>Date Logged</small>
                  <strong>{selectedTicketModal.date}</strong>
                </div>
                <div>
                  <small>Assigned Officer / Desk</small>
                  <strong>{selectedTicketModal.assignedTo}</strong>
                </div>
              </div>

              <div className="ticketDescSection">
                <small>Problem Description</small>
                <p>{selectedTicketModal.description}</p>
              </div>

              {selectedTicketModal.screenshot && (
                <div className="ticketAttachedImageWrap">
                  <small>Uploaded Screenshot Evidence</small>
                  <img
                    src={selectedTicketModal.screenshot}
                    alt="Error Screenshot Evidence"
                    className="modalEvidenceImg"
                  />
                </div>
              )}

              <div className="nodalResolutionBox">
                <div className="resolutionBoxHeader">
                  <ShieldCheck size={16} />
                  <strong>Official Nodal Officer Remark</strong>
                </div>
                <p>{selectedTicketModal.resolutionNote}</p>
              </div>
            </div>

            <div className="modalFooterRow">
              <button
                type="button"
                className="modalConfirmBtn"
                onClick={() => setSelectedTicketModal(null)}
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
