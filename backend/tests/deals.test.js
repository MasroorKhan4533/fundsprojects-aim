import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import Counter from "../src/features/auth/models/counter.model.js";
import BuildHandover from "../src/features/deals/build-handover.model.js";
import Deal from "../src/features/deals/deal.model.js";
import Interaction from "../src/features/interactions/interaction.model.js";
import JourneyProfile from "../src/features/interactions/journey-profile.model.js";
import Lead from "../src/features/leads/lead.model.js";
import User from "../src/features/users/user.model.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => { const { default: mongoose } = await import("mongoose"); await mongoose.connection.dropDatabase(); await disconnectDatabase(); });
beforeEach(async () => { await Promise.all([BuildHandover.deleteMany({}), Deal.deleteMany({}), Interaction.deleteMany({}), JourneyProfile.deleteMany({}), Lead.deleteMany({}), Counter.deleteMany({}), User.deleteMany({})]); });

const seed = async ({ role = "ADMIN", id, email, mobile }) => User.create({ userId: id, fullName: role === "ADMIN" ? "Admin User" : "Team Member", email, mobile, designation: role === "ADMIN" ? "Administrator" : "Project Manager", role, status: "ACTIVE", passwordHash: await hashPassword(role === "ADMIN" ? "Admin@Test123" : "Member@Test123"), activatedAt: new Date() });
const login = (agent, identifier, password) => agent.post("/api/v1/auth/login").send({ identifier, password });
const leadBody = (owner, companyName = "Commercial Test Industries") => ({ companyName, primaryContact: { fullName: "Commercial Lead", email: "commercial@example.com", mobile: "+919999999951" }, industry: "Manufacturing", assignedTo: String(owner), country: "India", city: "Pune", source: "LinkedIn", salesStage: "C3", estimatedBudget: 1200000 });

describe("M C3/C4 commercial journey", () => {
  it("saves C3 versions, closes C4 as Won, updates AIM actuals and creates BUILD handover", async () => {
    const admin = await seed({ role: "ADMIN", id: "FPA-000001", email: "admin@deal.test", mobile: "+919999999951" });
    const member = await seed({ role: "TEAM_MEMBER", id: "FPA-000002", email: "member@deal.test", mobile: "+919999999952" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");
    const created = await agent.post("/api/v1/leads").send(leadBody(member._id)); expect(created.status).toBe(201); const lead = created.body.data.lead;
    const c3 = await agent.put(`/api/v1/deals/${lead.id}/c3`).send({ budget: 1200000, probability: 70, expectedClose: "2026-09-01", versions: [{ label: "V1", modules: "CRM", timeline: "6 weeks", cost: 900000 }, { label: "V2", modules: "ERP + CRM", timeline: "10 weeks", cost: 1200000 }, { label: "V3", modules: "ERP + CRM + AI", timeline: "14 weeks", cost: 1600000 }], preferredVersion: "V2", proposalVersion: "V2", proposalStatus: "SHARED", proposalUrl: "https://example.com/proposal", quotationUrl: "https://example.com/quotation", negotiationNotes: "Commercial discussion active" });
    expect(c3.status).toBe(200); expect(c3.body.data.deal.permanentLeadId).toBe(lead.permanentLeadId); expect(c3.body.data.deal.versions).toHaveLength(3);
    const before = await agent.post(`/api/v1/deals/${lead.id}/handover`).send({}); expect(before.status).toBe(409);
    const c4 = await agent.put(`/api/v1/deals/${lead.id}/c4`).send({ finalVersion: "V2", finalValue: 1100000, discountPercent: 8, advanceAmount: 300000, paymentStatus: "PARTIAL", dealStatus: "WON", finalScope: "ERP + CRM implementation", paymentTerms: "30% advance, balance by milestones", agreementUrl: "https://example.com/agreement", ndaUrl: "https://example.com/nda", poUrl: "https://example.com/po", approvedTimeline: "12 weeks", closureNotes: "Won after negotiation" });
    expect(c4.status).toBe(200); expect(c4.body.data.deal.dealStatus).toBe("WON"); expect(c4.body.data.deal.commercial.commissionTotal).toBeGreaterThan(0);
    const handover = await agent.post(`/api/v1/deals/${lead.id}/handover`).send({}); expect(handover.status).toBe(201); expect(handover.body.data.handover.status).toBe("CREATED");
    const dashboard = await agent.get(`/api/v1/dashboard/aim?assignedTo=${member._id}`); expect(dashboard.status).toBe(200); expect(dashboard.body.data.actuals.c3).toBe(1); expect(dashboard.body.data.actuals.c4).toBe(1); expect(dashboard.body.data.actuals.proposals).toBe(1); expect(dashboard.body.data.actuals.revenue).toBe(1100000); expect(dashboard.body.data.pipeline.buildHandoffs).toBe(1); expect(dashboard.body.data.dataReadiness.c3c4).toBe(true);
  });

  it("shows qualified C3 leads in the workbench before a deal exists", async () => {
    const admin = await seed({ role: "ADMIN", id: "FPA-000001", email: "admin2@deal.test", mobile: "+919999999961" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");
    const created = await agent.post("/api/v1/leads").send(leadBody(admin._id, "Qualified Lead Co")); expect(created.status).toBe(201);
    const list = await agent.get("/api/v1/deals/workbench?page=1&limit=10&search=Qualified"); expect(list.status).toBe(200); expect(list.body.data).toHaveLength(1); expect(list.body.data[0].deal).toBeNull();
  });

  it("blocks team members from managing another owner's commercial deal", async () => {
    const admin = await seed({ role: "ADMIN", id: "FPA-000001", email: "admin3@deal.test", mobile: "+919999999971" });
    const owner = await seed({ role: "TEAM_MEMBER", id: "FPA-000002", email: "owner@deal.test", mobile: "+919999999972" });
    const other = await seed({ role: "TEAM_MEMBER", id: "FPA-000003", email: "other@deal.test", mobile: "+919999999973" });
    const adminAgent = request.agent(app); await login(adminAgent, admin.email, "Admin@Test123"); const created = await adminAgent.post("/api/v1/leads").send(leadBody(owner._id));
    const otherAgent = request.agent(app); await login(otherAgent, other.email, "Member@Test123"); const forbidden = await otherAgent.put(`/api/v1/deals/${created.body.data.lead.id}/c3`).send({ budget: 100000, probability: 20 }); expect(forbidden.status).toBe(403);
  });
});
