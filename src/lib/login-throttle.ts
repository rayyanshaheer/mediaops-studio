import { createHmac } from "node:crypto";
import { db } from "./db";
import { serverEnv } from "./env";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function loginThrottleKey(forwardedFor: string | null, realIp: string | null) {
  const address = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return createHmac("sha256", serverEnv().AUTH_SECRET).update(address).digest("hex");
}

export async function loginAllowed(key: string, now = new Date()) {
  const throttle = await db.loginThrottle.findUnique({ where: { key } });
  return !throttle?.blockedUntil || throttle.blockedUntil <= now;
}

export async function recordLoginFailure(key: string, now = new Date()) {
  return db.$transaction(async (tx) => {
    const current = await tx.loginThrottle.findUnique({ where: { key } });
    if (current?.blockedUntil && current.blockedUntil > now) return true;

    const windowExpired = !current || now.getTime() - current.windowStartedAt.getTime() >= WINDOW_MS;
    const attempts = windowExpired ? 1 : current.attempts + 1;
    const blockedUntil = attempts >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null;
    const windowStartedAt = windowExpired ? now : current.windowStartedAt;

    await tx.loginThrottle.upsert({
      where: { key },
      create: { key, attempts, windowStartedAt, blockedUntil },
      update: { attempts, windowStartedAt, blockedUntil },
    });
    return Boolean(blockedUntil);
  }, { isolationLevel: "Serializable" });
}

export async function clearLoginFailures(key: string) {
  await db.loginThrottle.deleteMany({ where: { key } });
}
