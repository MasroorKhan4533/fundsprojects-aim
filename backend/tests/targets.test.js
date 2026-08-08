import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import AuditLog from "../src/features/audit/audit-log.model.js";
import Counter from "../src/features/auth/models/counter.model.js";
import OneTimeToken from "../src/features/auth/models/one-time-token.model.js";
import Session from "../src/features/auth/models/session.model.js";
import Target from "../src/features/targets/target.model.js";
import User from "../src/features/users/user.model.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => { const { default: mongoose } = await import("mongoose"); await mongoose.connection.dropDatabase(); await disconnectDatabase(); });
beforeEach(async () => { await Promise.all([User.deleteMany({}), Target.deleteMany({}), Counter.deleteMany({}), OneTimeToken.deleteMany({}), Session.deleteMany({}), AuditLog.deleteMany({})]); });

const seedUser = async ({ id, email, mobile, role }) => User.create({ userId: id, fullName: role === "ADMIN" ? "Admin User" : "Team Member", email, mobile, designation: role === "ADMIN" ? "Administrator" : "Project Manager", role, status: "ACTIVE", passwordHash: await hashPassword(role === "ADMIN" ? "Admin@Test123" : "Member@Test123"), activatedAt: new Date() });
const login = async (agent, identifier, password) => agent.post("/api/v1/auth/login").send({ identifier, password });
const payload = (assignedTo) => ({ targetDate: "2026-08-08", assignedTo: String(assignedTo), focusStage: "Overall", metrics: { leads: 20, emails: 100, messages: 80, calls: 50, meetings: 5, c1: 20, c2: 5, c3: 2, c4: 1, proposals: 2, revenue: 500000 }, notes: "Daily team target" });

describe("targets and AIM dashboard", () => {
  it("creates, lists, updates and deletes a target as admin", async () => {
    const admin = await seedUser({ id: "FPA-000001", email: "admin@test.local", mobile: "+919999999991", role: "ADMIN" });
    const member = await seedUser({ id: "FPA-000002", email: "member@test.local", mobile: "+919999999992", role: "TEAM_MEMBER" });
    const agent = request.agent(app); await login(agent, admin.email, "Admin@Test123");
    const created = await agent.post("/api/v1/targets").send(payload(member._id));
    expect(created.status).toBe(201); expect(created.body.data.target.metrics.revenue).toBe(500000);
    const targetId = created.body.data.target.id;
    const listed = await agent.get(`/api/v1/targets?assignedTo=${member._id}&page=1&limit=10`);
    expect(listed.status).toBe(200); expect(listed.body.meta.total).toBe(1);
    const changed = { ...payload(member._id), metrics: { ...payload(member._id).metrics, leads: 25 } };
    const updated = await agent.put(`/api/v1/targets/${targetId}`).send(changed);
    expect(updated.status).toBe(200); expect(updated.body.data.target.metrics.leads).toBe(25);
    const dashboard = await agent.get(`/api/v1/dashboard/aim?assignedTo=${member._id}`);
    expect(dashboard.status).toBe(200); expect(dashboard.body.data.targets.leads).toBe(25); expect(dashboard.body.data.dataReadiness.targets).toBe(true);
    const removed = await agent.delete(`/api/v1/targets/${targetId}`); expect(removed.status).toBe(200);
  });

  it("restricts a team member to their own target visibility", async () => {
    const admin = await seedUser({ id: "FPA-000001", email: "admin@test.local", mobile: "+919999999991", role: "ADMIN" });
    const member = await seedUser({ id: "FPA-000002", email: "member@test.local", mobile: "+919999999992", role: "TEAM_MEMBER" });
    const other = await seedUser({ id: "FPA-000003", email: "other@test.local", mobile: "+919999999993", role: "TEAM_MEMBER" });
    await Target.create({ ...payload(other._id), createdBy: admin._id, updatedBy: admin._id });
    const agent = request.agent(app); await login(agent, member.email, "Member@Test123");
    const listed = await agent.get(`/api/v1/targets?assignedTo=${other._id}`);
    expect(listed.status).toBe(200); expect(listed.body.meta.total).toBe(0);
    const forbidden = await agent.post("/api/v1/targets").send(payload(other._id));
    expect(forbidden.status).toBe(403);
  });
});
