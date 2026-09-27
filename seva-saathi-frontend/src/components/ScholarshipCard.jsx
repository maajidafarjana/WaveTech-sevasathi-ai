import React from "react";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Clock,
  Building,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

/**
 * Normalizes verbose qualification sentences into concise, punchy tags.
 * e.g., "Income ₹2,00,000 within limit of ₹6,00,000" -> "Income Criteria Met"
 */
function normalizeQualifyReason(reason) {
  if (!reason || typeof reason !== "string") return "";
  const lower = reason.toLowerCase();

  if (lower.includes("income") || lower.includes("financial")) {
    const match = reason.match(/₹[0-9,]+/g);
    if (match && match.length > 0) {
      return `Income Criteria Met (${match[match.length - 1]} cap)`;
    }
    return "Income Criteria Met";
  }
  if (lower.includes("course") || lower.includes("program")) {
    const match = reason.match(/\(([A-Za-z0-9.+/ ]+)\)/);
    if (match) {
      return `Course Eligible (${match[1]})`;
    }
    return "Course Eligible";
  }
  if (lower.includes("female") || lower.includes("girl") || lower.includes("women")) {
    return "Girls Candidate Priority";
  }
  if (lower.includes("category") || lower.includes("caste")) {
    const match = reason.match(/['"]([A-Za-z0-9 -]+)['"]/);
    if (match) {
      return `Category Verified (${match[1]})`;
    }
    return "Category Verified";
  }
  if (lower.includes("state") || lower.includes("domicile")) {
    const match = reason.match(/(Karnataka|Maharashtra|Kerala|Tamil Nadu|Delhi|All India)/i);
    if (match) {
      return `${match[1]} Domicile`;
    }
    return "State Domicile Eligible";
  }
  if (lower.includes("score") || lower.includes("percentage") || lower.includes("marks")) {
    const match = reason.match(/([0-9]{1,2}%)/);
    if (match) {
      return `Merit Score Met (${match[1]})`;
    }
    return "Merit Score Met";
  }
  if (lower.includes("specially-abled") || lower.includes("disability")) {
    return "Specially-Abled Benefit";
  }

  // Shorten general text if longer than 38 characters
  if (reason.length > 38) {
    return reason.slice(0, 36) + "…";
  }
  return reason;
}

export default function ScholarshipCard({
  scholarship,
  onOpenModal,
  onApply
}) {
  if (!scholarship) return null;

  const {
    id,
    name = "Scholarship Opportunity",
    provider = scholarship.provider || scholarship.organization || "Official Scholarship Authority",
    amount = "Scholarship Grant",
    deadline = "Applications Open",
    daysLeft,
    officialLink = scholarship.officialLink || scholarship.officialUrl || scholarship.url || "#",
    qualifyReasons = [],
    matchScore,
    isEligible = true,
    tags = []
  } = scholarship;

  // Process qualify reasons into concise tags
  let tagsList = [];
  if (qualifyReasons && qualifyReasons.length > 0) {
    tagsList = qualifyReasons.map(normalizeQualifyReason).filter(Boolean).slice(0, 3);
  }
  if (tagsList.length === 0) {
    if (scholarship.eligibility) {
      const elig = scholarship.eligibility;
      if (elig.maxFamilyIncome) tagsList.push(`Income ≤ ₹${(elig.maxFamilyIncome / 100000).toFixed(1)} LPA`);
      if (elig.minPercentage) tagsList.push(`Min ${elig.minPercentage}% Marks`);
      if (elig.gender && elig.gender !== "All") tagsList.push(`${elig.gender} Students`);
      if (elig.state && !elig.state.includes("All India")) tagsList.push(`${elig.state[0]} Domicile`);
    } else if (tags && tags.length > 0) {
      tagsList = tags.slice(0, 3);
    }
  }
  if (tagsList.length === 0) {
    tagsList = ["Income Criteria Met", "Course Eligible", "Verified Scheme"];
  }

  // Determine deadline urgency
  const isUrgent = typeof daysLeft === "number" && daysLeft <= 20;

  return (
    <div className={`scholarshipDashboardCard ${isEligible ? "eligibleCard" : ""}`}>
      {/* Top Bar: Provider & Match Score */}
      <div className="cardHeaderMeta">
        <div className="providerBadge" title={provider}>
          <Building size={13} className="providerIcon" />
          <span className="providerName">{provider}</span>
        </div>

        {matchScore && (
          <div className={`matchTag ${matchScore >= 80 ? "highMatch" : "normalMatch"}`}>
            <Sparkles size={12} />
            <span>{matchScore}% Match</span>
          </div>
        )}
      </div>

      {/* Main Title */}
      <h3 className="scholarshipTitle" title={name}>
        {name}
      </h3>

      {/* Badges Strip: Award Amount & Deadline */}
      <div className="cardMetricsRow">
        <div className="awardAmountBadge" title={`Award: ${amount}`}>
          <DollarSign size={15} className="metricIcon green" />
          <div className="metricTexts">
            <span className="metricLabel">Award Amount</span>
            <strong className="metricValue">{amount}</strong>
          </div>
        </div>

        <div className={`deadlineBadge ${isUrgent ? "urgentDeadline" : ""}`} title={`Deadline: ${deadline}`}>
          {isUrgent ? (
            <Clock size={14} className="metricIcon amber" />
          ) : (
            <Calendar size={14} className="metricIcon amber" />
          )}
          <div className="metricTexts">
            <span className="metricLabel">Deadline</span>
            <strong className="metricValue">
              {deadline}
              {typeof daysLeft === "number" && daysLeft > 0 ? ` (${daysLeft}d left)` : ""}
            </strong>
          </div>
        </div>
      </div>

      {/* Tailored Match Reasoning (Concise Tag Chips) */}
      <div className="matchReasonsSection">
        <span className="reasonsTitle">Why You Qualify:</span>
        <div className="qualifyTagsRow">
          {tagsList.map((tagText, idx) => (
            <span key={idx} className="qualifyTagItem">
              <CheckCircle2 size={12} className="tagCheckIcon" />
              <span>{tagText}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Action Links & Buttons */}
      <div className="cardActionsFooter">
        {onOpenModal && (
          <button
            type="button"
            className="detailsModalBtn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(scholarship);
            }}
          >
            <span>Steps & Documents</span>
            <ChevronRight size={14} />
          </button>
        )}

        <a
          href={officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="applyNowBtn"
          onClick={(e) => {
            e.stopPropagation();
            if (onApply) onApply(scholarship);
          }}
          title={`Open official portal for ${name}`}
        >
          <span>Apply Now</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
