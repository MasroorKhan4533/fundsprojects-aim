import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import Lead from "../leads/lead.model.js";

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");
const requireLead = async (leadId, actor) => {
  const lead = await Lead.findOne({ _id: leadId, deletedAt: null }).select("permanentLeadId companyName primaryContact assignedTo").lean();
  if (!lead) throw new AppError("Lead not found", { statusCode: 404, code: "LEAD_NOT_FOUND" });
  if (actor.role !== "ADMIN" && String(lead.assignedTo) !== String(actor._id)) throw new AppError("You do not have access to this lead integration", { statusCode: 403, code: "INTEGRATION_FORBIDDEN" });
  return lead;
};

export const getIntegrationCapabilities = () => ({
  fundsMailer: { status: "ADAPTER_READY", mode: "MAILTO_FALLBACK", description: "FundsMailer provider can replace the fallback without changing the I workflow." },
  chatting: { status: "ADAPTER_READY", mode: "WHATSAPP_DEEP_LINK", description: "Chatting/WhatsApp provider boundary is ready." },
  calling: { status: "ADAPTER_READY", mode: "TEL_DEEP_LINK", recordingReady: true, description: "Calling provider can attach recording URLs to interaction records." },
  documents: { status: "LOCAL_PRIVATE_STORAGE", productionProvider: "OBJECT_STORAGE_ADAPTER" },
});

export const launchLeadIntegration = async ({ leadId, channel, subject, message }, actor, context) => {
  const lead = await requireLead(leadId, actor);
  const email = lead.primaryContact?.email || "";
  const phone = normalizePhone(lead.primaryContact?.whatsapp || lead.primaryContact?.mobile);
  let url = "";
  if (channel === "EMAIL") {
    if (!email) throw new AppError("Lead does not have an email address", { statusCode: 422, code: "INTEGRATION_EMAIL_MISSING" });
    const effectiveSubject = subject || `FundsProjects AIM · ${lead.companyName}`;
    url = `mailto:${email}?subject=${encodeURIComponent(effectiveSubject)}&body=${encodeURIComponent(message || "")}`;
  }
  if (channel === "WHATSAPP") {
    if (!phone) throw new AppError("Lead does not have a WhatsApp/mobile number", { statusCode: 422, code: "INTEGRATION_PHONE_MISSING" });
    url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }
  if (channel === "CALL") {
    const raw = lead.primaryContact?.mobile || lead.primaryContact?.whatsapp || "";
    if (!raw) throw new AppError("Lead does not have a callable number", { statusCode: 422, code: "INTEGRATION_PHONE_MISSING" });
    url = `tel:${raw}`;
  }
  await recordAudit({ action: `INTEGRATION.${channel}.LAUNCHED`, actorUserId: actor._id, targetUserId: lead.assignedTo, context, metadata: { leadId, permanentLeadId: lead.permanentLeadId, providerMode: getIntegrationCapabilities()[channel === "EMAIL" ? "fundsMailer" : channel === "WHATSAPP" ? "chatting" : "calling"].mode } });
  return { channel, url, leadId, permanentLeadId: lead.permanentLeadId, recordingReady: channel === "CALL" };
};
