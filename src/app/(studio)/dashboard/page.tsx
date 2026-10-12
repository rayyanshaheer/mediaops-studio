import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const releases = await db.mediaRelease.findMany({ where:{ownerId:user.id}, orderBy:{createdAt:"desc"}, include:{variants:true} });
  return <><header className="pagebar"><div><h1>Releases</h1><p className="subtle">Branded media packages created from approved master images.</p></div><Link className="button" href="/releases/new">Create release</Link></header>{releases.length ? <div className="ledger">{releases.map((release)=><Link className="ledger-row" href={`/releases/${release.id}`} key={release.id}><div><div className="release-title">{release.title}</div><div className="meta">{release.eventName}{release.speaker ? ` · ${release.speaker}` : ""}</div></div><div className="meta">{release.campaign}</div><span className={`status ${release.status}`}>{release.status}</span><div className="meta">{release.createdAt.toLocaleDateString()}</div></Link>)}</div> : <div className="empty"><h2>No releases yet</h2><p className="subtle">Create a release, add its metadata, then upload the approved source.</p><Link className="button" style={{marginTop:20}} href="/releases/new">Create your first release</Link></div>}</>;
}
