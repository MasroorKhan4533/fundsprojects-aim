import { readSheet } from "read-excel-file/universal";
import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import Counter from "../auth/models/counter.model.js";
import { recordAudit } from "../audit/audit.service.js";
import Lead, { COMPANY_SIZES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STAGES, LEAD_TEMPERATURES } from "../leads/lead.model.js";
import LeadAudit from "../leads/lead-audit.model.js";
import User from "../users/user.model.js";

const MAX_ROWS = 6000;
const HEADER_ALIASES = {
  companyname: "companyName", company: "companyName",
  fullname: "fullName", contactname: "fullName", name: "fullName",
  designation: "designation", email: "email", mobile: "mobile", contact: "mobile", phone: "mobile",
  whatsapp: "whatsapp", linkedinprofileurl: "linkedinProfileUrl", linkedinprofile: "linkedinProfileUrl",
  industry: "industry", subsector: "subSector", businessmodel: "businessModels", businessmodels: "businessModels",
  companysize: "companySize", employeestrength: "employeeStrength", annualturnover: "annualTurnover", estimatedbudget: "estimatedBudget",
  country: "country", state: "state", city: "city", website: "websiteUrl", websiteurl: "websiteUrl",
  linkedinposturl: "linkedinPostUrl", postdate: "postDate", postcontent: "postContent",
  businessrequirementanalysis: "businessRequirementAnalysis", buyingintentscore: "buyingIntentScore", leadpriority: "leadPriority",
  personalizedcomment: "personalizedComment", connectionfirstmessage: "firstMessage", firstmessage: "firstMessage",
  salesstage: "salesStage", source: "source", leadsource: "source", temperature: "temperature",
  decisionmakers: "decisionMakers", companyoverview: "companyOverview", painpoints: "painPoints", internalcomments: "internalComments",
  nextaction: "nextAction", nextfollowupdate: "nextFollowUpDate", attachmenturl: "attachmentUrl", researchnotes: "researchNotes",
  additionalcontacts: "additionalContacts",
};
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const text = (value) => value === null || value === undefined ? "" : typeof value === "object" && value.text ? String(value.text) : typeof value === "object" && value.result !== undefined ? String(value.result) : String(value).trim();
const splitList = (value) => String(value || "").split(/[;,]/).map((item) => item.trim()).filter(Boolean);
const numberOrZero = (value) => { const n = Number(String(value || "").replace(/[,₹$]/g, "")); return Number.isFinite(n) && n >= 0 ? n : 0; };
const dateOrNull = (value) => { if (!value) return null; const d = value instanceof Date ? value : new Date(value); return Number.isNaN(d.getTime()) ? null : d; };
const cleanPhone = (value) => String(value || "").trim();
const cleanEmail = (value) => String(value || "").trim().toLowerCase();
const normalizedKey = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const parseCsv = (buffer) => {
  const input = buffer.toString("utf8").replace(/^\uFEFF/, "");
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]; const next = input[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === ',' && !quoted) { row.push(cell); cell = ""; continue; }
    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell); cell = ""; if (row.some((value) => String(value).trim())) rows.push(row); row = []; continue;
    }
    cell += ch;
  }
  row.push(cell); if (row.some((value) => String(value).trim())) rows.push(row);
  return rows;
};

const parseXlsx = async (buffer) => {
  try {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const rows = await readSheet(arrayBuffer);
    return rows.map((row) => row.map(text)).filter((row) => row.some((value) => String(value).trim()));
  } catch (error) {
    throw new AppError("Unable to read the XLSX workbook", { statusCode: 422, code: "IMPORT_XLSX_INVALID", cause: error });
  }
};

const parseFile = async (file) => {
  if (!file) throw new AppError("Choose a CSV or XLSX file", { statusCode: 400, code: "IMPORT_FILE_REQUIRED" });
  const name = String(file.originalname || "").toLowerCase();
  const rows = name.endsWith(".xlsx") ? await parseXlsx(file.buffer) : parseCsv(file.buffer);
  if (rows.length < 2) throw new AppError("Import file must contain a header row and at least one data row", { statusCode: 422, code: "IMPORT_EMPTY" });
  if (rows.length - 1 > MAX_ROWS) throw new AppError(`Import is limited to ${MAX_ROWS} rows per file`, { statusCode: 422, code: "IMPORT_TOO_LARGE" });
  return rows;
};

const mapRows = async (file) => {
  const rows = await parseFile(file);
  const headers = rows[0].map((value) => ({ original: text(value), field: HEADER_ALIASES[normalizeHeader(value)] || "" }));
  const recognized = headers.filter((item) => item.field).length;
  if (!recognized) throw new AppError("No recognized lead columns were found", { statusCode: 422, code: "IMPORT_HEADERS_INVALID" });
  return rows.slice(1).map((values, index) => {
    const raw = {};
    headers.forEach((header, column) => { if (header.field) raw[header.field] = text(values[column]); });
    return { rowNumber: index + 2, raw };
  });
};

const parseAdditionalContacts = (value) => String(value || "").split(";").map((block) => block.trim()).filter(Boolean).map((block) => {
  const [fullName = "", designation = "", email = "", mobile = "", whatsapp = ""] = block.split("|").map((item) => item.trim());
  return { fullName, designation, email: cleanEmail(email), mobile: cleanPhone(mobile), whatsapp: cleanPhone(whatsapp), isPrimary: false };
}).filter((item) => item.fullName || item.email || item.mobile);

const validateRow = (item, assignedTo) => {
  const { raw } = item; const errors = [];
  if (!raw.companyName) errors.push("Company is required");
  if (!raw.fullName) errors.push("Full Name is required");
  if (!raw.industry) errors.push("Industry is required");
  if (raw.email && !/^\S+@\S+\.\S+$/.test(raw.email)) errors.push("Email is invalid");
  if (raw.leadPriority && !LEAD_PRIORITIES.includes(raw.leadPriority)) errors.push(`Lead Priority must be one of: ${LEAD_PRIORITIES.join(", ")}`);
  if (raw.temperature && !LEAD_TEMPERATURES.includes(raw.temperature)) errors.push(`Temperature must be one of: ${LEAD_TEMPERATURES.join(", ")}`);
  if (raw.salesStage && !LEAD_STAGES.includes(raw.salesStage)) errors.push(`Sales Stage must be one of: ${LEAD_STAGES.join(", ")}`);
  if (raw.source && !LEAD_SOURCES.includes(raw.source)) errors.push(`Source must be one of: ${LEAD_SOURCES.join(", ")}`);
  if (raw.companySize && !COMPANY_SIZES.includes(raw.companySize)) errors.push(`Company Size must be one of: ${COMPANY_SIZES.join(", ")}`);
  const score = raw.buyingIntentScore ? Number(raw.buyingIntentScore) : 0;
  if (!Number.isFinite(score) || score < 0 || score > 100) errors.push("Buying Intent Score must be between 0 and 100");
  const postDate = dateOrNull(raw.postDate); if (raw.postDate && !postDate) errors.push("Post Date is invalid");
  const nextFollowUpDate = dateOrNull(raw.nextFollowUpDate); if (raw.nextFollowUpDate && !nextFollowUpDate) errors.push("Next Follow-up Date is invalid");
  const lead = {
    companyName: raw.companyName || "",
    primaryContact: { fullName: raw.fullName || "", designation: raw.designation || "", email: cleanEmail(raw.email), mobile: cleanPhone(raw.mobile), whatsapp: cleanPhone(raw.whatsapp), linkedinProfileUrl: raw.linkedinProfileUrl || "" },
    contacts: parseAdditionalContacts(raw.additionalContacts),
    industry: raw.industry || "", subSector: raw.subSector || "", businessModels: splitList(raw.businessModels), companySize: raw.companySize || "", employeeStrength: raw.employeeStrength || "",
    annualTurnover: numberOrZero(raw.annualTurnover), estimatedBudget: numberOrZero(raw.estimatedBudget), country: raw.country || "India", state: raw.state || "", city: raw.city || "",
    websiteUrl: raw.websiteUrl || "", linkedinPostUrl: raw.linkedinPostUrl || "", postDate, postContent: raw.postContent || "", businessRequirementAnalysis: raw.businessRequirementAnalysis || "",
    buyingIntentScore: score || 0, leadPriority: raw.leadPriority || "Medium", personalizedComment: raw.personalizedComment || "", firstMessage: raw.firstMessage || "", salesStage: raw.salesStage || "C1",
    assignedTo, source: raw.source || "LinkedIn", temperature: raw.temperature || "Warm", decisionMakers: raw.decisionMakers || "", companyOverview: raw.companyOverview || "", painPoints: splitList(raw.painPoints), internalComments: raw.internalComments || "", nextAction: raw.nextAction || "", nextFollowUpDate, attachmentUrl: raw.attachmentUrl || "", researchNotes: raw.researchNotes || "",
  };
  return { ...item, errors, lead, signature: `${normalizedKey(lead.companyName)}|${cleanEmail(lead.primaryContact.email)}|${cleanPhone(lead.primaryContact.mobile)}` };
};

const findDuplicates = async (rows) => {
  const emails = [...new Set(rows.map((r) => r.lead.primaryContact.email).filter(Boolean))];
  const mobiles = [...new Set(rows.map((r) => r.lead.primaryContact.mobile).filter(Boolean))];
  const names = [...new Set(rows.map((r) => r.lead.companyName).filter(Boolean))];
  const clauses = [];
  if (emails.length) clauses.push({ "primaryContact.email": mongoose.trusted({ $in: emails }) });
  if (mobiles.length) clauses.push({ "primaryContact.mobile": mongoose.trusted({ $in: mobiles }) });
  if (names.length) clauses.push({ companyName: mongoose.trusted({ $in: names }) });
  const existing = clauses.length ? await Lead.find({ deletedAt: null, $or: clauses }).select("companyName primaryContact.email primaryContact.mobile permanentLeadId").lean() : [];
  const existingEmails = new Set(existing.map((x) => cleanEmail(x.primaryContact?.email)).filter(Boolean));
  const existingMobiles = new Set(existing.map((x) => cleanPhone(x.primaryContact?.mobile)).filter(Boolean));
  const existingCompanies = new Set(existing.map((x) => normalizedKey(x.companyName)));
  const seen = new Set();
  return rows.map((row) => {
    const email = cleanEmail(row.lead.primaryContact.email); const mobile = cleanPhone(row.lead.primaryContact.mobile); const company = normalizedKey(row.lead.companyName);
    const duplicate = seen.has(row.signature) || (email && existingEmails.has(email)) || (mobile && existingMobiles.has(mobile)) || existingCompanies.has(company);
    seen.add(row.signature);
    return { ...row, duplicate };
  });
};

const prepare = async ({ file, assignedTo }) => {
  const owner = await User.findOne({ _id: assignedTo, status: "ACTIVE" }).select("_id userId fullName").lean();
  if (!owner) throw new AppError("Import owner must be an active user", { statusCode: 422, code: "IMPORT_OWNER_INVALID" });
  const mapped = await mapRows(file);
  const validated = mapped.map((item) => validateRow(item, owner._id));
  const withDuplicates = await findDuplicates(validated.filter((item) => !item.errors.length));
  const dupByRow = new Map(withDuplicates.map((item) => [item.rowNumber, item.duplicate]));
  const rows = validated.map((item) => ({ ...item, duplicate: dupByRow.get(item.rowNumber) || false }));
  return { owner, rows };
};

const presentPreview = ({ owner, rows }) => ({
  owner: { id: String(owner._id), userId: owner.userId, fullName: owner.fullName },
  summary: { totalRows: rows.length, validRows: rows.filter((r) => !r.errors.length && !r.duplicate).length, duplicateRows: rows.filter((r) => r.duplicate).length, invalidRows: rows.filter((r) => r.errors.length).length },
  errors: rows.filter((r) => r.errors.length || r.duplicate).slice(0, 300).map((r) => ({ rowNumber: r.rowNumber, companyName: r.lead.companyName, contactName: r.lead.primaryContact.fullName, status: r.duplicate ? "DUPLICATE" : "INVALID", errors: r.duplicate ? ["Potential duplicate lead"] : r.errors })),
  sample: rows.filter((r) => !r.errors.length && !r.duplicate).slice(0, 10).map((r) => ({ rowNumber: r.rowNumber, companyName: r.lead.companyName, fullName: r.lead.primaryContact.fullName, industry: r.lead.industry, city: r.lead.city })),
});

export const previewLeadImport = async ({ file, assignedTo }) => presentPreview(await prepare({ file, assignedTo }));

export const commitLeadImport = async ({ file, assignedTo }, actor, context) => {
  const prepared = await prepare({ file, assignedTo });
  const accepted = prepared.rows.filter((r) => !r.errors.length && !r.duplicate);
  if (!accepted.length) return { ...presentPreview(prepared), imported: 0 };
  const counter = await Counter.findOneAndUpdate({ _id: "lead" }, { $inc: { sequence: accepted.length } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  const first = counter.sequence - accepted.length + 1;
  const docs = accepted.map((row, index) => ({ ...row.lead, permanentLeadId: `AIM-L-${String(first + index).padStart(6, "0")}`, createdBy: actor._id, updatedBy: actor._id }));
  const inserted = await Lead.insertMany(docs, { ordered: true });
  await LeadAudit.insertMany(inserted.map((lead) => ({ leadId: lead._id, permanentLeadId: lead.permanentLeadId, action: "CREATED", actorUserId: actor._id, changes: { import: true, companyName: lead.companyName, assignedTo: String(lead.assignedTo) }, requestId: context.requestId || "", ip: context.ip || "", userAgent: context.userAgent || "" })));
  await recordAudit({ action: "LEAD.IMPORT.COMMITTED", actorUserId: actor._id, targetUserId: prepared.owner._id, context, metadata: { imported: inserted.length, invalid: prepared.rows.filter((r) => r.errors.length).length, duplicates: prepared.rows.filter((r) => r.duplicate).length, fileName: file.originalname } });
  return { ...presentPreview(prepared), imported: inserted.length };
};
