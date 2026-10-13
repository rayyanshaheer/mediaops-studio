# 09. Implementation Plan

## Phase 0: Confirm account capabilities

- [ ] Create or select the Cloudinary product environment.
- [ ] Record account limits relevant to uploads and transformations.
- [ ] Test automatic gravity on three representative event photos.
- [ ] Test a logo overlay transformation.
- [ ] Confirm the webhook verification procedure from current Cloudinary documentation.
- [ ] Decide how to expose localhost over HTTPS during development.
- [ ] Answer the blocking questions in `03_QUESTIONS_AND_DECISIONS.md`.

Exit condition: one manual upload can produce the four desired transformations in the Cloudinary Console or a small script.

## Phase 1: Application foundation

- [ ] Create the Next.js TypeScript application.
- [ ] Configure ESLint, formatting, Vitest, and Playwright.
- [ ] Add environment validation.
- [ ] Add PostgreSQL and Prisma.
- [ ] Define the release, asset, variant, event, brand, and template models.
- [ ] Seed one user, brand profile, and Event Recap template.
- [ ] Add Docker development configuration.

Exit condition: the app, database, migration, and seed run locally from documented commands.

## Phase 2: Release workflow

- [ ] Build release creation and detail pages.
- [ ] Validate release metadata with Zod.
- [ ] Implement ownership checks.
- [ ] Implement the release state machine.
- [ ] Display processing status and failure messages.
- [ ] Add API tests for allowed and rejected transitions.

Exit condition: a user can create a draft and the backend enforces transition rules.

## Phase 3: Cloudinary upload

- [ ] Configure the signed upload preset.
- [ ] Implement the upload-signature endpoint.
- [ ] Construct public IDs and metadata on the server.
- [ ] Implement direct browser upload with progress.
- [ ] Record the upload response as an optimistic signal.
- [ ] Persist the trusted source asset after provider confirmation.
- [ ] Test expired signatures and rejected file types.

Exit condition: image bytes travel from browser to Cloudinary without passing through the application server.

## Phase 4: Transformations and webhooks

- [ ] Implement the typed recipe registry.
- [ ] Add four eager fixed-format transformations.
- [ ] Apply automatic gravity and logo overlays.
- [ ] Configure the eager notification URL.
- [ ] Implement raw-body webhook receipt and signature verification.
- [ ] Add idempotent event persistence.
- [ ] Upsert current-generation variants.
- [ ] Calculate release readiness transactionally.
- [ ] Add fixtures for duplicate and out-of-order events.

Exit condition: a real upload reaches `READY` through verified notifications and remains correct after webhook replay.

## Phase 5: Preview and release package

- [x] Build the four-variant preview grid.
- [x] Display dimensions, format, and bytes.
- [x] Add fixed JPG download actions.
- [x] Add copyable responsive delivery URLs.
- [x] Implement the release manifest endpoint.
- [x] Calculate source-to-output byte comparisons.
- [x] Add accessible labels, keyboard controls, and alt text.

Exit condition: the complete three-minute demo works from a fresh release.

## Phase 6: Production hardening

- [x] Add request IDs and structured logging.
- [x] Rate-limit signature creation and cap retry generations.
- [x] Redact secrets and signatures from logs.
- [x] Add health and readiness endpoints.
- [x] Add reconciliation in dry-run mode.
- [x] Add CI checks for lint, types, unit tests, integration tests, and build.
- [x] Deploy the app and database.
- [x] Configure the production webhook URL.
- [x] Run a production smoke test.

Exit condition: a deployed release completes successfully and failed requests can be diagnosed from logs.

## Phase 7: Milestone packaging

- [ ] Write the root README with screenshots and architecture summary.
- [ ] Add `.env.example` without secrets.
- [ ] Document Cloudinary preset setup.
- [ ] Record the demo video.
- [ ] Publish a seeded demo release.
- [ ] Write the Creator Milestone post.
- [ ] Add project, demo, and source links.
- [ ] Check every public link in a signed-out browser.

## Suggested seven-day schedule

| Day | Work |
|---:|---|
| 1 | Account spike, project setup, database schema, seed data |
| 2 | Release workflow and signed direct upload |
| 3 | Recipes, automatic gravity, overlays, eager transformations |
| 4 | Webhook verification, idempotency, and state calculation |
| 5 | Preview grid, downloads, responsive URLs, manifest |
| 6 | Tests, Docker, CI, deployment, logging |
| 7 | UI polish, screenshots, demo recording, milestone post |

## Scope-cut order

If time runs short, cut features in this order:

1. Manual focal-point override
2. Batch download
3. Rich processing timeline UI
4. Multiple brand profiles
5. Text overlays

Do not cut signed upload, real Cloudinary transformations, webhook reliability, four visible outputs, or the deployed demo.
