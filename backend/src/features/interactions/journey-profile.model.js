import mongoose from "mongoose";
const { Schema } = mongoose;

export const POTENTIAL_STATUSES = ["UNCLASSIFIED", "POTENTIAL", "NON_POTENTIAL"];
export const QUALIFICATION_STATUSES = ["UNQUALIFIED", "QUALIFYING", "QUALIFIED", "DISQUALIFIED"];

const journeyProfileSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true, index: true },
  permanentLeadId: { type: String, required: true, unique: true, index: true },
  potentialStatus: { type: String, enum: POTENTIAL_STATUSES, default: "UNCLASSIFIED" },
  qualificationStatus: { type: String, enum: QUALIFICATION_STATUSES, default: "UNQUALIFIED" },
  painPoints: { type: [String], default: [] },
  businessRequirement: { type: String, trim: true, maxlength: 10000, default: "" },
  decisionContext: { type: String, trim: true, maxlength: 6000, default: "" },
  internalNotes: { type: String, trim: true, maxlength: 8000, default: "" },
  lastC1At: { type: Date, default: null },
  lastC2At: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false, minimize: false });

journeyProfileSchema.index({ qualificationStatus: 1, potentialStatus: 1, updatedAt: -1 }, { name: "journey_qualification" });
const JourneyProfile = mongoose.models.JourneyProfile || mongoose.model("JourneyProfile", journeyProfileSchema);
export default JourneyProfile;
