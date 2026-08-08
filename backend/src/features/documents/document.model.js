import mongoose from "mongoose";
const { Schema } = mongoose;

export const DOCUMENT_CATEGORIES = ["GENERAL", "REQUIREMENT", "PROPOSAL", "QUOTATION", "AGREEMENT", "NDA", "PO", "RECORDING", "OTHER"];

const documentSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
  permanentLeadId: { type: String, required: true, index: true },
  category: { type: String, enum: DOCUMENT_CATEGORIES, default: "GENERAL", index: true },
  originalName: { type: String, required: true, trim: true, maxlength: 500 },
  storageKey: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true, maxlength: 160 },
  size: { type: Number, required: true, min: 1 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false });

documentSchema.index({ leadId: 1, createdAt: -1 }, { name: "document_lead_created" });
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
export default Document;
