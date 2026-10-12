import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { verifyCloudinaryWebhook } from "@/lib/cloudinary";
import { aggregateStatus } from "@/lib/domain";
import { recipeFromTransformation } from "@/lib/recipes";
import { errorResponse } from "@/lib/api";

type EagerResult = {
  transformation: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  secure_url?: string;
  status?: string;
};

type Payload = {
  notification_type?: string;
  request_id?: string;
  asset_id?: string;
  public_id?: string;
  version?: number;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resource_type?: string;
  type?: string;
  secure_url?: string;
  etag?: string;
  created_at?: string;
  eager?: EagerResult[];
  timestamp?: string;
};

function releaseIdFrom(publicId?: string) {
  return publicId?.match(/^mediaops\/[a-f0-9-]+\/([a-f0-9-]+)\/master$/i)?.[1] ?? null;
}

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? `req_${crypto.randomUUID()}`;
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return errorResponse("UNSUPPORTED_MEDIA_TYPE", "Webhook content type must be application/json.", 415, requestId);
  }
  const raw = await request.text();
  if (raw.length > 1_000_000) return errorResponse("PAYLOAD_TOO_LARGE", "Webhook payload is too large.", 413, requestId);

  const webhookGeneration = Number(new URL(request.url).searchParams.get("generation"));
  const timestamp = request.headers.get("x-cld-timestamp") ?? "";
  const signature = request.headers.get("x-cld-signature") ?? "";
  if (!verifyCloudinaryWebhook(raw, timestamp, signature)) {
    return errorResponse("INVALID_SIGNATURE", "Webhook signature is invalid or expired.", 401, requestId);
  }

  let payload: Payload;
  try { payload = JSON.parse(raw); }
  catch { return errorResponse("INVALID_PAYLOAD", "Webhook payload is malformed.", 400, requestId); }

  const releaseId = releaseIdFrom(payload.public_id);
  if (!releaseId) return Response.json({ accepted: true, unresolved: true });
  const idempotencyKey = payload.request_id ?? createHash("sha256")
    .update(JSON.stringify([payload.notification_type, payload.asset_id, payload.public_id, payload.timestamp, payload.eager?.map((item) => [item.transformation, item.status])]))
    .digest("hex");

  try {
    await db.$transaction(async (tx) => {
      if (await tx.processingEvent.findUnique({ where: { idempotencyKey } })) return;
      const release = await tx.mediaRelease.findUnique({ where: { id: releaseId } });
      if (!release) {
        await tx.processingEvent.create({ data: {
          releaseId: null, eventType: payload.notification_type ?? "unknown", idempotencyKey,
          signatureValid: true, providerTimestamp: new Date(Number(timestamp) * 1000),
          payload: payload as Prisma.InputJsonValue, processedAt: new Date(), processingError: "Release not found",
        } });
        return;
      }

      await tx.processingEvent.create({ data: {
        releaseId, eventType: payload.notification_type ?? "unknown", idempotencyKey,
        signatureValid: true, providerTimestamp: new Date(Number(timestamp) * 1000),
        payload: payload as Prisma.InputJsonValue,
      } });

      if (!Number.isInteger(webhookGeneration) || webhookGeneration !== release.generation) {
        await tx.processingEvent.update({ where: { idempotencyKey }, data: { processedAt: new Date(), processingError: "Stale generation ignored" } });
        return;
      }

      if (payload.notification_type === "upload" && payload.asset_id && payload.public_id && payload.secure_url) {
        const source = {
          cloudinaryAssetId: payload.asset_id, publicId: payload.public_id, version: payload.version ?? 0,
          resourceType: payload.resource_type ?? "image", deliveryType: payload.type ?? "upload",
          format: payload.format ?? "jpg", width: payload.width ?? 0, height: payload.height ?? 0,
          bytes: BigInt(payload.bytes ?? 0), etag: payload.etag, secureUrl: payload.secure_url,
          uploadedAt: new Date(payload.created_at ?? Date.now()),
        };
        await tx.sourceAsset.upsert({ where: { releaseId }, update: source, create: { releaseId, ...source } });
      }

      for (const item of payload.eager ?? []) {
        const recipe = recipeFromTransformation(item.transformation);
        if (!recipe) continue;
        const failed = item.status === "failed";
        await tx.mediaVariant.upsert({
          where: { releaseId_generation_recipeKey: { releaseId, generation: release.generation, recipeKey: recipe.key } },
          update: {
            status: failed ? "FAILED" : "READY", width: item.width, height: item.height,
            bytes: item.bytes ? BigInt(item.bytes) : null, format: item.format,
            secureUrl: item.secure_url, errorCode: failed ? "TRANSFORMATION_FAILED" : null,
          },
          create: {
            releaseId, generation: release.generation, recipeKey: recipe.key, recipeVersion: recipe.version,
            status: failed ? "FAILED" : "READY", transformation: item.transformation,
            width: item.width, height: item.height, bytes: item.bytes ? BigInt(item.bytes) : null,
            format: item.format, secureUrl: item.secure_url, errorCode: failed ? "TRANSFORMATION_FAILED" : null,
          },
        });
      }

      const [source, variants] = await Promise.all([
        tx.sourceAsset.findUnique({ where: { releaseId } }),
        tx.mediaVariant.findMany({ where: { releaseId, generation: release.generation } }),
      ]);
      const status = aggregateStatus({ hasSource: Boolean(source), generation: release.generation, variants });
      const failed = variants.find((variant) => variant.status === "FAILED");
      await tx.mediaRelease.update({
        where: { id: releaseId },
        data: {
          status, readyAt: status === "READY" ? new Date() : null,
          failureCode: failed ? "TRANSFORMATION_FAILED" : null,
          failureMessage: failed ? `Could not generate ${failed.recipeKey}.` : null,
        },
      });
      await tx.processingEvent.update({ where: { idempotencyKey }, data: { processedAt: new Date() } });
    });
    return Response.json({ accepted: true });
  } catch (error) {
    console.error(JSON.stringify({ event: "cloudinary_webhook_failed", requestId, releaseId, idempotencyKey, error: error instanceof Error ? error.message : "unknown" }));
    return errorResponse("WEBHOOK_PROCESSING_FAILED", "The notification could not be processed.", 500, requestId);
  }
}
