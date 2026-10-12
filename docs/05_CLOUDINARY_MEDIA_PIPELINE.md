# 05. Cloudinary Media Pipeline

## Asset strategy

Upload one master image per release. Generate derivatives from that master. Do not upload separately edited copies for each channel.

Use a deterministic public ID:

```text
mediaops/{ownerId}/{releaseId}/master
```

Store logos under:

```text
mediaops/brands/{brandProfileId}/logo
```

The database should use Cloudinary's immutable asset ID as the durable external identity and retain the public ID, resource type, version, and delivery type needed to build URLs.

## Upload contract

The browser asks the backend for a signature after it creates a draft release. The backend signs an allowlisted set of parameters:

- Timestamp
- Public ID or asset folder
- Upload preset
- Tags
- Context or structured metadata values
- Notification URL when applicable
- Eager transformation set when not fully defined by the preset

The backend must not sign arbitrary parameters copied from the request body.

## Upload preset

Configure the preset to enforce:

- Image resource type
- Allowed formats such as JPEG, PNG, and WebP
- Maximum supported file size
- Unique naming policy
- Required tags
- Eager asynchronous transformations
- Eager completion notification URL

Document the preset in source control even if the team creates it manually in the Cloudinary Console.

## Recipe registry

Keep transformation definitions in a typed module. Each recipe needs:

```ts
type ReleaseRecipe = {
  key: string;
  version: number;
  width: number;
  height: number;
  crop: "fill";
  gravity: "auto" | string;
  format: "jpg";
  quality: string | number;
  overlay: {
    publicId: string;
    gravity: string;
    widthRatio: number;
    offsetX: number;
    offsetY: number;
  };
};
```

The database records the recipe key and version used for each derivative. A later recipe change must not silently alter the meaning of an existing release.

## Fixed export pipeline

Fixed exports support predictable downloads. Generate them eagerly and asynchronously:

1. Resize and crop to exact channel dimensions.
2. Use automatic gravity for the first composition.
3. Apply the logo with safe offsets.
4. Convert to JPG.
5. Apply a chosen export quality.
6. Confirm the derived resource through the eager completion payload.

Do not use `f_auto` for a download that promises a JPG file. The requested browser could otherwise receive another format.

## Responsive website pipeline

Website delivery should remain dynamic. Build URLs with:

- A layout-specific width or responsive breakpoint
- `dpr_auto` when appropriate
- `q_auto`
- `f_auto`
- Automatic gravity when the component requires a crop

The same source can therefore serve a small mobile card and a large desktop banner without storing extra uploaded copies.

## Metadata plan

### Cloudinary asset metadata

| Field | Example | Purpose |
|---|---|---|
| `release_id` | UUID | Correlates asset and application record |
| `event_name` | FAST Dev Day | Asset discovery |
| `campaign` | event-recap | Campaign filtering |
| `speaker` | Speaker name | Search and context |
| `asset_type` | keynote-photo | Classification |
| `template_key` | event-recap | Reproducibility |
| `template_version` | 1 | Reproducibility |

### Application metadata

PostgreSQL remains authoritative for workflow state, ownership, error details, and processing history. Cloudinary remains authoritative for asset properties such as bytes, dimensions, format, public ID, asset ID, and derived resources.

## Tags

Use tags for broad grouping:

```text
mediaops
release:{releaseId}
event:{normalizedEventSlug}
template:event-recap-v1
```

Do not encode sensitive or frequently changing data in tags.

## Webhook handling

The receiver should:

1. Read the raw request body if signature verification requires it.
2. Validate the timestamp and signature.
3. Reject stale or invalid notifications.
4. Derive an idempotency key from stable event attributes.
5. Store the event before applying state changes.
6. Upsert variant results.
7. Recalculate release readiness in one transaction.
8. Return a success response after durable persistence.

Never assume webhook ordering. An eager-completion notification can race with the browser reporting upload success.

## Manual focal-point override

Treat focal correction as regeneration:

1. User chooses a point or region on the master preview.
2. Application saves the override with the release.
3. Recipe generation replaces automatic gravity with approved coordinates or a custom focus area.
4. Application increments the generation number.
5. Required variants return to `PROCESSING`.
6. New webhook results attach to the new generation only.

If time is short, ship automatic gravity first and document focal correction as the first post-MVP feature.

## Release manifest

The ready manifest should resemble:

```json
{
  "releaseId": "5e36f6f5-03ef-42a8-a0c6-7df98b5b7372",
  "status": "READY",
  "template": { "key": "event-recap", "version": 1 },
  "source": {
    "assetId": "cloudinary-asset-id",
    "publicId": "mediaops/user/release/master",
    "width": 4032,
    "height": 3024,
    "bytes": 8420192
  },
  "metadata": {
    "event": "FAST Dev Day",
    "campaign": "event-recap",
    "speaker": "Example Speaker"
  },
  "variants": [
    {
      "key": "linkedin-landscape",
      "width": 1200,
      "height": 627,
      "format": "jpg",
      "bytes": 182430,
      "downloadUrl": "https://res.cloudinary.com/..."
    }
  ]
}
```

## Cost controls

- Limit source file size.
- Generate only required eager variants.
- Avoid regenerating variants on every page load.
- Reuse deterministic transformations.
- Keep demo assets short in count and clear unused test assets during development through an explicit maintenance procedure.
- Display failures without repeatedly retrying an invalid transformation.
