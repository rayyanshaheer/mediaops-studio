"use client";
import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return <form action={action}>
    {state?.error && <p className="error" role="alert">{state.error}</p>}
    <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} /></div>
    <button className="button" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
