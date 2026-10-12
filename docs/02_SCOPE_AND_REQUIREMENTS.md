# 02. MVP Scope and Requirements

## MVP user flow

1. The user signs in.
2. The user creates a draft release.
3. The user enters event, campaign, speaker, and asset-type metadata.
4. The user selects the Event Recap template and default brand profile.
5. The browser requests an upload signature from the backend.
6. The browser uploads the image directly to Cloudinary.
7. Cloudinary starts required eager transformations.
8. The backend receives and verifies Cloudinary notifications.
9. The release becomes `READY` when every required fixed export exists.
10. The user previews, downloads, or copies each result.

## Required output recipes

| Key | Intended use | Dimensions | Aspect ratio | Download format |
|---|---|---:|---:|---|
| `instagram-square` | Instagram feed | 1080 × 1080 | 1:1 | JPG |
| `instagram-portrait` | Instagram feed | 1080 × 1350 | 4:5 | JPG |
| `linkedin-landscape` | LinkedIn post | 1200 × 627 | about 1.91:1 | JPG |
| `story-vertical` | Story/reel cover | 1080 × 1920 | 9:16 | JPG |

The website preview uses responsive widths rather than one fixed export.

## Functional requirements

### Release management

- Create and view releases.
- Save a release as a draft before upload.
- Store title, event, campaign, speaker, asset type, and optional caption.
- Show current processing state and failure reason.
- Prevent release publication until required variants are ready.

### Upload

- Generate upload signatures on the server.
- Upload directly from the browser to Cloudinary.
- Restrict input to supported image types and a configured size limit.
- Reject unsigned client-selected transformation parameters.
- Persist the Cloudinary asset ID, public ID, version, dimensions, bytes, and format.

### Transformation

- Generate the four fixed recipes.
- Use automatic gravity for the initial crop.
- Apply the configured logo overlay.
- Apply consistent padding and safe margins.
- Use an explicit JPG format for downloads.
- Use automatic format and quality for browser previews.

### Processing

- Receive Cloudinary upload and eager-transformation notifications.
- Verify webhook authenticity before changing state.
- Process repeated notifications idempotently.
- Record every accepted processing event.
- Mark a release `FAILED` when a required derivative fails.

### Preview and delivery

- Display the original beside all variants.
- Show dimensions, format, and byte size.
- Download each fixed export.
- Copy each CDN URL.
- Copy a responsive website URL.
- Display aggregate byte savings where comparable.

### Release manifest

- Return a machine-readable JSON representation of the release.
- Include source identity, metadata, template version, and output variants.
- Exclude Cloudinary secrets and internal webhook data.

## Non-functional requirements

| Area | Requirement |
|---|---|
| Security | Cloudinary API secret never reaches the browser |
| Performance | API responses unrelated to upload complete within 500 ms under demo load |
| Reliability | Webhook retries produce the same final state |
| Traceability | Every upload and webhook carries a release or correlation ID |
| Accessibility | Keyboard-accessible controls, labels, alt text, and visible focus states |
| Maintainability | Transformation recipes live in typed configuration, not UI components |
| Portability | Local development starts through documented commands or Docker Compose |
| Cost control | MVP limits file size and number of generated eager variants |

## Out of scope

- Video processing
- Batch upload
- Free-form design canvas
- Arbitrary user-defined transformations
- Multiple organizations or role hierarchies
- Billing and subscriptions
- Publishing directly to social-network APIs
- Automatic copywriting
- AI background generation
- Full digital asset management replacement

## MVP acceptance scenario

Given a signed-in user and a valid landscape event photo, when the user creates a release and uploads the photo, then the application records the master, waits for Cloudinary processing, shows four branded crops, offers fixed JPG downloads, provides an optimized website URL, and reports processing events without duplicating them after webhook retries.
