import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/api";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser();
  if (!user) return errorResponse("UNAUTHORIZED", "Sign in is required.", 401);
  const { id } = await params;
  const release = await db.mediaRelease.findFirst({ where: { id, ownerId: user.id } });
  if (!release) return errorResponse("NOT_FOUND", "Release not found.", 404);
  if (release.status !== "FAILED") return errorResponse("INVALID_STATE", "Only a failed release can be retried.", 409);
  if (release.generation >= 3) return errorResponse("RETRY_LIMIT", "This release reached its retry limit.", 409);
  const updated = await db.mediaRelease.update({
    where: { id },
    data: { generation: { increment: 1 }, status: "DRAFT", failureCode: null, failureMessage: null, readyAt: null },
  });
  return Response.json({ id: updated.id, generation: updated.generation, status: updated.status });
}
