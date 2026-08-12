import fs from "fs/promises";
import path from "path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import AuditLog from "../src/features/audit/audit-log.model.js";
import Counter from "../src/features/auth/models/counter.model.js";
import OneTimeToken from "../src/features/auth/models/one-time-token.model.js";
import Session from "../src/features/auth/models/session.model.js";
import Deal from "../src/features/deals/deal.model.js";
import BuildHandover from "../src/features/deals/build-handover.model.js";
import Document from "../src/features/documents/document.model.js";
import Interaction from "../src/features/interactions/interaction.model.js";
import JourneyProfile from "../src/features/interactions/journey-profile.model.js";
import LeadAudit from "../src/features/leads/lead-audit.model.js";
import Lead from "../src/features/leads/lead.model.js";
import Target from "../src/features/targets/target.model.js";
import User from "../src/features/users/user.model.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => {
  const { default: mongoose } = await import("mongoose");
  await mongoose.connection.dropDatabase();
  await disconnectDatabase();
  await fs.rm(path.resolve(process.cwd(), "storage"), { recursive: true, force: true });
});
beforeEach(async () => {
  await Promise.all([
    Document.deleteMany({}), BuildHandover.deleteMany({}), Deal.deleteMany({}), Interaction.deleteMany({}), JourneyProfile.deleteMany({}),
    LeadAudit.deleteMany({}), Lead.deleteMany({}), Target.deleteMany({}), User.deleteMany({}), Counter.deleteMany({}),
    OneTimeToken.deleteMany({}), Session.deleteMany({}), AuditLog.deleteMany({}),
  ]);
});

const seedAdmin = async () => User.create({ userId: "FPA-000001", fullName: "Admin User", email: "admin@phase7.test", mobile: "+919999999981", designation: "Administrator", role: "ADMIN", status: "ACTIVE", passwordHash: await hashPassword("Admin@Test123"), activatedAt: new Date() });
const login = (agent, email) => agent.post("/api/v1/auth/login").send({ identifier: email, password: "Admin@Test123" });
const leadBody = (owner) => ({ companyName: "Phase Seven Industries", primaryContact: { fullName: "Phase Seven Contact", email: "phase7@example.com", mobile: "+919999999980", whatsapp: "+919999999980" }, industry: "Manufacturing", assignedTo: String(owner), country: "India", city: "Pune", source: "LinkedIn", salesStage: "C1" });

const createLead = async (agent, owner) => {
  const response = await agent.post("/api/v1/leads").send(leadBody(owner));
  expect(response.status).toBe(201);
  return response.body.data.lead;
};

describe("Phase 7 final localhost hardening", () => {
  it("serves personal performance profile and integration capability boundaries", async () => {
    const admin = await seedAdmin();
    const agent = request.agent(app); await login(agent, admin.email);
    const profile = await agent.get("/api/v1/profile/me");
    expect(profile.status).toBe(200);
    expect(profile.body.data.profile.identity.userId).toBe("FPA-000001");
    expect(profile.body.data.profile.pipeline).toBeDefined();
    expect(profile.body.data.profile.commission).toBeDefined();
    const capabilities = await agent.get("/api/v1/integrations/capabilities");
    expect(capabilities.status).toBe(200);
    expect(capabilities.body.data.capabilities.calling.recordingReady).toBe(true);
  });

  it("previews and commits CSV lead imports with validation and duplicate detection", async () => {
    const admin = await seedAdmin();
    const agent = request.agent(app); await login(agent, admin.email);
    const csv = [
      "Company,Full Name,Designation,Email,Mobile,Industry,City,Lead Priority,Source",
      "Import Valid Pvt Ltd,Rahul Import,Director,rahul.import@example.com,+919999999970,Manufacturing,Pune,High,LinkedIn",
      "Import Invalid Pvt Ltd,,Manager,bad@example.com,+919999999971,Manufacturing,Pune,Medium,LinkedIn",
    ].join("\n");
    const preview = await agent.post("/api/v1/imports/leads/preview").field("assignedTo", String(admin._id)).attach("file", Buffer.from(csv), { filename: "leads.csv", contentType: "text/csv" });
    expect(preview.status).toBe(200);
    expect(preview.body.data.preview.summary.validRows).toBe(1);
    expect(preview.body.data.preview.summary.invalidRows).toBe(1);
    const commit = await agent.post("/api/v1/imports/leads/commit").field("assignedTo", String(admin._id)).attach("file", Buffer.from(csv), { filename: "leads.csv", contentType: "text/csv" });
    expect(commit.status).toBe(201);
    expect(commit.body.data.result.imported).toBe(1);
    expect(await Lead.countDocuments({ companyName: "Import Valid Pvt Ltd" })).toBe(1);
    const duplicate = await agent.post("/api/v1/imports/leads/preview").field("assignedTo", String(admin._id)).attach("file", Buffer.from(csv), { filename: "leads.csv", contentType: "text/csv" });
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.data.preview.summary.duplicateRows).toBe(1);
  });

  it("stores lead documents privately and protects download/list/delete behind lead access", async () => {
    const admin = await seedAdmin();
    const agent = request.agent(app); await login(agent, admin.email);
    const lead = await createLead(agent, admin._id);
    const upload = await agent.post(`/api/v1/documents/leads/${lead.id}`).field("category", "REQUIREMENT").attach("file", Buffer.from("private requirement"), { filename: "requirement.txt", contentType: "text/plain" });
    expect(upload.status).toBe(201);
    const documentId = upload.body.data.document.id;
    const list = await agent.get(`/api/v1/documents/leads/${lead.id}`);
    expect(list.status).toBe(200); expect(list.body.data.documents).toHaveLength(1);
    const download = await agent.get(`/api/v1/documents/${documentId}/download`);
    expect(download.status).toBe(200); expect(download.headers["cache-control"]).toContain("no-store");
    const removed = await agent.delete(`/api/v1/documents/${documentId}`);
    expect(removed.status).toBe(200); expect(await Document.countDocuments({ _id: documentId })).toBe(0);
  });

  it("logs integration launches while keeping FundsMailer/WhatsApp/calling replaceable", async () => {
    const admin = await seedAdmin();
    const agent = request.agent(app); await login(agent, admin.email);
    const lead = await createLead(agent, admin._id);
    const whatsapp = await agent.post(`/api/v1/integrations/leads/${lead.id}/launch`).send({ channel: "WHATSAPP", message: "Hello" });
    expect(whatsapp.status).toBe(200); expect(whatsapp.body.data.launch.url).toContain("wa.me");
    const call = await agent.post(`/api/v1/integrations/leads/${lead.id}/launch`).send({ channel: "CALL" });
    expect(call.status).toBe(200); expect(call.body.data.launch.recordingReady).toBe(true);
    expect(await AuditLog.countDocuments({ action: { $in: ["INTEGRATION.WHATSAPP.LAUNCHED", "INTEGRATION.CALL.LAUNCHED"] } })).toBe(2);
  });
});
