import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import AuditLog from "../src/features/audit/audit-log.model.js";
import Counter from "../src/features/auth/models/counter.model.js";
import OneTimeToken from "../src/features/auth/models/one-time-token.model.js";
import Session from "../src/features/auth/models/session.model.js";
import LeadAudit from "../src/features/leads/lead-audit.model.js";
import Lead from "../src/features/leads/lead.model.js";
import Target from "../src/features/targets/target.model.js";
import User from "../src/features/users/user.model.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => { const { default: mongoose } = await import("mongoose"); await mongoose.connection.dropDatabase(); await disconnectDatabase(); });
beforeEach(async () => { await Promise.all([User.deleteMany({}), Lead.deleteMany({}), LeadAudit.deleteMany({}), Target.deleteMany({}), Counter.deleteMany({}), OneTimeToken.deleteMany({}), Session.deleteMany({}), AuditLog.deleteMany({})]); });

const seedUser = async ({ id, email, mobile, role = "TEAM_MEMBER" }) => User.create({ userId: id, fullName: role === "ADMIN" ? "Admin User" : `Member ${id}`, email, mobile, designation: role === "ADMIN" ? "Administrator" : "Project Manager", role, status: "ACTIVE", passwordHash: await hashPassword(role === "ADMIN" ? "Admin@Test123" : "Member@Test123"), activatedAt: new Date() });
const login = (agent, identifier, password) => agent.post("/api/v1/auth/login").send({ identifier, password });
const leadPayload = (assignedTo, companyName = "Acme Manufacturing") => ({
  companyName,
  primaryContact: { fullName: "Ravi Sharma", designation: "Director", email: `${companyName.toLowerCase().replace(/\W/g, "")}@example.com`, mobile: "+919876543210", whatsapp: "+919876543210", linkedinProfileUrl: "" },
  industry: "Manufacturing",
  subSector: "Industrial Equipment",
  businessModels: ["B2B", "Manufacturer"],
  companySize: "Medium",
  employeeStrength: "51–200",
  estimatedBudget: 750000,
  country: "India",
  state: "Maharashtra",
  city: "Pune",
  source: "LinkedIn",
  temperature: "Hot",
  leadPriority: "High",
  buyingIntentScore: 82,
  salesStage: "C1",
  assignedTo: String(assignedTo),
  painPoints: ["Manual reporting", "Disconnected systems"],
  nextAction: "Schedule discovery call",
  nextFollowUpDate: "2026-08-10T10:30:00.000Z",
});

describe("A master leads", () => {
  it("creates permanent lead IDs and supports server-side listing, search and summary", async () => {
    const admin = await seedUser({ id: "FPA-000001", email: "admin@lead.test", mobile: "+919999999991", role: "ADMIN" });
    const member = await seedUser({ id: "FPA-000002", email: "member@lead.test", mobile: "+919999999992" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");

    const first = await agent.post("/api/v1/leads").send(leadPayload(member._id, "Acme Manufacturing"));
    const second = await agent.post("/api/v1/leads").send(leadPayload(member._id, "Beta Engineering"));
    expect(first.status).toBe(201); expect(second.status).toBe(201);
    expect(first.body.data.lead.permanentLeadId).toBe("AIM-L-000001");
    expect(second.body.data.lead.permanentLeadId).toBe("AIM-L-000002");

    const listed = await agent.get("/api/v1/leads?page=1&limit=1&search=Acme&sortBy=companyName&sortOrder=asc");
    expect(listed.status).toBe(200); expect(listed.body.meta.total).toBe(1); expect(listed.body.data[0].companyName).toBe("Acme Manufacturing");

    const summary = await agent.get(`/api/v1/leads/summary?assignedTo=${member._id}`);
    expect(summary.status).toBe(200); expect(summary.body.data.summary.total).toBe(2); expect(summary.body.data.summary.estimatedBudget).toBe(1500000);

    const dashboard = await agent.get(`/api/v1/dashboard/aim?assignedTo=${member._id}`);
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.actuals.leads).toBe(2); expect(dashboard.body.data.dataReadiness.leads).toBe(true);
  });

  it("forces team members to own newly created leads and blocks unauthorized reassignment/editing", async () => {
    const admin = await seedUser({ id: "FPA-000001", email: "admin@lead.test", mobile: "+919999999991", role: "ADMIN" });
    const member = await seedUser({ id: "FPA-000002", email: "member@lead.test", mobile: "+919999999992" });
    const other = await seedUser({ id: "FPA-000003", email: "other@lead.test", mobile: "+919999999993" });
    const memberAgent = request.agent(app); await login(memberAgent, member.email, "Member@Test123");
    const created = await memberAgent.post("/api/v1/leads").send(leadPayload(admin._id));
    expect(created.status).toBe(201); expect(created.body.data.lead.assignedTo.id).toBe(String(member._id));
    const id = created.body.data.lead.id;
    const reassign = await memberAgent.patch(`/api/v1/leads/${id}`).send({ assignedTo: String(other._id) });
    expect(reassign.status).toBe(403);
    const edit = await memberAgent.patch(`/api/v1/leads/${id}`).send({ nextAction: "Send ERP discovery checklist" });
    expect(edit.status).toBe(200); expect(edit.body.data.lead.nextAction).toBe("Send ERP discovery checklist");
    const otherAgent = request.agent(app); await login(otherAgent, other.email, "Member@Test123");
    const forbidden = await otherAgent.patch(`/api/v1/leads/${id}`).send({ nextAction: "Should fail" });
    expect(forbidden.status).toBe(403);
  });

  it("soft deletes, audits and restores leads without losing the permanent identity", async () => {
    const admin = await seedUser({ id: "FPA-000001", email: "admin@lead.test", mobile: "+919999999991", role: "ADMIN" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");
    const created = await agent.post("/api/v1/leads").send(leadPayload(admin._id));
    const id = created.body.data.lead.id; const permanentId = created.body.data.lead.permanentLeadId;
    const removed = await agent.delete(`/api/v1/leads/${id}`); expect(removed.status).toBe(200);
    const hidden = await agent.get(`/api/v1/leads/${id}`); expect(hidden.status).toBe(404);
    const restored = await agent.post(`/api/v1/leads/${id}/restore`).send({});
    expect(restored.status).toBe(200); expect(restored.body.data.lead.permanentLeadId).toBe(permanentId);
    const history = await agent.get(`/api/v1/leads/${id}/history`);
    expect(history.status).toBe(200); expect(history.body.data.history.map((item) => item.action)).toEqual(expect.arrayContaining(["CREATED", "SOFT_DELETED", "RESTORED"]));
  });
});
