import mongoose from "mongoose";
const { Schema } = mongoose;
const leadAuditSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
  permanentLeadId: { type: String, required: true, index: true },
  action: { type: String, enum: ["CREATED", "UPDATED", "SOFT_DELETED", "RESTORED"], required: true },
  actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  changes: { type: Schema.Types.Mixed, default: {} },
  requestId: { type: String, default: "" },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, minimize: false });
leadAuditSchema.index({ leadId: 1, createdAt: -1 }, { name: "lead_audit_lead_created" });
const LeadAudit = mongoose.models.LeadAudit || mongoose.model("LeadAudit", leadAuditSchema);
export default LeadAudit;
