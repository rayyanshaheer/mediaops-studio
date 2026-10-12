# 03. Questions and Decisions

Use this document before implementation and whenever scope changes. Record each settled answer in the decision log so the code and milestone story remain aligned.

## Questions to answer before coding

### Product

1. Will the milestone demo require sign-in, or can it use a seeded demo account?
2. Is Event Recap the only MVP template?
3. Which four platforms matter for the first demo?
4. Does a user need to edit the focal point in the MVP?
5. Must users download all variants together, or is one-at-a-time download enough?
6. Does `READY` mean every variant succeeded or at least one succeeded?

### Branding

1. Which logo will the demo use?
2. Should the logo appear in the same corner for every aspect ratio?
3. Does the template include event text, or only a logo?
4. What safe margin protects branding from platform UI overlays?
5. How should the system handle a source image with little empty space?

### Cloudinary account

1. Which cloud name and product environment will host the demo?
2. What upload and transformation limits apply to the account?
3. Does the account support every planned transformation?
4. Will strict transformations be enabled?
5. Which webhook-signing method will the implementation verify?
6. Will the project configure presets manually or through a setup script?

### Delivery

1. Should downloadable exports always use JPG?
2. What quality setting balances social-platform recompression and file size?
3. Should CDN preview URLs be public?
4. Does a release need an expiry or deletion policy?
5. Should regenerated variants replace old results or create a new template version?

### Deployment

1. Which host will run the web application?
2. Which managed PostgreSQL provider will be used?
3. How will Cloudinary reach the local webhook during development?
4. Where will runtime logs live?
5. What monthly cost ceiling applies after the milestone?

## Recommended default answers

| Question | Default for MVP | Reason |
|---|---|---|
| Authentication | One seeded owner account or simple OAuth | Keeps focus on media workflow |
| Templates | One Event Recap template | Reduces transformation and UI scope |
| Required variants | Four fixed recipes | Creates a complete but bounded package |
| Focal point | Automatic gravity first; manual override if time permits | Keeps the core demo reliable |
| Batch download | Defer | Individual downloads prove the workflow |
| Readiness | Every required derivative succeeds | Gives `READY` a precise meaning |
| Download format | JPG | Predictable and compatible |
| Browser delivery | `f_auto` plus `q_auto` | Lets Cloudinary optimize per request |
| Template changes | Create a new template version | Preserves reproducibility |
| Webhook development | HTTPS tunnel | Cloudinary requires a reachable endpoint |

## Decision log

| ID | Decision | Status | Consequence |
|---|---|---|---|
| D-001 | Build an image-only MVP | Accepted | Video becomes post-milestone work |
| D-002 | Treat a media release as the aggregate root | Accepted | Assets and variants belong to a release |
| D-003 | Use eager transformations for fixed downloads | Accepted | Webhooks can represent real readiness |
| D-004 | Use dynamic transformations for responsive website delivery | Accepted | Browser delivery can vary by DPR, width, and format |
| D-005 | Keep media binaries out of PostgreSQL | Accepted | Database stores identity and workflow state only |
| D-006 | Version transformation templates | Accepted | Existing releases remain reproducible |
| D-007 | Require idempotent webhook processing | Accepted | Cloudinary retries remain safe |
| D-008 | Use one deployable application for the MVP | Accepted | Avoids premature microservices |
| D-009 | Add a queue only after measured need | Accepted | PostgreSQL and webhook handlers remain sufficient initially |
| D-010 | Publish fixed-format download links separately from responsive preview URLs | Accepted | Users get predictable files and optimized browser delivery |

## Decisions that can wait

- Multiple organizations
- Fine-grained roles
- Template marketplace
- Video and animated outputs
- Automatic background removal
- Social publishing integrations
- Archive generation
- Billing
