import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { hashPassword } from "../src/core/security/password.js";
import Counter from "../src/features/auth/models/counter.model.js";
import OneTimeToken from "../src/features/auth/models/one-time-token.model.js";
import Session from "../src/features/auth/models/session.model.js";
import AuditLog from "../src/features/audit/audit-log.model.js";
import User from "../src/features/users/user.model.js";
import { clearTestOutbox, getTestOutbox } from "../src/features/mail/mail.service.js";

beforeAll(async () => { await connectDatabase(); });
afterAll(async () => { const { default: mongoose } = await import("mongoose"); await mongoose.connection.dropDatabase(); await disconnectDatabase(); });
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Counter.deleteMany({}), OneTimeToken.deleteMany({}), Session.deleteMany({}), AuditLog.deleteMany({})]);
  clearTestOutbox();
});

const seedAdmin = async () => User.create({
  userId: "FPA-000001",
  fullName: "Admin User",
  email: "admin@test.local",
  mobile: "+919999999991",
  designation: "Administrator",
  role: "ADMIN",
  status: "ACTIVE",
  passwordHash: await hashPassword("Admin@Test123"),
  tokenVersion: 0,
  activatedAt: new Date(),
});

describe("authentication workflow", () => {
  it("registers a pending user", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      fullName: "Test Member",
      mobile: "+919999999992",
      email: "member@test.local",
      designation: "Project Manager",
    });
    expect(response.status).toBe(201);
    expect(response.body.data.user.status).toBe("PENDING");
  });

  it("logs in an active admin and returns current user", async () => {
    await seedAdmin();
    const agent = request.agent(app);
    const login = await agent.post("/api/v1/auth/login").send({ identifier: "admin@test.local", password: "Admin@Test123" });
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe("ADMIN");
    const me = await agent.get("/api/v1/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe("admin@test.local");
  });

  it("allows an admin to list users with pagination query parameters", async () => {
    await seedAdmin();
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({ identifier: "admin@test.local", password: "Admin@Test123" });
    const response = await agent.get("/api/v1/users?page=1&limit=5");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(5);
  });

  it("prevents non-admin access to user administration", async () => {
    const member = await User.create({
      userId: "FPA-000002", fullName: "Member", email: "member@test.local", mobile: "+919999999993",
      designation: "PM", role: "TEAM_MEMBER", status: "ACTIVE", passwordHash: await hashPassword("Member@Test123"), activatedAt: new Date(),
    });
    expect(member.role).toBe("TEAM_MEMBER");
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({ identifier: "member@test.local", password: "Member@Test123" });
    const response = await agent.get("/api/v1/users");
    expect(response.status).toBe(403);
  });

  it("approves registration and emits activation email", async () => {
    await seedAdmin();
    const pending = await User.create({ userId: "FPA-000002", fullName: "Pending User", email: "pending@test.local", mobile: "+919999999994", designation: "PM", role: "TEAM_MEMBER", status: "PENDING" });
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/login").send({ identifier: "admin@test.local", password: "Admin@Test123" });
    const response = await agent.patch(`/api/v1/users/${pending._id}/approval`).send({ decision: "APPROVE", role: "TEAM_MEMBER" });
    expect(response.status).toBe(200);
    expect(response.body.data.user.status).toBe("APPROVED");
    expect(getTestOutbox()).toHaveLength(1);
    expect(getTestOutbox()[0].subject).toContain("Activate");
  });
});
