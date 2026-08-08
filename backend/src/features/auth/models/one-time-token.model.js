import mongoose from "mongoose";
import { TOKEN_PURPOSES } from "../auth.constants.js";

const oneTimeTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purpose: { type: String, enum: TOKEN_PURPOSES, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

oneTimeTokenSchema.index({ tokenHash: 1 }, { unique: true, name: "one_time_token_hash_unique" });
oneTimeTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "one_time_token_expiry_ttl" });
oneTimeTokenSchema.index({ userId: 1, purpose: 1, usedAt: 1 }, { name: "one_time_token_user_purpose" });

const OneTimeToken = mongoose.models.OneTimeToken || mongoose.model("OneTimeToken", oneTimeTokenSchema);
export default OneTimeToken;
