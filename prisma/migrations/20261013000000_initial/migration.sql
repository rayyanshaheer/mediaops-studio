-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('DRAFT', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "WatermarkGravity" AS ENUM ('NORTH_WEST', 'NORTH_EAST', 'SOUTH_WEST', 'SOUTH_EAST');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logoAssetId" TEXT,
    "logoPublicId" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#d65a31',
    "watermarkGravity" "WatermarkGravity" NOT NULL DEFAULT 'SOUTH_EAST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransformationTemplateVersion" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransformationTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaRelease" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "brandProfileId" UUID NOT NULL,
    "templateVersionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "speaker" TEXT,
    "assetType" TEXT NOT NULL,
    "caption" TEXT,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'DRAFT',
    "generation" INTEGER NOT NULL DEFAULT 1,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readyAt" TIMESTAMP(3),

    CONSTRAINT "MediaRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceAsset" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "cloudinaryAssetId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'image',
    "deliveryType" TEXT NOT NULL DEFAULT 'upload',
    "format" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" BIGINT NOT NULL,
    "etag" TEXT,
    "secureUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaVariant" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "generation" INTEGER NOT NULL,
    "recipeKey" TEXT NOT NULL,
    "recipeVersion" INTEGER NOT NULL,
    "status" "VariantStatus" NOT NULL DEFAULT 'PENDING',
    "transformation" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "bytes" BIGINT,
    "secureUrl" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingEvent" (
    "id" UUID NOT NULL,
    "releaseId" UUID,
    "provider" TEXT NOT NULL DEFAULT 'cloudinary',
    "eventType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerTimestamp" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,

    CONSTRAINT "ProcessingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TransformationTemplateVersion_key_version_key" ON "TransformationTemplateVersion"("key", "version");

-- CreateIndex
CREATE INDEX "MediaRelease_ownerId_createdAt_idx" ON "MediaRelease"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MediaRelease_status_updatedAt_idx" ON "MediaRelease"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SourceAsset_releaseId_key" ON "SourceAsset"("releaseId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceAsset_cloudinaryAssetId_key" ON "SourceAsset"("cloudinaryAssetId");

-- CreateIndex
CREATE INDEX "MediaVariant_releaseId_generation_status_idx" ON "MediaVariant"("releaseId", "generation", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MediaVariant_releaseId_generation_recipeKey_key" ON "MediaVariant"("releaseId", "generation", "recipeKey");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingEvent_idempotencyKey_key" ON "ProcessingEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ProcessingEvent_releaseId_receivedAt_idx" ON "ProcessingEvent"("releaseId", "receivedAt" DESC);

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelease" ADD CONSTRAINT "MediaRelease_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelease" ADD CONSTRAINT "MediaRelease_brandProfileId_fkey" FOREIGN KEY ("brandProfileId") REFERENCES "BrandProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelease" ADD CONSTRAINT "MediaRelease_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "TransformationTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceAsset" ADD CONSTRAINT "SourceAsset_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "MediaRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaVariant" ADD CONSTRAINT "MediaVariant_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "MediaRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingEvent" ADD CONSTRAINT "ProcessingEvent_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "MediaRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
