"use server";
import { createSession } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import { clearLoginFailures, loginAllowed, loginThrottleKey, recordLoginFailure } from "@/lib/login-throttle";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(_: { error?: string } | undefined, formData: FormData) {
  const env = serverEnv();
  const requestHeaders = await headers();
  const throttleKey = loginThrottleKey(requestHeaders.get("x-forwarded-for"), requestHeaders.get("x-real-ip"));
  if (!await loginAllowed(throttleKey)) return { error: "Too many sign-in attempts. Try again in 15 minutes." };
  if (formData.get("email") !== env.DEMO_EMAIL || formData.get("password") !== env.DEMO_PASSWORD) {
    const blocked = await recordLoginFailure(throttleKey);
    return { error: blocked ? "Too many sign-in attempts. Try again in 15 minutes." : "Email or password is incorrect." };
  }
  await clearLoginFailures(throttleKey);
  await createSession(env.DEMO_EMAIL);
  redirect("/dashboard");
}
