const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    problemTitle: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
    },
    schemeName: {
      type: String,
      trim: true,
      default: "General / Not Specified",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Portal Login Error",
        "Income/Caste Certificate Upload Failure",
        "Aadhaar-Bank Seeding Mismatch",
        "College Verification Pending",
        "Name Mismatch",
        "Application Form Submission Error",
        "Payment / DBT Disbursement Issue",
        "Scholarship Desk",
        "Wi-Fi & Internet",
        "Hostel & Mess",
        "Classroom & Labs",
        "Sanitation & Water",
        "Campus Safety",
        "Other",
      ],
      default: "Portal Login Error",
    },
    urgency: {
      type: String,
      required: true,
      enum: ["Normal", "Medium", "Urgent", "High"],
      default: "Medium",
    },
    location: {
      type: String,
      trim: true,
      default: "Scholarship Portal / Online",
    },
    description: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true,
    },
    screenshot: {
      type: String,
      default: null,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Submitted", "Under Review", "Technician Dispatched"],
      default: "Pending",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "Scholarship Nodal Helpdesk",
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    // Auto manages createdAt and updatedAt
    timestamps: true,
    // Explicitly specify the collection name in SevaSaathi database
    collection: "grievances",
  }
);

module.exports = mongoose.model("Grievance", grievanceSchema);
