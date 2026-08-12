import mongoose from "mongoose";

const { Schema } = mongoose;

export const DEAL_STATUSES = ["ACTIVE", "WON", "LOST", "ON_HOLD", "CANCELLED"];
export const PAYMENT_STATUSES = ["PENDING", "PARTIAL", "RECEIVED"];
export const PROPOSAL_STATUSES = ["PENDING", "PREPARED", "SHARED", "FEEDBACK_RECEIVED", "REVISION_REQUIRED", "ACCEPTED", "REJECTED"];
export const VERSION_LABELS = ["V1", "V2", "V3"];
export const FINAL_VERSION_LABELS = ["V1", "V2", "V3", "CUSTOM"];

const versionSchema = new Schema({
  label: { type: String, enum: VERSION_LABELS, required: true },
  modules: { type: String, trim: true, maxlength: 12000, default: "" },
  timeline: { type: String, trim: true, maxlength: 1200, default: "" },
  cost: { type: Number, min: 0, default: 0 },
}, { _id: false, versionKey: false });

const dealSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true, index: true },
  permanentLeadId: { type: String, required: true, unique: true, index: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  stage: { type: String, enum: ["C3", "C4"], default: "C3", index: true },

  budget: { type: Number, min: 0, default: 0 },
  probability: { type: Number, min: 0, max: 100, default: 0 },
  expectedClose: { type: Date, default: null, index: true },
  versions: { type: [versionSchema], default: () => VERSION_LABELS.map((label) => ({ label })) },
  preferredVersion: { type: String, enum: ["", ...FINAL_VERSION_LABELS], default: "" },
  proposalVersion: { type: String, enum: ["", ...FINAL_VERSION_LABELS], default: "" },
  proposalStatus: { type: String, enum: PROPOSAL_STATUSES, default: "PENDING", index: true },
  proposalUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  quotationUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  negotiationNotes: { type: String, trim: true, maxlength: 10000, default: "" },
  c3At: { type: Date, default: null, index: true },

  finalVersion: { type: String, enum: ["", ...FINAL_VERSION_LABELS], default: "" },
  finalValue: { type: Number, min: 0, default: 0 },
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },
  advanceAmount: { type: Number, min: 0, default: 0 },
  paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "PENDING" },
  dealStatus: { type: String, enum: DEAL_STATUSES, default: "ACTIVE", index: true },
  finalScope: { type: String, trim: true, maxlength: 14000, default: "" },
  paymentTerms: { type: String, trim: true, maxlength: 8000, default: "" },
  agreementUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  ndaUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  poUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  agreementFileName: { type: String, trim: true, maxlength: 500, default: "" },
  customCommissionPercent: { type: Number, min: 0, max: 100, default: 0 },
  payoutStart: { type: Date, default: null },
  payoutMonths: { type: Number, min: 0, max: 120, default: 0 },
  approvedTimeline: { type: String, trim: true, maxlength: 2000, default: "" },
  closureNotes: { type: String, trim: true, maxlength: 10000, default: "" },
  c4At: { type: Date, default: null, index: true },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false, minimize: false });

dealSchema.index({ assignedTo: 1, dealStatus: 1, updatedAt: -1 }, { name: "deal_owner_status_updated" });
dealSchema.index({ assignedTo: 1, expectedClose: 1 }, { name: "deal_owner_expected_close" });
dealSchema.index({ proposalStatus: 1, updatedAt: -1 }, { name: "deal_proposal_status" });
dealSchema.index({ c3At: -1, c4At: -1 }, { name: "deal_stage_dates" });

const Deal = mongoose.models.Deal || mongoose.model("Deal", dealSchema);
export default Deal;
