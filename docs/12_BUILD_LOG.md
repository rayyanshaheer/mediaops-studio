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

The code can be built and tested without production credentials. A live deployment additionally needs:

1. A PostgreSQL production connection string.
2. Cloudinary cloud name, API key, API secret, signed upload preset, and optionally a logo public ID.
3. A production `AUTH_SECRET`, owner email, and password.
4. The selected deployment host and its authenticated CLI or connected Git repository.

After deployment, the Cloudinary webhook URL must be set to `https://<deployment>/api/webhooks/cloudinary`, and one real upload must be smoke-tested.

## Verification record

- `npm run lint`: passed with no warnings.
- `npm run typecheck`: passed under strict TypeScript.
- `npm test`: 5 domain tests passed.
- `npm run build`: passed; all pages and route handlers compiled.
- Desktop browser check: sign-in layout and accessible control names verified.
- Mobile browser check: 390 × 844 layout verified without horizontal overflow.
- Login failure check: incorrect credentials produce the expected visible error.
- PostgreSQL runtime check: deferred because Docker Desktop and the local PostgreSQL daemon are unavailable on this machine.
- Registry audit: runtime packages are clean except findings reachable only through the development-only Prisma CLI. The reported `deepmerge-ts` and `mysql2` packages are not imported by the deployed application.

## Deployment gate

Next.js 16.4.0 is the current stable release as of this build. The Next.js team has announced an upstream security update for 2026-10-14. Apply that update and repeat the verification commands before making the public deployment permanent.
