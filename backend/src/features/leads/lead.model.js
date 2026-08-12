import mongoose from "mongoose";

const { Schema } = mongoose;

export const LEAD_STAGES = ["C1", "C2", "C3", "C4", "Won", "Lost"];
export const LEAD_PRIORITIES = ["High", "Medium", "Low"];
export const LEAD_TEMPERATURES = ["Hot", "Warm", "Potential", "Cold"];
export const LEAD_SOURCES = ["LinkedIn", "Apollo", "Referral", "Website", "Event", "Cold Call", "Upwork", "Fiverr", "Google", "Advertisement", "Datapoint", "Other"];
export const COMPANY_SIZES = ["Micro", "Small", "Medium", "Large", "Enterprise"];
export const FOLLOW_UP_STATUSES = ["Pending", "Completed", "Skipped"];

const contactSchema = new Schema({
  fullName: { type: String, trim: true, maxlength: 160, default: "" },
  designation: { type: String, trim: true, maxlength: 160, default: "" },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  mobile: { type: String, trim: true, maxlength: 32, default: "" },
  whatsapp: { type: String, trim: true, maxlength: 32, default: "" },
  linkedinProfileUrl: { type: String, trim: true, maxlength: 800, default: "" },
  isPrimary: { type: Boolean, default: false },
}, { _id: true, versionKey: false });

const followUpSchema = new Schema({
  sequence: { type: Number, min: 1, max: 3, required: true },
  scheduledAt: { type: Date, default: null },
  status: { type: String, enum: FOLLOW_UP_STATUSES, default: "Pending" },
  note: { type: String, trim: true, maxlength: 1000, default: "" },
}, { _id: false, versionKey: false });

const leadSchema = new Schema({
  permanentLeadId: { type: String, required: true, unique: true, immutable: true, index: true },
  companyName: { type: String, required: true, trim: true, maxlength: 220 },
  primaryContact: {
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    designation: { type: String, trim: true, maxlength: 160, default: "" },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    mobile: { type: String, trim: true, maxlength: 32, default: "" },
    whatsapp: { type: String, trim: true, maxlength: 32, default: "" },
    linkedinProfileUrl: { type: String, trim: true, maxlength: 800, default: "" },
  },
  contacts: { type: [contactSchema], default: [] },
  industry: { type: String, required: true, trim: true, maxlength: 160 },
  subSector: { type: String, trim: true, maxlength: 160, default: "" },
  businessModels: { type: [String], default: [] },
  companySize: { type: String, enum: ["", ...COMPANY_SIZES], default: "" },
  employeeStrength: { type: String, trim: true, maxlength: 80, default: "" },
  annualTurnover: { type: Number, min: 0, default: 0 },
  estimatedBudget: { type: Number, min: 0, default: 0 },
  country: { type: String, trim: true, maxlength: 120, default: "India" },
  state: { type: String, trim: true, maxlength: 120, default: "" },
  city: { type: String, trim: true, maxlength: 120, default: "" },
  websiteUrl: { type: String, trim: true, maxlength: 800, default: "" },
  linkedinPostUrl: { type: String, trim: true, maxlength: 800, default: "" },
  postDate: { type: Date, default: null },
  postContent: { type: String, trim: true, maxlength: 6000, default: "" },
  businessRequirementAnalysis: { type: String, trim: true, maxlength: 6000, default: "" },
  buyingIntentScore: { type: Number, min: 0, max: 100, default: 0 },
  leadPriority: { type: String, enum: LEAD_PRIORITIES, default: "Medium" },
  personalizedComment: { type: String, trim: true, maxlength: 3000, default: "" },
  firstMessage: { type: String, trim: true, maxlength: 4000, default: "" },
  followUps: { type: [followUpSchema], default: [] },
  salesStage: { type: String, enum: LEAD_STAGES, default: "C1" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, enum: LEAD_SOURCES, default: "LinkedIn" },
  temperature: { type: String, enum: LEAD_TEMPERATURES, default: "Warm" },
  decisionMakers: { type: String, trim: true, maxlength: 3000, default: "" },
  companyOverview: { type: String, trim: true, maxlength: 6000, default: "" },
  painPoints: { type: [String], default: [] },
  internalComments: { type: String, trim: true, maxlength: 6000, default: "" },
  nextAction: { type: String, trim: true, maxlength: 1200, default: "" },
  nextFollowUpDate: { type: Date, default: null },
  attachmentUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  researchNotes: { type: String, trim: true, maxlength: 6000, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deletedAt: { type: Date, default: null, index: true },
  deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, versionKey: false, minimize: false });

leadSchema.index({ deletedAt: 1, assignedTo: 1, updatedAt: -1 }, { name: "lead_active_owner_updated" });
leadSchema.index({ deletedAt: 1, salesStage: 1, leadPriority: 1, updatedAt: -1 }, { name: "lead_active_stage_priority" });
leadSchema.index({ deletedAt: 1, industry: 1, city: 1, updatedAt: -1 }, { name: "lead_active_industry_city" });
leadSchema.index({ deletedAt: 1, nextFollowUpDate: 1 }, { name: "lead_active_followup" });
leadSchema.index({ deletedAt: 1, createdAt: -1 }, { name: "lead_active_created" });
leadSchema.index({ companyName: "text", "primaryContact.fullName": "text", industry: "text", subSector: "text", city: "text", internalComments: "text" }, { name: "lead_text_search", weights: { companyName: 10, "primaryContact.fullName": 8, industry: 5, subSector: 4, city: 3, internalComments: 1 } });

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
