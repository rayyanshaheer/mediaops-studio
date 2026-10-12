# 11. Demo and Creator Milestone Submission

## Three-minute demo script

### 0:00–0:20: Problem

Show one high-resolution event photo with an awkward composition. Explain that a community team would normally crop, brand, compress, rename, and export it several times.

### 0:20–0:45: Release setup

Create a release, enter event and speaker metadata, select the Event Recap template, and choose the brand profile.

### 0:45–1:10: Secure upload

Upload the source. Point out that the browser sends bytes directly to Cloudinary after the backend generates a scoped signature.

### 1:10–1:35: Processing

Show the transition from `UPLOADING` to `PROCESSING` and then `READY`. Open the event panel long enough to show that a webhook confirmed the generated outputs.

### 1:35–2:15: Results

Reveal all four variants beside the master:

- Instagram square
- Instagram portrait
- LinkedIn landscape
- Story vertical

Point out subject-aware cropping, consistent logo placement, dimensions, format, and byte size.

### 2:15–2:40: Delivery

Download one fixed JPG. Copy and open the responsive website URL. Show the release manifest.

### 2:40–3:00: Architecture and result

Show the architecture diagram. State which responsibilities belong to the application and which belong to Cloudinary. End with the measured reduction from the original asset to an optimized delivered variant.

## Demo preparation

- Use a source image where naive center cropping cuts off the subject.
- Keep a seeded ready release in case live processing is slow.
- Open all tabs before recording.
- Disable personal notifications.
- Use a clean browser profile.
- Increase browser zoom enough for metadata and byte counts to remain legible.
- Rehearse the demo until it finishes within three minutes.

## Creator Milestone post outline

### Title

**I built MediaOps Studio: one event photo, four production-ready media formats**

### What I built

Describe MediaOps Studio as a release pipeline for communities and event teams. One master image produces branded channel exports and optimized website delivery.

### The media problem

Explain the repeated crop, resize, watermark, export, and compression work required for each event photo. Include one concrete example from a student society or developer event.

### How I used Cloudinary

Cover:

- Signed direct upload
- Upload presets
- Automatic-gravity cropping
- Eager fixed-format transformations
- Logo overlays
- Structured metadata and tags
- Webhook-driven processing state
- `q_auto` and `f_auto` website delivery
- CDN URLs

### Architecture

Explain that the application owns workflow and Cloudinary owns the media pipeline. Mention why fixed downloads use eager JPG derivatives while responsive pages use dynamic automatic format and quality.

### What I learned

Use specific lessons:

- A direct upload still needs server-side policy and signing.
- Webhook consumers must handle retries and out-of-order delivery.
- Automatic cropping needs human correction for difficult compositions.
- Download files and responsive browser assets have different format requirements.
- Asset identity, workflow state, and media bytes belong in different systems.

### Result

Include:

- Original dimensions and bytes
- Four generated dimensions
- One delivery-size comparison
- Processing duration
- Screenshot of the completed package

### Links

- Live demo
- GitHub repository
- Short demo video
- Architecture documentation

## Repository README checklist

- [ ] One-sentence product description
- [ ] Problem and target users
- [ ] Demo GIF or screenshot
- [ ] Feature list
- [ ] Architecture diagram
- [ ] Upload and webhook flow
- [ ] Local setup
- [ ] Required Cloudinary configuration
- [ ] Environment-variable table
- [ ] Test commands
- [ ] Deployment notes
- [ ] Security notes
- [ ] Current limitations
- [ ] Demo and milestone links

## Evidence to capture while building

- Upload preset screenshot with secrets hidden
- Source photo and four derivatives
- Browser network response showing Cloudinary delivery
- Processing-event log
- Duplicate-webhook test result
- Before/after byte comparison
- CI success screenshot
- Deployed application screenshot

## Claims to avoid

- Do not call transformed assets lossless unless measured and true.
- Do not claim automatic gravity always finds the intended subject.
- Do not describe public media as private.
- Do not claim webhook delivery occurs exactly once.
- Do not present a fixed JPG export as browser-adaptive.
- Do not state bandwidth savings without measurements from the demo asset.

## Post-milestone backlog

1. Manual focal-point override
2. Batch releases
3. Additional templates
4. Multi-brand workspaces
5. Video release packages
6. Approval workflow
7. Private previews and expiring access
8. Direct publishing integrations
9. Usage and transformation-cost dashboard
10. Archive download generation

## Submission gate

Submit only after another person can open the demo, understand the problem, inspect a completed release, and reach the GitHub repository without receiving credentials or setup help.
