# MediaOps Studio Documentation

MediaOps Studio turns one master event image into a branded release package for multiple publishing channels. Cloudinary owns media ingestion, transformation, optimization, asset metadata, and delivery. The application owns users, release workflow, templates, status, and audit history.

## Current project decision

Build the image-first MVP before adding video, batch processing, or a free-form editor. The first release supports one brand profile, one release template, four fixed social exports, and responsive website delivery.

## Reading order

1. [Vision and success criteria](./01_VISION_AND_SUCCESS.md)
2. [MVP scope and requirements](./02_SCOPE_AND_REQUIREMENTS.md)
3. [Questions and decisions](./03_QUESTIONS_AND_DECISIONS.md)
4. [System architecture](./04_SYSTEM_ARCHITECTURE.md)
5. [Cloudinary media pipeline](./05_CLOUDINARY_MEDIA_PIPELINE.md)
6. [Data model](./06_DATA_MODEL.md)
7. [API and webhook contracts](./07_API_AND_WEBHOOK_CONTRACTS.md)
8. [Security and reliability](./08_SECURITY_AND_RELIABILITY.md)
9. [Implementation plan](./09_IMPLEMENTATION_PLAN.md)
10. [Testing, deployment, and operations](./10_TESTING_DEPLOYMENT_OPERATIONS.md)
11. [Demo and Creator Milestone submission](./11_DEMO_AND_MILESTONE.md)
12. [Implementation build log](./12_BUILD_LOG.md)
13. [Creator Milestone submission pack](./13_CREATOR_MILESTONE_SUBMISSION.md)

## Proposed stack

| Area | Choice |
|---|---|
| Web application | Next.js with TypeScript |
| API | Next.js route handlers for the MVP; extract Fastify only if needed |
| Database | PostgreSQL with Prisma |
| Media platform | Cloudinary Node SDK and browser upload API |
| Styling | Tailwind CSS or CSS Modules |
| Validation | Zod |
| Testing | Vitest, Testing Library, and Playwright |
| Packaging | Docker |
| CI | GitHub Actions |
| Hosting | Any Node-compatible platform plus managed PostgreSQL |

## Working assumptions

- The MVP processes still images only.
- One authenticated owner manages releases.
- Cloudinary stores the master and derived media.
- PostgreSQL stores workflow state and references, not image binaries.
- Fixed social exports use eager transformations.
- Website images use dynamic responsive delivery with `f_auto` and `q_auto`.
- The demo uses an event recap template and four output channels.
- A release becomes ready only after Cloudinary confirms required eager transformations.

## Definition of done

The milestone is complete when a reviewer can upload one awkward event photo, add release metadata, apply a brand profile, wait for verified processing, inspect four useful crops, download fixed-format exports, copy an optimized website URL, and view measurable byte savings.
