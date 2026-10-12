# 10. Testing, Deployment, and Operations

## Test strategy

### Unit tests

- Recipe configuration produces expected dimensions and format.
- Public ID construction rejects unsafe input.
- Release state transitions reject invalid movement.
- Readiness calculation requires every current-generation variant.
- Manifest serialization excludes internal fields.
- Byte-saving calculations handle missing and zero values.

### Integration tests

- Signature endpoint requires authentication and ownership.
- Signature endpoint signs only allowlisted parameters.
- Release creation persists template version and brand profile.
- Valid webhook creates an event and updates variants.
- Invalid webhook does not change state.
- Duplicate webhook returns success without duplicate variants.
- Out-of-order events produce the correct aggregate state.
- Stale-generation event cannot complete a regenerated release.

Use recorded, sanitized provider payload fixtures. Keep at least one contract smoke test against a real Cloudinary test environment.

### End-to-end tests

1. Create a release.
2. Upload a supported image through a test-safe path.
3. Observe processing state.
4. Reach `READY` through a webhook fixture or test environment.
5. Preview all variants.
6. Download one fixed export.
7. Open the manifest.

### Manual media checks

Test at least these source compositions:

- One centered speaker
- Speaker close to an edge
- Two people
- Large banner text behind the subject
- Portrait source converted to landscape
- Landscape source converted to vertical

Record crops that fail so the focal-point feature has evidence behind it.

## CI pipeline

Run these jobs on every pull request:

1. Install dependencies from the lockfile.
2. Validate formatting.
3. Run lint.
4. Run TypeScript checks.
5. Run unit and integration tests.
6. Build the production application.
7. Run database migration validation.

Run browser tests against a deployed preview or a containerized test stack when practical.

## Environments

| Environment | Purpose | Cloudinary setup |
|---|---|---|
| Local | Development | Development folder or product environment |
| CI | Deterministic checks | Mocked APIs and sanitized fixtures |
| Preview | Pull-request testing | Separate folder/prefix and webhook URL |
| Production | Public milestone demo | Production preset and webhook URL |

Never let CI delete shared production assets.

## Environment variables

```text
DATABASE_URL
AUTH_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_PRESET
CLOUDINARY_WEBHOOK_URL
APP_BASE_URL
LOG_LEVEL
```

Validate required variables at startup. Do not commit real values.

## Health checks

### Liveness

`GET /api/health/live` confirms that the process can serve requests.

### Readiness

`GET /api/health/ready` checks the database and required configuration. Avoid calling Cloudinary on every health probe.

## Deployment checklist

- [ ] Production database exists and accepts encrypted connections.
- [ ] Migrations ran successfully.
- [ ] Runtime secrets exist only in the hosting secret store.
- [ ] Application base URL uses HTTPS.
- [ ] Cloudinary preset has the expected restrictions.
- [ ] Cloudinary notification URL points to production HTTPS.
- [ ] Webhook signature verification passes a real notification.
- [ ] CORS and content-security policy allow only required media and upload hosts.
- [ ] Signature endpoint has rate limiting.
- [ ] Logs redact secrets and request signatures.
- [ ] Demo seed does not contain private data.
- [ ] A signed-out user can open only intended public pages.

## Operational runbook

### Release stuck in `UPLOADING`

1. Search logs by release ID.
2. Check whether the browser received an upload response.
3. Search Cloudinary by release tag or public ID.
4. Run reconciliation in dry-run mode.
5. Repair the source reference or mark the attempt failed.

### Release stuck in `PROCESSING`

1. Inspect processing events.
2. Identify missing recipe keys for the current generation.
3. Inspect the Cloudinary transformation error.
4. Correct configuration before retrying.
5. Regenerate only missing or failed required variants.

### Sudden verification failures

1. Confirm server clock accuracy.
2. Confirm the raw request body reaches verification unchanged.
3. Check whether credentials rotated.
4. Compare headers and signing input with current Cloudinary documentation.
5. Do not disable verification to restore service.
