import mongoose from "mongoose";
import { USER_ROLES, USER_STATUSES } from "../auth/auth.constants.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userId: { type: String, required: true, trim: true, uppercase: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    designation: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, enum: USER_ROLES, default: "TEAM_MEMBER", required: true },
    status: { type: String, enum: USER_STATUSES, default: "PENDING", required: true },
    passwordHash: { type: String, select: false, default: null },
    tokenVersion: { type: Number, default: 0, min: 0 },
    failedLoginAttempts: { type: Number, default: 0, min: 0, select: false },
    lockedUntil: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: "" },
    activatedAt: { type: Date, default: null },
    disabledAt: { type: Date, default: null },
    disabledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    minimize: false,
    versionKey: false,
  }
);

userSchema.index({ userId: 1 }, { unique: true, name: "user_userId_unique" });
userSchema.index({ email: 1 }, { unique: true, name: "user_email_unique" });
userSchema.index({ mobile: 1 }, { unique: true, name: "user_mobile_unique" });
userSchema.index({ status: 1, createdAt: -1 }, { name: "user_status_createdAt" });
userSchema.index({ role: 1, status: 1 }, { name: "user_role_status" });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
