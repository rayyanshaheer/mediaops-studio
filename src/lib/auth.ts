import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "./env";
import { db } from "./db";

const COOKIE = "mediaops_session";

function signature(value: string) {
  return createHmac("sha256", serverEnv().AUTH_SECRET).update(value).digest("hex");
}

export async function createSession(email: string) {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const value = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  (await cookies()).set(COOKIE, `${value}.${signature(value)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() { (await cookies()).delete(COOKIE); }

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [value, supplied] = token.split(".");
  if (!value || !supplied) return null;
  const expected = signature(value);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString()) as { email: string; expires: number };
    if (payload.expires < Date.now()) return null;
    return db.user.findUnique({ where: { email: payload.email } });
  } catch { return null; }
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function apiUser() { return currentUser(); }
