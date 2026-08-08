import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    tokenVersion: { type: Number, required: true, min: 0 },
    rememberMe: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
    ip: { type: String, maxlength: 120, default: "" },
    userAgent: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true, versionKey: false }
);

sessionSchema.index({ tokenHash: 1 }, { unique: true, name: "session_token_hash_unique" });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "session_expiry_ttl" });
sessionSchema.index({ userId: 1, revokedAt: 1 }, { name: "session_user_revoked" });

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
export default Session;
