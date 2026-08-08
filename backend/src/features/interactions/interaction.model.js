import mongoose from "mongoose";

const { Schema } = mongoose;

export const INTERACTION_STAGES = ["C1", "C2"];
export const INTERACTION_CHANNELS = ["EMAIL", "WHATSAPP", "CALL", "ONLINE_MEETING", "OFFLINE_MEETING", "OTHER"];
export const INTERACTION_RESPONSES = ["POSITIVE", "NEUTRAL", "NEGATIVE", "NO_RESPONSE", "FOLLOW_UP_REQUIRED"];
export const INTERACTION_OUTCOMES = ["STAY", "MOVE_TO_C2", "MOVE_TO_C3", "LOST"];
export const RESOURCE_STATUSES = ["NOT_STARTED", "PLANNED", "SHARED", "COMPLETED", "NOT_REQUIRED"];

const resourceSchema = new Schema({
  status: { type: String, enum: RESOURCE_STATUSES, default: "NOT_STARTED" },
  url: { type: String, trim: true, maxlength: 1200, default: "" },
}, { _id: false, versionKey: false });

const interactionSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
  permanentLeadId: { type: String, required: true, index: true },
  stage: { type: String, enum: INTERACTION_STAGES, required: true, index: true },
  channel: { type: String, enum: INTERACTION_CHANNELS, required: true, index: true },
  occurredAt: { type: Date, required: true, default: Date.now, index: true },
  response: { type: String, enum: INTERACTION_RESPONSES, default: "NO_RESPONSE" },
  outcome: { type: String, enum: INTERACTION_OUTCOMES, default: "STAY" },
  content: { type: String, trim: true, maxlength: 8000, default: "" },
  clientResponse: { type: String, trim: true, maxlength: 6000, default: "" },
  agenda: { type: String, trim: true, maxlength: 3000, default: "" },
  recordingUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  meetingMode: { type: String, trim: true, maxlength: 120, default: "" },
  nextAction: { type: String, trim: true, maxlength: 1200, default: "" },
  nextFollowUpDate: { type: Date, default: null, index: true },
  presentation: { type: resourceSchema, default: () => ({}) },
  demo: { type: resourceSchema, default: () => ({}) },
  requirementDocument: { type: resourceSchema, default: () => ({}) },
  costingDocument: { type: resourceSchema, default: () => ({}) },
  versionLabel: { type: String, trim: true, maxlength: 120, default: "" },
  attachmentUrl: { type: String, trim: true, maxlength: 1200, default: "" },
  c1: {
    understanding: { type: String, trim: true, maxlength: 6000, default: "" },
    requirement: { type: String, trim: true, maxlength: 6000, default: "" },
  },
  c2: {
    workflow: { type: String, trim: true, maxlength: 8000, default: "" },
    mustHave: { type: String, trim: true, maxlength: 6000, default: "" },
    goodToHave: { type: String, trim: true, maxlength: 6000, default: "" },
    exclusions: { type: String, trim: true, maxlength: 6000, default: "" },
    reports: { type: String, trim: true, maxlength: 6000, default: "" },
    integrations: { type: String, trim: true, maxlength: 6000, default: "" },
    feedback: { type: String, trim: true, maxlength: 6000, default: "" },
  },
  actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true, versionKey: false, minimize: false });

interactionSchema.index({ leadId: 1, occurredAt: -1 }, { name: "interaction_lead_timeline" });
interactionSchema.index({ actorUserId: 1, occurredAt: -1 }, { name: "interaction_actor_timeline" });
interactionSchema.index({ stage: 1, channel: 1, occurredAt: -1 }, { name: "interaction_stage_channel" });
interactionSchema.index({ nextFollowUpDate: 1, stage: 1 }, { name: "interaction_followup_stage" });

const Interaction = mongoose.models.Interaction || mongoose.model("Interaction", interactionSchema);
export default Interaction;
