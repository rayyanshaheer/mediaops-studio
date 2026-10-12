import { z } from "zod";

export const createReleaseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  eventName: z.string().trim().min(2).max(120),
  campaign: z.string().trim().min(2).max(80),
  speaker: z.string().trim().max(120).optional().or(z.literal("")),
  assetType: z.enum(["keynote-photo", "speaker-photo", "group-photo", "venue-photo"]),
  caption: z.string().trim().max(1000).optional().or(z.literal("")),
  brandProfileId: z.uuid(),
  templateKey: z.literal("event-recap"),
});

export const uploadCompleteSchema = z.object({
  asset_id: z.string().min(1), public_id: z.string().min(1), version: z.number().int(),
  width: z.number().int().positive(), height: z.number().int().positive(), bytes: z.number().int().positive(),
  format: z.string().min(1), resource_type: z.literal("image"), type: z.literal("upload"),
  secure_url: z.url(), etag: z.string().optional(), created_at: z.string(),
  signature: z.string().min(1),
});
