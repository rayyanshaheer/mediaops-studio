# 08. Security and Reliability

## Protected assets

- Cloudinary API secret
- Database credentials
- Upload-signing capability
- Brand logo assets
- User-owned release metadata
- Webhook state transitions
- Transformation and account quota

## Threats and controls

| Threat | Control |
|---|---|
| API secret exposed to browser | Generate signatures on the server and return only public credentials plus signature |
| User signs arbitrary transformations | Construct an allowlisted parameter object on the server |
| Unauthenticated user uploads into the account | Require an authenticated release and short-lived signature |
| Oversized or unsupported upload | Enforce client hints and Cloudinary preset limits |
| Forged webhook | Verify signature and timestamp against the raw body or documented provider input |
| Webhook replay | Reject stale timestamps and enforce unique idempotency keys |
| Duplicate notification | Insert event with a unique key and use upserts |
| Out-of-order notification | Derive state from stored current-generation variants rather than event order |
| Cross-user access | Check `ownerId` on every release operation |
| Transformation abuse | Allow only predefined recipe keys and cap regeneration |
| Stored XSS in metadata | Validate input and render text through escaped framework bindings |
| Secret leakage in logs | Redact credentials, signatures, cookies, and authorization headers |
| Stale derivative changes current release | Match release generation before update |

## Signature endpoint rules

1. Authenticate the user.
2. Load the release and verify ownership.
3. Require `DRAFT` or an approved retry state.
4. Construct the public ID on the server.
5. Select the preset and recipes on the server.
6. Use a fresh timestamp.
7. Return the minimum client configuration.
8. Rate-limit signature creation by user and release.

## Webhook response policy

- Return `2xx` after durable processing or safe duplicate detection.
- Return `4xx` for invalid signatures or malformed payloads.
- Return `5xx` for temporary internal failures so the provider can retry.
- Keep the handler short. Move expensive secondary work to a worker only when needed.

## Failure modes

| Failure | Expected behavior |
|---|---|
| Upload request expires | UI requests a new signature |
| Browser closes after direct upload | Webhook still associates the asset through release metadata |
| Database unavailable during webhook | Handler returns retryable failure and logs request ID |
| One derivative fails | Release moves to `FAILED` with failed recipe visible |
| Webhook arrives twice | Second event returns success without duplicating state |
| Old generation finishes late | Event is stored but cannot update current variants |
| Logo asset missing | Transformation fails with a stable configuration error |
| Cloudinary quota reached | UI shows provider-capacity failure and blocks automatic retry loops |

## Observability

### Log fields

- `requestId`
- `releaseId`
- `generation`
- `cloudinaryAssetId`
- `publicId`
- `eventType`
- `idempotencyKey`
- `previousStatus`
- `nextStatus`
- `durationMs`
- `errorCode`

### Metrics

- Uploads started and completed
- Transformation success rate by recipe
- Time from upload confirmation to `READY`
- Webhook verification failures
- Duplicate webhook count
- Releases in `PROCESSING` longer than the expected window
- Source bytes compared with variant bytes

## Recovery and reconciliation

Add an admin-only reconciliation command or script that:

1. Finds releases stuck in `UPLOADING` or `PROCESSING`.
2. Fetches matching asset information from Cloudinary.
3. Reconstructs missing source or variant records.
4. Reapplies the readiness rule.
5. Records a reconciliation event.

This command should default to dry-run mode.

## Data retention

For the milestone, archive releases instead of deleting them. Before adding deletion, decide whether deletion removes the database record, Cloudinary master, derived resources, or all three. Require explicit confirmation and record an audit event.
