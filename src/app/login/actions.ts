"use server";
import { createSession } from "@/lib/auth";
import { serverEnv } from "@/lib/env";
import { redirect } from "next/navigation";

export async function login(_: { error?: string } | undefined, formData: FormData) {
  const env = serverEnv();
  if (formData.get("email") !== env.DEMO_EMAIL || formData.get("password") !== env.DEMO_PASSWORD) return { error: "Email or password is incorrect." };
  await createSession(env.DEMO_EMAIL);
  redirect("/dashboard");
}
