import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  DEMO_EMAIL: z.email().default("owner@mediaops.local"),
  DEMO_PASSWORD: z.string().min(8),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().default("mediaops_release_v1"),
  CLOUDINARY_WEBHOOK_URL: z.url(),
  APP_BASE_URL: z.url(),
});

export function serverEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) throw new Error(`Invalid server configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  return result.data;
}
