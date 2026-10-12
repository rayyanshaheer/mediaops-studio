import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReleaseForm } from "./release-form";
export default async function NewReleasePage(){const user=await requireUser();const brands=await db.brandProfile.findMany({where:{ownerId:user.id},select:{id:true,name:true}});return <><header className="pagebar"><div><h1>Create release</h1><p className="subtle">Record the context before the master image enters the pipeline.</p></div></header><ReleaseForm brands={brands}/></>}
