# 04. System Architecture

## Architecture style

Use a modular monolith for the MVP. One Next.js deployment contains the UI, authenticated API routes, upload-signing endpoint, webhook receiver, and manifest endpoint. PostgreSQL stores workflow state. Cloudinary provides asset storage, transformation, metadata, and CDN delivery.

This design gives the project clear module boundaries without adding a message broker or several deployable services.

## Layered view

<div style="width: 1200px; box-sizing: border-box; position: relative; background: #fafbfc; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;"><style scoped>.arch-title{text-align:center;font-size:22px;font-weight:bold;color:#1f2937;margin-bottom:16px}.arch-layer{margin:8px 0;padding:14px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.04)}.arch-layer-title{font-size:13px;font-weight:bold;margin-bottom:10px;text-align:center}.arch-grid{display:grid;gap:8px}.arch-grid-2{grid-template-columns:repeat(2,1fr)}.arch-grid-3{grid-template-columns:repeat(3,1fr)}.arch-grid-4{grid-template-columns:repeat(4,1fr)}.arch-box{border-radius:4px;padding:8px;text-align:center;font-size:11px;font-weight:600;line-height:1.35;color:#1f2937;background:#fff;border:1px solid #e5e7eb}.arch-box.highlight{background:#f3f4f6;border:2px solid #6b7280}.arch-box.tech{font-size:10px;color:#6b7280;background:#f9fafb}.user{background:#eff6ff;border:2px solid #3b82f6}.application{background:#fffbeb;border:2px solid #d97706}.media{background:#f0fdf4;border:2px solid #16a34a}.data{background:#fdf2f8;border:2px solid #db2777}.infra{background:#f3f4f6;border:2px solid #6b7280}</style><div class="arch-title">MediaOps Studio Architecture</div><div class="arch-layer user"><div class="arch-layer-title">User Layer</div><div class="arch-grid arch-grid-3"><div class="arch-box">Release Dashboard<br><small>Next.js UI</small></div><div class="arch-box">Upload and Metadata Form<br><small>Direct upload client</small></div><div class="arch-box">Preview and Downloads<br><small>Responsive CDN media</small></div></div></div><div class="arch-layer application"><div class="arch-layer-title">Application Layer</div><div class="arch-grid arch-grid-4"><div class="arch-box">Release Service<br><small>Workflow and authorization</small></div><div class="arch-box highlight">Signature Service<br><small>Scoped upload parameters</small></div><div class="arch-box highlight">Webhook Receiver<br><small>Verify and deduplicate</small></div><div class="arch-box">Manifest Service<br><small>Public release contract</small></div></div></div><div class="arch-layer media"><div class="arch-layer-title">Cloudinary Media Layer</div><div class="arch-grid arch-grid-4"><div class="arch-box">Upload Preset<br><small>Validation and eager recipes</small></div><div class="arch-box highlight">Transformation Engine<br><small>Crop, overlay, optimize</small></div><div class="arch-box">Asset Metadata<br><small>Tags and structured fields</small></div><div class="arch-box">CDN Delivery<br><small>Fixed and responsive URLs</small></div></div></div><div class="arch-layer data"><div class="arch-layer-title">Data Layer</div><div class="arch-grid arch-grid-3"><div class="arch-box tech">PostgreSQL<br><small>Releases, variants, events</small></div><div class="arch-box tech">Cloudinary Assets<br><small>Master and derived media</small></div><div class="arch-box tech">Audit Log<br><small>State transitions</small></div></div></div><div class="arch-layer infra"><div class="arch-layer-title">Delivery and Operations</div><div class="arch-grid arch-grid-4"><div class="arch-box tech">Docker<br><small>Local and deployment image</small></div><div class="arch-box tech">GitHub Actions<br><small>Checks and build</small></div><div class="arch-box tech">Application Logs<br><small>Correlation IDs</small></div><div class="arch-box tech">Health Checks<br><small>App and database</small></div></div></div></div>

## Processing flow

<div style="width:1200px;box-sizing:border-box;position:relative;background:#fafbfc;padding:20px;border:1px solid #e5e7eb;border-radius:6px"><style scoped>.pipe-title{text-align:center;font-size:20px;font-weight:600;color:#1f2937;margin-bottom:16px}.pipe{display:flex;gap:0;align-items:stretch}.stage{flex:1;padding:12px;border:2px solid #6b7280;border-radius:6px;background:#fff}.stage-title{font-size:12px;font-weight:700;color:#374151;text-align:center;margin-bottom:8px}.stage-box{border-radius:4px;padding:7px;text-align:center;font-size:10px;line-height:1.35;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;margin:3px 0}.arrow{display:flex;align-items:center;justify-content:center;width:30px;flex-shrink:0;font-size:20px;color:#6b7280}</style><div class="pipe-title">Release Processing Pipeline</div><div class="pipe"><div class="stage"><div class="stage-title">1. Prepare</div><div class="stage-box">Create draft release</div><div class="stage-box">Validate metadata</div><div class="stage-box">Issue scoped signature</div></div><div class="arrow">→</div><div class="stage"><div class="stage-title">2. Ingest</div><div class="stage-box">Direct browser upload</div><div class="stage-box">Cloudinary stores master</div><div class="stage-box">Return asset identity</div></div><div class="arrow">→</div><div class="stage"><div class="stage-title">3. Transform</div><div class="stage-box">Automatic gravity crop</div><div class="stage-box">Brand overlay</div><div class="stage-box">Four eager exports</div></div><div class="arrow">→</div><div class="stage"><div class="stage-title">4. Reconcile</div><div class="stage-box">Verify webhook</div><div class="stage-box">Deduplicate event</div><div class="stage-box">Update variants and state</div></div><div class="arrow">→</div><div class="stage"><div class="stage-title">5. Deliver</div><div class="stage-box">Fixed JPG downloads</div><div class="stage-box">Responsive preview URLs</div><div class="stage-box">Release manifest</div></div></div></div>

## Component responsibilities

| Component | Owns | Does not own |
|---|---|---|
| Release UI | Forms, previews, status polling, download actions | API secrets or image processing |
| Release service | Business rules, state transitions, authorization | Media binaries |
| Signature service | Approved upload parameters and short-lived signatures | Arbitrary client transformations |
| Webhook receiver | Verification, idempotency, event persistence | User-facing rendering |
| Recipe registry | Versioned transformation definitions | Runtime secrets |
| Manifest service | Stable external representation of a ready release | Internal webhook payloads |
| PostgreSQL | Releases, asset references, variants, events, templates | Source or derived image bytes |
| Cloudinary | Master asset, transformations, metadata, CDN delivery | Application users and release workflow |

## Release state machine

| Current state | Event | Next state |
|---|---|---|
| `DRAFT` | Upload signature issued | `UPLOADING` |
| `UPLOADING` | Master upload confirmed | `PROCESSING` |
| `UPLOADING` | Upload rejected or expired | `FAILED` |
| `PROCESSING` | All required variants confirmed | `READY` |
| `PROCESSING` | Required transformation fails | `FAILED` |
| `FAILED` | User retries with valid source | `PROCESSING` |
| `READY` | User changes focal point or template | `PROCESSING` |
| Any non-deleted state | User archives release | `ARCHIVED` |

State transitions must move forward unless a documented retry or regeneration command initiates processing.

## Trust boundaries

1. The browser is untrusted. It receives the cloud name and API key but never the API secret.
2. The application signs only allowlisted upload parameters.
3. The webhook endpoint accepts public internet traffic but changes state only after verification.
4. Cloudinary delivery URLs are public for the MVP. Private campaign support remains future work.
5. Database credentials and Cloudinary secrets stay in server runtime configuration.

## Scaling path

The MVP does not need microservices. If processing volume grows, extract webhook processing into a worker, place verified events on a queue, and retain the same idempotency key and state-transition rules. The browser-to-Cloudinary upload path does not need to change.
