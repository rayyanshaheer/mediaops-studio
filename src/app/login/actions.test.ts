import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  clearLoginFailures: vi.fn(),
  loginAllowed: vi.fn(),
  loginThrottleKey: vi.fn(),
  recordLoginFailure: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ createSession: mocks.createSession }));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({ DEMO_EMAIL: "owner@example.com", DEMO_PASSWORD: "correct-password" }),
}));
vi.mock("@/lib/login-throttle", () => ({
  clearLoginFailures: mocks.clearLoginFailures,
  loginAllowed: mocks.loginAllowed,
  loginThrottleKey: mocks.loginThrottleKey,
  recordLoginFailure: mocks.recordLoginFailure,
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { login } from "./actions";

function credentials(email: string, password: string) {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.4" }));
  mocks.loginThrottleKey.mockReturnValue("hashed-address");
  mocks.loginAllowed.mockResolvedValue(true);
  mocks.recordLoginFailure.mockResolvedValue(false);
});

describe("owner login throttling", () => {
  it("rejects a blocked address before comparing credentials", async () => {
    mocks.loginAllowed.mockResolvedValue(false);

    await expect(login(undefined, credentials("owner@example.com", "correct-password")))
      .resolves.toEqual({ error: "Too many sign-in attempts. Try again in 15 minutes." });
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.recordLoginFailure).not.toHaveBeenCalled();
  });

  it("records an invalid credential attempt", async () => {
    await expect(login(undefined, credentials("owner@example.com", "wrong-password")))
      .resolves.toEqual({ error: "Email or password is incorrect." });
    expect(mocks.recordLoginFailure).toHaveBeenCalledWith("hashed-address");
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("clears failures and creates a session after valid credentials", async () => {
    await login(undefined, credentials("owner@example.com", "correct-password"));

    expect(mocks.clearLoginFailures).toHaveBeenCalledWith("hashed-address");
    expect(mocks.createSession).toHaveBeenCalledWith("owner@example.com");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
