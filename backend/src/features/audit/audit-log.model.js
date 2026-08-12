import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true, maxlength: 160 },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestId: { type: String, trim: true, maxlength: 120, default: "" },
    ip: { type: String, trim: true, maxlength: 120, default: "" },
    userAgent: { type: String, trim: true, maxlength: 500, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

auditLogSchema.index({ action: 1, createdAt: -1 }, { name: "audit_action_createdAt" });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 }, { name: "audit_target_createdAt" });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 }, { name: "audit_actor_createdAt" });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
