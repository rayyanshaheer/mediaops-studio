# Build log

This file records the implementation work completed alongside the source. It is intentionally separate from the original product specification so the intended design and the delivered state are easy to compare.

## 2026-10-13 — Foundation

- Created the Next.js 16 App Router application with strict TypeScript and Tailwind CSS.
- Added Prisma/PostgreSQL models for users, brands, template versions, releases, source assets, variants, and processing events.
- Added a repeatable seed for the single owner, default brand, and Event Recap v1 template.
- Added Docker, local PostgreSQL Compose configuration, environment validation, ESLint, Vitest, and GitHub Actions.

## 2026-10-13 — Product workflow

- Added a signed, HTTP-only, 12-hour single-owner session and login screen.
- Added the release ledger, metadata form, release detail page, upload progress, processing polling, variant previews, downloads, and manifest access.
- Built a restrained editorial/production UI with accessible labels, focus states, responsive layouts, and reduced-motion support.

## 2026-10-13 — Cloudinary pipeline

- Added allowlisted server-side signature creation for direct browser uploads.
- Added four versioned eager JPG transformations with automatic gravity and optional logo overlay.
- Added optimistic upload acknowledgement without declaring the release ready.
- Added raw-body webhook verification, a two-hour replay window, idempotent event storage, current-generation variant upserts, and transactional readiness calculation.
- Added source/variant byte reporting and per-output savings.

## 2026-10-13 — Operations

- Added liveness and database readiness endpoints.
- Added stable API errors and request IDs.
- Added signature endpoint throttling, upload type/size checks, secret-safe configuration, and baseline security headers.
- Added a Cloudinary-scoped content security policy and global API request IDs.
- Added unit tests for recipe output, readiness, stale generations, safe public IDs, and byte savings.
- Added a dry-run-by-default reconciliation command with explicit `--apply` mode and an idempotent audit event.

## Remaining deployment inputs

The repository, host, database, Cloudinary cloud, signed upload preset, owner, and production deployment are now provisioned. Final public verification still needs:

1. An explicit decision to disable Vercel SSO protection so the app's own owner login and Cloudinary webhook are publicly reachable.
2. Vercel GitHub App access to the private repository if automatic deployments from `main` are required.

The production webhook is configured as `https://mediaops-studio.vercel.app/api/webhooks/cloudinary`. One real upload must be smoke-tested after Vercel SSO protection is disabled.

## 2026-10-13 — Deployment progress

- Created the private GitHub repository `rayyanshaheer/mediaops-studio` and preserved the old `test-repo` remote as `legacy-origin`.
- Pushed commit `ae43d5e` to `rayyan/mediaops-studio` and `main`, then selected `main` as the repository default.
- Authenticated Vercel and created the `rayyanshaheer-personalprojects/mediaops-studio` project.
- Provisioned the Neon resource `neon-carmine-engine` through the official Vercel marketplace integration.
- Connected Neon to all Vercel project environments and downloaded development credentials only into the ignored `.env.local` file.
- Applied migration `20261013000000_initial` successfully to the Neon `neondb` production schema.
- Generated a high-entropy `AUTH_SECRET` and stored it as a write-only Vercel secret for Production, Preview, and Development.
- Verified the authenticated Cloudinary CLI profile for cloud `dn1taxbpc` and confirmed Admin API access.
- Created and re-read the signed `mediaops_release_v1` upload preset (`unsigned: false`).
- Restricted the preset to JPG, JPEG, PNG, and WebP with deterministic overwrite behavior.
- Recorded the Cloudinary Free environment's 10 MB image and 25-megapixel limits, then aligned browser and server validation to the 10 MB provider cap.
- Stored the verified Cloudinary cloud name and upload preset in all Vercel environments.
- Confirmed the CLI profile is OAuth-only: it intentionally contains no API key or API secret for the app's HMAC upload signatures.
- Stored the owner login and supplied Cloudinary credentials as write-only Vercel secrets.
- Seeded Neon and verified one owner, one brand profile, and one transformation template without exposing owner data.
- Deployed successfully to `https://mediaops-studio.vercel.app` and configured that canonical base URL and webhook path.
- Verified the production liveness endpoint and Neon-backed readiness endpoint through Vercel's authenticated request path.
- Kept Vercel SSO protection enabled pending explicit approval to expose the app's own login page.
- Replaced the incorrect Cloudinary API key, verified the corrected key/secret pair against Cloudinary's API, and updated all Vercel environments.
- Pinned the deployment runtime to Node.js 22.x after Vercel warned that an open-ended engine range would auto-upgrade major versions.
- Redeployed production with the corrected Cloudinary credentials and Node.js 22.x runtime.
- Redeployed the 10 MB upload-policy correction to production and rechecked application and database health.
- Verified the production owner login reaches `/dashboard` with a 200 response through Vercel's protected request path.
- Automatic GitHub connection is pending Vercel GitHub App permission for the new private repository.
- Pinned CI to Ubuntu 24.04 and upgraded official checkout/setup actions to their Node 24-based v7 releases.

## Verification record

- `npm run lint`: passed with no warnings.
- `npm run typecheck`: passed under strict TypeScript.
- `npm test`: 12 domain and API-contract tests passed.
- API-contract checks cover authentication, owned release creation, scoped signature parameters, oversized upload rejection, and forged-webhook rejection.
- GitHub Actions: the complete `main` verification job passed for commit `d9d9554` before the action-runtime maintenance update.
- `npm run build`: passed; all pages and route handlers compiled.
- Desktop browser check: sign-in layout and accessible control names verified.
- Mobile browser check: 390 × 844 layout verified without horizontal overflow.
- Login failure check: incorrect credentials produce the expected visible error.
- Cloudinary credential check: authenticated API ping passed with the corrected production key and secret.
- PostgreSQL runtime check: Neon migration, seed, and production readiness query passed.
- Registry audit: runtime packages are clean except findings reachable only through the development-only Prisma CLI. The reported `deepmerge-ts` and `mysql2` packages are not imported by the deployed application.

## Deployment gate

Next.js 16.4.0 is the current stable release as of this build. The Next.js team has announced an upstream security update for 2026-10-14. Apply that update and repeat the verification commands before making the public deployment permanent.
