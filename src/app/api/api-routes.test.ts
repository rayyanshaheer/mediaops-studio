import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-policy";

const mocks = vi.hoisted(() => ({
  apiUser: vi.fn(),
  brandFindFirst: vi.fn(),
  templateFindUnique: vi.fn(),
  releaseCreate: vi.fn(),
  releaseFindFirst: vi.fn(),
  releaseUpdate: vi.fn(),
  sourceUpsert: vi.fn(),
  variantUpsert: vi.fn(),
  transaction: vi.fn(),
  signRequest: vi.fn(),
  verifyUpload: vi.fn(),
  verifyWebhook: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ apiUser: mocks.apiUser }));
vi.mock("@/lib/db", () => ({
  db: {
    brandProfile: { findFirst: mocks.brandFindFirst },
    transformationTemplateVersion: { findUnique: mocks.templateFindUnique },
    mediaRelease: {
      create: mocks.releaseCreate,
      findFirst: mocks.releaseFindFirst,
      update: mocks.releaseUpdate,
    },
    sourceAsset: { upsert: mocks.sourceUpsert },
    mediaVariant: { upsert: mocks.variantUpsert },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/lib/cloudinary", () => ({
  cloudinaryClient: () => ({ utils: { api_sign_request: mocks.signRequest } }),
  verifyCloudinaryUploadResponse: mocks.verifyUpload,
  verifyCloudinaryWebhook: mocks.verifyWebhook,
}));
vi.mock("@/lib/env", () => ({
  serverEnv: () => ({
    CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "public-key",
    CLOUDINARY_API_SECRET: "server-secret",
    CLOUDINARY_UPLOAD_PRESET: "mediaops_release_v1",
    CLOUDINARY_WEBHOOK_URL: "https://example.com/api/webhooks/cloudinary",
  }),
}));

import { POST as createRelease } from "./releases/route";
import { POST as createUploadSignature } from "./releases/[id]/upload-signature/route";
import { POST as completeUpload } from "./releases/[id]/upload-complete/route";
import { POST as receiveWebhook } from "./webhooks/cloudinary/route";

const ownerId = "a9f57f14-b526-4496-a7ce-16a1a03c42f8";
const brandId = "b5db7fd4-676f-4b64-8302-a3359bb07f42";
const releaseId = "e1df4ec0-dc38-41a1-9c7d-84d041b48fde";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.apiUser.mockResolvedValue({ id: ownerId, email: "owner@example.com" });
  mocks.transaction.mockResolvedValue([]);
  mocks.signRequest.mockReturnValue("signed-value");
});

describe("release API contracts", () => {
  it("requires authentication before creating a release", async () => {
    mocks.apiUser.mockResolvedValue(null);
    const response = await createRelease(new Request("https://example.com/api/releases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }));

    expect(response.status).toBe(401);
    expect(mocks.releaseCreate).not.toHaveBeenCalled();
  });

  it("creates a draft only with an owned brand and versioned template", async () => {
    mocks.brandFindFirst.mockResolvedValue({ id: brandId });
    mocks.templateFindUnique.mockResolvedValue({ id: "template-v1" });
    mocks.releaseCreate.mockResolvedValue({ id: releaseId, status: "DRAFT" });

    const response = await createRelease(new Request("https://example.com/api/releases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Production smoke release",
        eventName: "MediaOps verification",
        campaign: "event-recap",
        speaker: "",
        assetType: "keynote-photo",
        caption: "Contract test",
        brandProfileId: brandId,
        templateKey: "event-recap",
      }),
    }));

    expect(response.status).toBe(201);
    expect(mocks.brandFindFirst).toHaveBeenCalledWith({ where: { id: brandId, ownerId } });
    expect(mocks.releaseCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ ownerId, brandProfileId: brandId, templateVersionId: "template-v1" }),
    }));
  });

  it("signs only server-constructed upload parameters for an owned draft", async () => {
    mocks.releaseFindFirst.mockResolvedValue({
      id: releaseId,
      ownerId,
      generation: 1,
      status: "DRAFT",
      brandProfile: { logoPublicId: null },
    });

    const response = await createUploadSignature(
      new Request(`https://example.com/api/releases/${releaseId}/upload-signature`, { method: "POST" }),
      { params: Promise.resolve({ id: releaseId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.releaseFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: releaseId, ownerId, status: { in: ["DRAFT", "FAILED"] } },
    }));
    expect(mocks.signRequest).toHaveBeenCalledWith(expect.objectContaining({
      public_id: `mediaops/${ownerId}/${releaseId}/master`,
      upload_preset: "mediaops_release_v1",
      eager_async: true,
    }), "server-secret");
    expect(body).not.toHaveProperty("apiSecret");
    expect(body.signature).toBe("signed-value");
  });

  it("rejects an oversized provider response before persisting the source", async () => {
    mocks.releaseFindFirst.mockResolvedValue({ id: releaseId, ownerId, generation: 1, status: "UPLOADING" });
    const response = await completeUpload(new Request(
      `https://example.com/api/releases/${releaseId}/upload-complete?generation=1`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          asset_id: "asset", public_id: `mediaops/${ownerId}/${releaseId}/master`, version: 1,
          width: 2000, height: 1200, bytes: MAX_UPLOAD_BYTES + 1, format: "jpg",
          resource_type: "image", type: "upload", secure_url: "https://example.com/master.jpg",
          created_at: new Date().toISOString(), signature: "provider-signature",
        }),
      },
    ), { params: Promise.resolve({ id: releaseId }) });

    expect(response.status).toBe(400);
    expect(mocks.verifyUpload).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("webhook boundary", () => {
  it("rejects a forged notification before opening a transaction", async () => {
    mocks.verifyWebhook.mockReturnValue(false);
    const response = await receiveWebhook(new Request(
      "https://example.com/api/webhooks/cloudinary?generation=1",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-cld-timestamp": String(Math.floor(Date.now() / 1000)),
          "x-cld-signature": "forged",
        },
        body: JSON.stringify({ public_id: `mediaops/${ownerId}/${releaseId}/master` }),
      },
    ));

    expect(response.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
