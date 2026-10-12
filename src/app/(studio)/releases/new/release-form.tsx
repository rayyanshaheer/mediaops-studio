"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReleaseForm({ brands }: { brands: Array<{id:string;name:string}> }) {
  const router = useRouter(); const [error,setError]=useState(""); const [pending,setPending]=useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data=Object.fromEntries(new FormData(event.currentTarget));
    const response=await fetch("/api/releases",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
    const body=await response.json(); setPending(false);
    if(!response.ok){setError(body.error?.message??"Could not create release.");return;}
    router.push(`/releases/${body.id}`);
  }
  return <form className="form" onSubmit={submit}>
    {error && <p className="error" role="alert">{error}</p>}
    <section className="form-section"><div><h2>Release details</h2><p className="subtle">The working name and publishing context.</p></div><div className="fields"><div className="field full"><label htmlFor="title">Release title</label><input id="title" name="title" required minLength={3} placeholder="FAST Dev Day keynote" /></div><div className="field"><label htmlFor="eventName">Event</label><input id="eventName" name="eventName" required placeholder="FAST Dev Day" /></div><div className="field"><label htmlFor="speaker">Speaker</label><input id="speaker" name="speaker" placeholder="Optional" /></div><div className="field"><label htmlFor="campaign">Campaign</label><input id="campaign" name="campaign" required defaultValue="event-recap" /></div><div className="field"><label htmlFor="assetType">Asset type</label><select id="assetType" name="assetType" defaultValue="keynote-photo"><option value="keynote-photo">Keynote photo</option><option value="speaker-photo">Speaker photo</option><option value="group-photo">Group photo</option><option value="venue-photo">Venue photo</option></select></div><div className="field full"><label htmlFor="caption">Caption</label><textarea id="caption" name="caption" placeholder="Optional publishing copy" /></div></div></section>
    <section className="form-section"><div><h2>Production setup</h2><p className="subtle">Fixed for reproducible output.</p></div><div className="fields"><div className="field"><label htmlFor="brandProfileId">Brand profile</label><select id="brandProfileId" name="brandProfileId">{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div className="field"><label htmlFor="templateKey">Template</label><select id="templateKey" name="templateKey"><option value="event-recap">Event recap · v1</option></select></div></div></section>
    <div style={{display:"flex",justifyContent:"flex-end"}}><button className="button" disabled={pending}>{pending?"Creating…":"Create draft"}</button></div>
  </form>;
}
