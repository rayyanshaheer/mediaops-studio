import { createHash, timingSafeEqual } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { serverEnv } from "./env";

export function cloudinaryClient() {
  const env = serverEnv();
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  return cloudinary;
}

export function verifyCloudinaryWebhook(rawBody: string, timestamp: string, supplied: string) {
  const env = serverEnv();
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 60 * 60 * 2) return false;
  const expected = createHash("sha1").update(`${rawBody}${timestamp}${env.CLOUDINARY_API_SECRET}`).digest("hex");
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function verifyCloudinaryUploadResponse(publicId: string, version: number, supplied: string) {
  const expected = createHash("sha1")
    .update(`public_id=${publicId}&version=${version}${serverEnv().CLOUDINARY_API_SECRET}`)
    .digest("hex");
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
