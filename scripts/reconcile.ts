import { createHash } from "node:crypto";
import { db } from "../src/lib/db";
import { cloudinaryClient } from "../src/lib/cloudinary";
import { aggregateStatus } from "../src/lib/domain";

type CloudinaryDerived = {
  transformation: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  secure_url: string;
};

type CloudinaryResource = {
  asset_id: string;
  public_id: string;
  version: number;
  resource_type: string;
  type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  etag?: string;
  secure_url: string;
  created_at: string;
  derived?: CloudinaryDerived[];
};

const apply = process.argv.includes("--apply");
const olderThan = new Date(Date.now() - 2 * 60 * 1000);
const releases = await db.mediaRelease.findMany({
  where: { status: { in: ["UPLOADING", "PROCESSING"] }, updatedAt: { lt: olderThan } },
  include: { sourceAsset: true, variants: true },
});

console.log(JSON.stringify({ event: "reconciliation_started", mode: apply ? "apply" : "dry-run", releases: releases.length }));
const cloudinary = cloudinaryClient();

for (const release of releases) {
  const publicId = release.sourceAsset?.publicId ?? `mediaops/${release.ownerId}/${release.id}/master`;
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "image",
      type: "upload",
    }) as CloudinaryResource;
    const current = release.variants.filter((variant) => variant.generation === release.generation);
    const derived = new Map((resource.derived ?? []).map((item) => [item.transformation, item]));
    const matched = current.filter((variant) => derived.has(variant.transformation));
    const proposedStatus = matched.length === current.length && current.length > 0 ? "READY" : "PROCESSING";

    console.log(JSON.stringify({
      event: "reconciliation_plan",
      releaseId: release.id,
      generation: release.generation,
      sourceFound: true,
      variantsFound: matched.map((variant) => variant.recipeKey),
      proposedStatus,
    }));
    if (!apply) continue;

    await db.$transaction(async (tx) => {
      await tx.sourceAsset.upsert({
        where: { releaseId: release.id },
        update: {
          cloudinaryAssetId: resource.asset_id, publicId: resource.public_id, version: resource.version,
          resourceType: resource.resource_type, deliveryType: resource.type, format: resource.format,
          width: resource.width, height: resource.height, bytes: BigInt(resource.bytes), etag: resource.etag,
          secureUrl: resource.secure_url, uploadedAt: new Date(resource.created_at),
        },
        create: {
          releaseId: release.id, cloudinaryAssetId: resource.asset_id, publicId: resource.public_id,
          version: resource.version, resourceType: resource.resource_type, deliveryType: resource.type,
          format: resource.format, width: resource.width, height: resource.height, bytes: BigInt(resource.bytes),
          etag: resource.etag, secureUrl: resource.secure_url, uploadedAt: new Date(resource.created_at),
        },
      });
      for (const variant of matched) {
        const result = derived.get(variant.transformation)!;
        await tx.mediaVariant.update({
          where: { id: variant.id },
          data: {
            status: "READY", width: result.width, height: result.height, bytes: BigInt(result.bytes),
            format: result.format, secureUrl: result.secure_url, errorCode: null,
          },
        });
      }
      const variants = await tx.mediaVariant.findMany({ where: { releaseId: release.id, generation: release.generation } });
      const status = aggregateStatus({ hasSource: true, generation: release.generation, variants });
      await tx.mediaRelease.update({
        where: { id: release.id },
        data: { status, readyAt: status === "READY" ? new Date() : null, failureCode: null, failureMessage: null },
      });
      const idempotencyKey = createHash("sha256")
        .update(`reconciliation:${release.id}:${release.generation}:${resource.version}`)
        .digest("hex");
      await tx.processingEvent.upsert({
        where: { idempotencyKey },
        update: { processedAt: new Date(), processingError: null },
        create: {
          releaseId: release.id, provider: "cloudinary", eventType: "reconciliation",
          idempotencyKey, signatureValid: true, processedAt: new Date(),
          payload: { generation: release.generation, sourceFound: true, variantsFound: matched.map((variant) => variant.recipeKey) },
        },
      });
    });
  } catch (error) {
    console.error(JSON.stringify({
      event: "reconciliation_failed",
      releaseId: release.id,
      error: error instanceof Error ? error.message : "Unknown Cloudinary error",
    }));
  }
}

await db.$disconnect();
console.log(JSON.stringify({ event: "reconciliation_finished", mode: apply ? "apply" : "dry-run" }));
