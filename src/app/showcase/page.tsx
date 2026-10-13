import type { Metadata } from "next";
import Image from "next/image";
import productionEvidence from "../../../docs/assets/production-smoke-linkedin.jpg";

export const metadata: Metadata = {
  title: "Creator Milestone",
  description: "A verified Cloudinary Creator Milestone built by Rayyan Shaheer.",
};

const outputs = [
  ["Instagram square", "1080 × 1080", "34,365 bytes"],
  ["Instagram portrait", "1080 × 1350", "41,065 bytes"],
  ["LinkedIn landscape", "1200 × 627", "27,031 bytes"],
  ["Story vertical", "1080 × 1920", "46,394 bytes"],
];

export default function ShowcasePage() {
  return (
    <main className="showcase">
      <header className="showcase-header">
        <a className="wordmark" href="/showcase"><span className="mark" />MediaOps Studio</a>
        <a className="button secondary" href="/login">Owner sign in</a>
      </header>

      <section className="showcase-intro">
        <div>
          <p className="showcase-kicker">Cloudinary Creator Milestone by Rayyan Shaheer</p>
          <h1>One event photo, prepared for four publishing channels.</h1>
        </div>
        <p className="showcase-summary">
          MediaOps Studio gives community and event teams one workflow for upload, cropping,
          branding, optimization, and delivery. Cloudinary handles the image pipeline while the
          application tracks each release from draft to ready.
        </p>
      </section>

      <section className="showcase-proof" aria-labelledby="verified-output">
        <div className="showcase-image">
          <Image
            src={productionEvidence}
            alt="Branded LinkedIn export produced by MediaOps Studio"
            priority
            sizes="(max-width: 900px) 100vw, 70vw"
          />
        </div>
        <div className="showcase-proof-copy">
          <h2 id="verified-output">Verified production output</h2>
          <p>
            This image came from a signed direct upload to the deployed application. Cloudinary
            cropped it with automatic gravity, applied the MediaOps watermark, and generated the
            final JPG before a signed webhook marked the release ready.
          </p>
          <dl className="showcase-facts">
            <div><dt>Source</dt><dd>1600 × 1000 JPG, 74,654 bytes</dd></div>
            <div><dt>Processing time</dt><dd>13.6 seconds</dd></div>
            <div><dt>LinkedIn output</dt><dd>27,031 bytes, 63.8% smaller</dd></div>
          </dl>
          <a className="text-action" href="/login">Open the release application →</a>
        </div>
      </section>

      <section className="showcase-section" aria-labelledby="outputs">
        <div className="section-heading">
          <h2 id="outputs">Generated release package</h2>
          <p>All four eager transformations reached READY in the production workflow.</p>
        </div>
        <div className="showcase-output-list">
          {outputs.map(([name, dimensions, bytes]) => (
            <div className="showcase-output" key={name}>
              <strong>{name}</strong><span>{dimensions}</span><span>{bytes}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="showcase-columns">
        <article>
          <h2>The media problem</h2>
          <p>
            A team publishing one event photo often repeats the same crop, resize, watermark,
            compression, and export work for each channel. File naming and delivery add more room
            for mistakes. MediaOps Studio turns that repeated work into one release.
          </p>
        </article>
        <article>
          <h2>Cloudinary in the workflow</h2>
          <ul>
            <li>Server-signed direct uploads with a restricted preset</li>
            <li>Automatic-gravity crops and versioned eager transformations</li>
            <li>Logo overlays, metadata, tags, and CDN delivery</li>
            <li>Verified webhooks with replay-safe processing</li>
            <li>Responsive website URLs using automatic format and quality</li>
          </ul>
        </article>
      </section>

      <section className="showcase-section" aria-labelledby="learned">
        <div className="section-heading"><h2 id="learned">What I learned</h2></div>
        <ol className="showcase-lessons">
          <li><strong>Sign the whole upload policy.</strong> The server signs the public ID, preset, tags, context, eager recipes, and notification URL.</li>
          <li><strong>Treat webhooks as repeatable events.</strong> Idempotency keys and generation checks protect the release from retries and stale callbacks.</li>
          <li><strong>Keep downloads and web delivery separate.</strong> Social exports use predictable JPG files while browser delivery uses automatic format and quality.</li>
          <li><strong>Test transformations with real images.</strong> A production smoke test exposed an overlay-order bug that unit tests had missed.</li>
        </ol>
      </section>

      <footer className="showcase-footer">
        <p>Built and production-tested with Next.js, PostgreSQL, and Cloudinary.</p>
        <a href="/login">Open MediaOps Studio</a>
      </footer>
    </main>
  );
}
