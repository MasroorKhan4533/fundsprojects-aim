import mongoose from "mongoose";
const { Schema } = mongoose;

export const HANDOVER_STATUSES = ["CREATED", "ACKNOWLEDGED", "IN_PROGRESS", "COMPLETED"];

const buildHandoverSchema = new Schema({
  dealId: { type: Schema.Types.ObjectId, ref: "Deal", required: true, unique: true, index: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true, index: true },
  permanentLeadId: { type: String, required: true, unique: true, index: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: HANDOVER_STATUSES, default: "CREATED", index: true },
  finalValue: { type: Number, min: 0, default: 0 },
  finalScope: { type: String, trim: true, maxlength: 14000, default: "" },
  approvedTimeline: { type: String, trim: true, maxlength: 2000, default: "" },
  agreementUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  poUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false });

buildHandoverSchema.index({ assignedTo: 1, status: 1, createdAt: -1 }, { name: "handover_owner_status_created" });
const BuildHandover = mongoose.models.BuildHandover || mongoose.model("BuildHandover", buildHandoverSchema);
export default BuildHandover;
