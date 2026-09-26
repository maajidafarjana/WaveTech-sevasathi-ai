import React from "react";
import {
  X,
  ExternalLink,
  Calendar,
  DollarSign,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  Sparkles,
  Share2,
  Bookmark
} from "lucide-react";

export default function ScholarshipModal({ scholarship, onClose, onAskAI }) {
  if (!scholarship) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scholarship.name,
        text: `Check out the ${scholarship.name} on SevaSathi AI! Grant: ${scholarship.amount}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `${scholarship.name} - Grant: ${scholarship.amount}. Check details at ${scholarship.officialUrl}`
      );
      alert("Scholarship link copied to clipboard!");
    }
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="scholarshipModal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modalHeader">
          <div className="modalHeaderTop">
            <span className="modalOrgBadge">
              <Building size={14} />
              {scholarship.organization || scholarship.provider}
            </span>
            <div className="modalHeaderActions">
              <button 
                className="iconActionBtn" 
                onClick={handleShare} 
                title="Share Scholarship"
              >
                <Share2 size={16} />
              </button>
              <button 
                className="closeModalBtn" 
                onClick={onClose}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <h2 className="modalTitle">{scholarship.name}</h2>
          
          <div className="modalKeyMeta">
            <div className="metaPill highlight">
              <DollarSign size={15} />
              <span>{scholarship.amount}</span>
            </div>
            <div className="metaPill">
              <Calendar size={15} />
              <span>Deadline: {scholarship.deadline} ({scholarship.daysLeft} days left)</span>
            </div>
            {scholarship.matchScore && (
              <div className="metaPill match">
                <Sparkles size={15} />
                <span>{scholarship.matchScore}% Eligibility Match</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modalBody">
          
          {/* Description */}
          <div className="modalSection">
            <h3>Overview</h3>
            <p className="modalDescText">{scholarship.description}</p>
          </div>

          {/* Why You Qualify (if computed) */}
          {scholarship.qualifyReasons && scholarship.qualifyReasons.length > 0 && (
            <div className="modalSection qualifySection">
              <h3>
                <CheckCircle2 size={18} className="textSuccess" />
                Why You Qualify
              </h3>
              <ul className="qualifyList">
                {scholarship.qualifyReasons.map((reason, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={14} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Eligibility Rules */}
          <div className="modalSection">
            <h3>Eligibility Requirements</h3>
            <div className="rulesGrid">
              <div className="ruleCard">
                <span className="ruleLabel">Max Family Income</span>
                <strong>₹{scholarship.maxIncome?.toLocaleString('en-IN') || "N/A"} / year</strong>
              </div>
              <div className="ruleCard">
                <span className="ruleLabel">Eligible Genders</span>
                <strong>{scholarship.allowedGenders?.join(", ") || "All"}</strong>
              </div>
              <div className="ruleCard">
                <span className="ruleLabel">State Domicile</span>
                <strong>{scholarship.allowedStates?.join(", ") || "All India"}</strong>
              </div>
              <div className="ruleCard">
                <span className="ruleLabel">Covered Courses</span>
                <strong>{scholarship.courses?.slice(0, 4).join(", ") || "Degree / Diploma"}</strong>
              </div>
            </div>
          </div>

          {/* Step by Step Application Guide */}
          <div className="modalSection">
            <h3>
              <GraduationCap size={18} className="textPrimary" />
              Step-by-Step How to Apply
            </h3>
            <div className="stepsTimeline">
              {scholarship.applicationSteps ? (
                scholarship.applicationSteps.map((step, idx) => (
                  <div className="timelineStep" key={idx}>
                    <div className="stepNumber">{idx + 1}</div>
                    <div className="stepContent">
                      <p>{step}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="timelineStep">
                  <div className="stepNumber">1</div>
                  <div className="stepContent">
                    <p>Visit the official portal and complete One-Time Registration (OTR) with your Aadhaar.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="modalSection">
            <h3>
              <FileCheck size={18} className="textWarning" />
              Mandatory Documents to Keep Ready
            </h3>
            <div className="docsChecklist">
              {(scholarship.documents || [
                "Aadhaar Number (seeded with active Bank Account)",
                "Current Academic Year Fee Receipt & College ID",
                "Income Certificate issued by Tahsildar / Revenue Authority",
                "Caste / Category Certificate (if applicable)",
                "Previous year marksheets (10th/12th/Semester)"
              ]).map((doc, idx) => (
                <div className="docItem" key={idx}>
                  <div className="docBullet">✓</div>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Alert */}
          <div className="modalNoticeAlert">
            <AlertTriangle size={18} />
            <div>
              <strong>Important Pro-Tip to Avoid Rejection:</strong>
              <p>Ensure your bank account is seeded with NPCI / Aadhaar Direct Benefit Transfer (DBT). 90% of scholarship disbursement failures in India happen due to unseeded bank accounts!</p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modalFooter">
          <button 
            className="secondaryModalBtn"
            onClick={() => {
              onClose();
              if (onAskAI) onAskAI(scholarship);
            }}
          >
            <Sparkles size={16} />
            Ask SevaSathi AI
          </button>

          <a 
            href={scholarship.officialUrl || scholarship.url}
            target="_blank"
            rel="noopener noreferrer"
            className="primaryModalBtn"
          >
            <span>Apply on Official Portal</span>
            <ExternalLink size={16} />
          </a>
        </div>

      </div>
    </div>
  );
}
