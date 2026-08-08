import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import Counter from "../src/features/auth/models/counter.model.js";
import Interaction from "../src/features/interactions/interaction.model.js";
import JourneyProfile from "../src/features/interactions/journey-profile.model.js";
import LeadAudit from "../src/features/leads/lead-audit.model.js";
import Lead from "../src/features/leads/lead.model.js";
import Target from "../src/features/targets/target.model.js";
import User from "../src/features/users/user.model.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => { const { default: mongoose } = await import("mongoose"); await mongoose.connection.dropDatabase(); await disconnectDatabase(); });
beforeEach(async () => { await Promise.all([Interaction.deleteMany({}), JourneyProfile.deleteMany({}), Lead.deleteMany({}), LeadAudit.deleteMany({}), Target.deleteMany({}), Counter.deleteMany({}), User.deleteMany({})]); });

const seed = async ({ role = "ADMIN", id, email, mobile }) => User.create({ userId: id, fullName: role === "ADMIN" ? "Admin User" : "Team Member", email, mobile, designation: role === "ADMIN" ? "Administrator" : "Project Manager", role, status: "ACTIVE", passwordHash: await hashPassword(role === "ADMIN" ? "Admin@Test123" : "Member@Test123"), activatedAt: new Date() });
const login = (agent, identifier, password) => agent.post("/api/v1/auth/login").send({ identifier, password });
const leadBody = (owner) => ({ companyName: "Interaction Test Industries", primaryContact: { fullName: "Ravi Test", email: "ravi.interaction@example.com", mobile: "+919999999991" }, industry: "Manufacturing", assignedTo: String(owner), country: "India", city: "Pune", source: "LinkedIn", salesStage: "C1" });

describe("I C1/C2 interaction journey", () => {
  it("records C1 and C2 against the same permanent lead and updates dashboard actuals", async () => {
    const admin = await seed({ role: "ADMIN", id: "FPA-000001", email: "admin@interaction.test", mobile: "+919999999991" });
    const member = await seed({ role: "TEAM_MEMBER", id: "FPA-000002", email: "member@interaction.test", mobile: "+919999999992" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");
    const created = await agent.post("/api/v1/leads").send(leadBody(member._id));
    expect(created.status).toBe(201); const lead = created.body.data.lead;

    const c1 = await agent.post("/api/v1/interactions").send({ leadId: lead.id, stage: "C1", channel: "EMAIL", response: "POSITIVE", outcome: "MOVE_TO_C2", content: "ERP introduction", c1: { understanding: "Manual process", requirement: "ERP discovery" }, nextAction: "Discovery meeting", nextFollowUpDate: "2026-08-12T10:00:00.000Z" });
    expect(c1.status).toBe(201); expect(c1.body.data.interaction.permanentLeadId).toBe(lead.permanentLeadId);
    const c2 = await agent.post("/api/v1/interactions").send({ leadId: lead.id, stage: "C2", channel: "ONLINE_MEETING", response: "POSITIVE", outcome: "MOVE_TO_C3", c2: { workflow: "Current workflow captured", mustHave: "Approvals and reporting", integrations: "Tally" }, potentialStatus: "POTENTIAL", qualificationStatus: "QUALIFIED", temperature: "Hot", businessRequirement: "Integrated ERP requirement", painPoints: ["Manual reporting"] });
    expect(c2.status).toBe(201);

    const journey = await agent.get(`/api/v1/interactions/journey/${lead.id}`);
    expect(journey.status).toBe(200); expect(journey.body.data.journey.salesStage).toBe("C3"); expect(journey.body.data.journey.qualificationStatus).toBe("QUALIFIED");
    const list = await agent.get(`/api/v1/interactions?leadId=${lead.id}&page=1&limit=10`);
    expect(list.status).toBe(200); expect(list.body.meta.total).toBe(2);
    const dashboard = await agent.get(`/api/v1/dashboard/aim?assignedTo=${member._id}`);
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.actuals.c1).toBe(1); expect(dashboard.body.data.actuals.c2).toBe(1); expect(dashboard.body.data.actuals.emails).toBe(1); expect(dashboard.body.data.actuals.meetings).toBe(1); expect(dashboard.body.data.dataReadiness.c1c2).toBe(true);
  });

  it("blocks a team member from writing interactions on another member's lead", async () => {
    const admin = await seed({ role: "ADMIN", id: "FPA-000001", email: "admin2@interaction.test", mobile: "+919999999981" });
    const member = await seed({ role: "TEAM_MEMBER", id: "FPA-000002", email: "member2@interaction.test", mobile: "+919999999982" });
    const other = await seed({ role: "TEAM_MEMBER", id: "FPA-000003", email: "other@interaction.test", mobile: "+919999999983" });
    const adminAgent = request.agent(app); await login(adminAgent, admin.email, "Admin@Test123");
    const created = await adminAgent.post("/api/v1/leads").send(leadBody(member._id));
    const otherAgent = request.agent(app); await login(otherAgent, other.email, "Member@Test123");
    const forbidden = await otherAgent.post("/api/v1/interactions").send({ leadId: created.body.data.lead.id, stage: "C1", channel: "CALL", response: "NO_RESPONSE", outcome: "STAY" });
    expect(forbidden.status).toBe(403);
  });
});
