# 01. Vision and Success Criteria

## Product statement

MediaOps Studio is an automated media release pipeline for event organizers, student societies, communities, startups, and small marketing teams. A user uploads one approved master image. The system creates a consistent package for LinkedIn, Instagram, stories, and websites.

## Problem

Small teams prepare the same asset several times. They resize it, crop it, add a logo, export it, rename it, compress it, and move it into another folder. Each manual copy can drift from the approved source or use the wrong dimensions.

The work creates four specific problems:

1. Repetition wastes time during event coverage.
2. Manual crops can cut out a speaker or important context.
3. Teams publish oversized files that load poorly on mobile networks.
4. Files lose campaign, event, speaker, and ownership context.

## Target users

### Primary user

An event or community media manager who needs publishable assets without using a full design suite for every export.

### Secondary users

- Student society volunteers
- Developer-community organizers
- Startup marketing teams
- Conference staff
- Freelancers managing several campaign formats

## Core job to be done

When I receive an approved event photo, I want to create the required branded channel assets from one source so I can publish quickly without repeating crop and optimization work.

## Product principles

1. Keep one master asset as the source of truth.
2. Treat each group of variants as a media release.
3. Automate safe defaults and allow a focal-point correction.
4. Preserve predictable downloads while optimizing browser delivery.
5. Show users what Cloudinary changed and how many bytes it saved.

## Why Cloudinary is central

Cloudinary performs the work that defines the product:

- Direct and signed upload of the master asset
- Smart subject-aware cropping
- Aspect-ratio conversion
- Logo and text overlays
- Fixed export generation
- Browser-aware quality and format selection
- Structured asset metadata
- Webhook notifications
- CDN delivery

Without Cloudinary, the team would need image-processing workers, object storage, job orchestration, cache invalidation, format negotiation, and a media CDN.

## MVP success criteria

| Criterion | Target |
|---|---|
| Upload | Browser uploads directly to Cloudinary with a server-generated signature |
| Outputs | Four required channel variants succeed from one master |
| Crop quality | The main subject remains visible in the supplied demo assets |
| Processing | The UI shows `UPLOADING`, `PROCESSING`, `READY`, and `FAILED` states |
| Reliability | Duplicate webhook delivery does not duplicate records or regress state |
| Optimization | The UI reports original and delivered byte sizes |
| Delivery | User can download fixed JPG exports and copy a responsive CDN URL |
| Documentation | README, architecture, setup guide, demo link, and milestone post are complete |

## Demonstration goal

The demo should take less than three minutes. A reviewer should understand the input, processing, four outputs, optimization result, and architecture without reading the source code.

## Portfolio goal

The repository should demonstrate:

- Typed full-stack development
- Secure third-party API integration
- Event-driven state changes
- Idempotent webhook handling
- Relational data modeling
- Transformation recipe design
- Docker and CI/CD
- Product-focused documentation
