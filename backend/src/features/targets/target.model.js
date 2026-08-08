import mongoose from "mongoose";

const { Schema } = mongoose;

export const TARGET_FOCUS_STAGES = ["Overall", "C1", "C2", "C3", "C4"];

const metricsSchema = new Schema(
  {
    leads: { type: Number, min: 0, default: 0 },
    emails: { type: Number, min: 0, default: 0 },
    messages: { type: Number, min: 0, default: 0 },
    calls: { type: Number, min: 0, default: 0 },
    meetings: { type: Number, min: 0, default: 0 },
    c1: { type: Number, min: 0, default: 0 },
    c2: { type: Number, min: 0, default: 0 },
    c3: { type: Number, min: 0, default: 0 },
    c4: { type: Number, min: 0, default: 0 },
    proposals: { type: Number, min: 0, default: 0 },
    revenue: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const targetSchema = new Schema(
  {
    targetDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    focusStage: { type: String, enum: TARGET_FOCUS_STAGES, default: "Overall", required: true },
    metrics: { type: metricsSchema, default: () => ({}) },
    notes: { type: String, trim: true, maxlength: 1500, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false, minimize: false }
);

targetSchema.index({ assignedTo: 1, targetDate: -1 }, { name: "target_assignee_date" });
targetSchema.index({ targetDate: -1, focusStage: 1 }, { name: "target_date_focus" });
targetSchema.index(
  { assignedTo: 1, targetDate: 1, focusStage: 1 },
  { unique: true, name: "target_assignee_date_focus_unique" }
);

const Target = mongoose.models.Target || mongoose.model("Target", targetSchema);
export default Target;
