# 07. API and Webhook Contracts

## API conventions

- Prefix application endpoints with `/api`.
- Use JSON except for direct browser-to-Cloudinary upload.
- Return stable error codes.
- Include a request ID in responses and logs.
- Validate route parameters and bodies with Zod.
- Authorize access by release ownership.

## Endpoints

### `POST /api/releases`

Creates a draft release.

```json
{
  "title": "FAST Dev Day Keynote",
  "eventName": "FAST Dev Day",
  "campaign": "event-recap",
  "speaker": "Example Speaker",
  "assetType": "keynote-photo",
  "brandProfileId": "uuid",
  "templateKey": "event-recap"
}
```

Response: `201 Created` with the release resource.

### `POST /api/releases/{releaseId}/upload-signature`

Checks ownership and draft state, constructs allowlisted upload parameters, advances the release to `UPLOADING`, and returns:

```json
{
  "cloudName": "example",
  "apiKey": "public-api-key",
  "timestamp": 1791234567,
  "signature": "generated-signature",
  "uploadPreset": "mediaops_release_v1",
  "publicId": "mediaops/user-id/release-id/master",
  "tags": ["mediaops", "release:release-id"]
}
```

The response never includes the API secret.

### `POST /api/releases/{releaseId}/upload-complete`

Records the direct-upload response as an optimistic client signal. The backend validates returned identifiers and waits for a trusted Cloudinary notification before declaring all work ready.

### `GET /api/releases/{releaseId}`

Returns release metadata, source information, variants, and current status.

### `GET /api/releases/{releaseId}/manifest`

Returns the stable release manifest when status is `READY`. Return `409 RELEASE_NOT_READY` during processing.

### `POST /api/releases/{releaseId}/retry`

Retries application-side reconciliation or starts a new generation after an allowed failure. It must not create unlimited Cloudinary transformations.

### `POST /api/releases/{releaseId}/focal-point`

Optional MVP extension. Validates normalized coordinates, increments generation, regenerates required outputs, and moves the release to `PROCESSING`.

### `POST /api/webhooks/cloudinary`

Public endpoint for Cloudinary notifications. It does not use user-session authentication. It requires provider-specific signature verification and replay protection.

## Error format

```json
{
  "error": {
    "code": "RELEASE_NOT_READY",
    "message": "The required media variants are still processing.",
    "requestId": "req_01J..."
  }
}
```

Do not expose stack traces, SQL errors, secrets, or full provider payloads.

## Webhook algorithm

```text
receive raw body
  → validate content type and size
  → validate provider timestamp
  → verify signature with constant-time comparison
  → compute idempotency key
  → begin transaction
      → insert event, or detect duplicate
      → resolve release and generation
      → ignore stale generation
      → upsert matching variants
      → derive aggregate release status
    commit
  → return 2xx
```

## Idempotency

Prefer a provider event ID when the payload supplies one. Otherwise hash a canonical set of stable values such as notification type, asset ID, public ID, transformation identifier, status, and provider timestamp.

Do not use the raw JSON string directly because key ordering can change.

## Readiness rule

A release is `READY` only when:

1. The source asset exists.
2. The source belongs to the release.
3. Every required recipe for the current generation has status `READY`.
4. No required recipe for the current generation has status `FAILED`.

## Polling

The MVP can poll `GET /api/releases/{id}` every two seconds while processing. Stop polling at `READY`, `FAILED`, or `ARCHIVED`. Server-sent events can replace polling later.
