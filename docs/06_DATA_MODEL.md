# 06. Data Model

## Entity overview

```text
User 1 ── * MediaRelease * ── 1 BrandProfile
                    │
                    ├── 1 SourceAsset
                    ├── * MediaVariant
                    ├── * ProcessingEvent
                    └── 1 TransformationTemplateVersion
```

## `User`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | string | Unique |
| `name` | string | Display name |
| `createdAt` | timestamp | Audit field |

## `BrandProfile`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `ownerId` | UUID | Foreign key to user |
| `name` | string | Example: CCC Demo Brand |
| `logoAssetId` | string | Cloudinary immutable asset ID |
| `logoPublicId` | string | Used in overlay transformations |
| `primaryColor` | string | Validated hex value |
| `watermarkGravity` | enum | Allowlisted positions |
| `createdAt` | timestamp | Audit field |
| `updatedAt` | timestamp | Audit field |

## `TransformationTemplateVersion`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `key` | string | Example: `event-recap` |
| `version` | integer | Unique with key |
| `definition` | JSON | Validated recipe snapshot |
| `active` | boolean | Available for new releases |
| `createdAt` | timestamp | Immutable creation time |

## `MediaRelease`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Aggregate identity |
| `ownerId` | UUID | Authorization boundary |
| `brandProfileId` | UUID | Applied brand |
| `templateVersionId` | UUID | Recipe snapshot |
| `title` | string | User-facing name |
| `eventName` | string | Required metadata |
| `campaign` | string | Required metadata |
| `speaker` | string nullable | Optional metadata |
| `assetType` | string | Controlled vocabulary |
| `caption` | text nullable | Optional publishing copy |
| `status` | enum | `DRAFT`, `UPLOADING`, `PROCESSING`, `READY`, `FAILED`, `ARCHIVED` |
| `generation` | integer | Increments on regeneration |
| `failureCode` | string nullable | Stable machine code |
| `failureMessage` | string nullable | Safe user-facing summary |
| `createdAt` | timestamp | Audit field |
| `updatedAt` | timestamp | Audit field |
| `readyAt` | timestamp nullable | Processing metric |

## `SourceAsset`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `releaseId` | UUID | Unique foreign key |
| `cloudinaryAssetId` | string | Unique immutable external identity |
| `publicId` | string | Cloudinary delivery identifier |
| `version` | integer | Asset version |
| `resourceType` | string | Expected `image` |
| `deliveryType` | string | Expected `upload` for MVP |
| `format` | string | Original format |
| `width` | integer | Original width |
| `height` | integer | Original height |
| `bytes` | bigint | Original byte count |
| `etag` | string nullable | Reconciliation support |
| `uploadedAt` | timestamp | Cloudinary upload time |

## `MediaVariant`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `releaseId` | UUID | Parent aggregate |
| `generation` | integer | Prevents stale webhook updates |
| `recipeKey` | string | Example: `instagram-square` |
| `recipeVersion` | integer | Reproducibility |
| `status` | enum | `PENDING`, `READY`, `FAILED` |
| `transformation` | string | Canonical transformation string or JSON |
| `width` | integer nullable | Derived width |
| `height` | integer nullable | Derived height |
| `format` | string nullable | Derived format |
| `bytes` | bigint nullable | Derived byte count |
| `secureUrl` | text nullable | Fixed export URL |
| `errorCode` | string nullable | Transformation failure |
| `createdAt` | timestamp | Audit field |
| `updatedAt` | timestamp | Audit field |

Unique constraint:

```text
(releaseId, generation, recipeKey)
```

## `ProcessingEvent`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `releaseId` | UUID nullable | May be unresolved on initial receipt |
| `provider` | string | `cloudinary` |
| `eventType` | string | Normalized internal type |
| `idempotencyKey` | string | Unique |
| `signatureValid` | boolean | Verification outcome |
| `receivedAt` | timestamp | Local receipt time |
| `providerTimestamp` | timestamp nullable | Replay protection |
| `payload` | JSON | Redacted raw payload |
| `processedAt` | timestamp nullable | Handler completion |
| `processingError` | text nullable | Internal diagnostic |

## Indexes

- `MediaRelease(ownerId, createdAt desc)`
- `MediaRelease(status, updatedAt)`
- `SourceAsset(cloudinaryAssetId)` unique
- `MediaVariant(releaseId, generation, status)`
- `ProcessingEvent(idempotencyKey)` unique
- `ProcessingEvent(releaseId, receivedAt desc)`

## Data ownership rules

1. A release owns its source reference, variants, and events.
2. A template version becomes immutable after use.
3. Deleting a release requires an explicit policy for Cloudinary assets.
4. Archiving is safer than deletion for the milestone.
5. A stale generation cannot change the current release state.
