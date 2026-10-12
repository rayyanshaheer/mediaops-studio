import Link from "next/link";
import { requireUser, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  async function logout() { "use server"; await clearSession(); redirect("/login"); }
  return <div className="shell"><aside className="sidebar"><Link className="wordmark" href="/dashboard"><span className="mark"/>MediaOps Studio</Link><nav className="nav" aria-label="Primary"><Link href="/dashboard">Releases</Link><Link href="/releases/new">New release</Link><Link href="/api/health/live">System health</Link></nav><div className="sidebar-bottom"><strong>{user.name}</strong><div>{user.email}</div><form action={logout} style={{marginTop:14}}><button className="button secondary" type="submit">Sign out</button></form></div></aside><main className="main">{children}</main></div>;
}
