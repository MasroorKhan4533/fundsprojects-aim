import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("health endpoints", () => {
  it("returns liveness without requiring database access", async () => {
    const response = await request(app).get("/api/v1/health/live");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("alive");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("returns standardized 404 errors", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("ROUTE_NOT_FOUND");
    expect(response.body.requestId).toBeTruthy();
  });
});
