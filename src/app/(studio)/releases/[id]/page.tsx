import Image from "next/image";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { requireUser } from "@/lib/auth";
import { cloudinaryClient } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { aggregateByteSavings, byteSavings } from "@/lib/domain";
import { RECIPES } from "@/lib/recipes";
import { ReleaseRefresh } from "./release-refresh";
import { RetryButton } from "./retry-button";
import { UploadPanel } from "./upload-panel";

function bytes(value: bigint | number | null | undefined) {
  if (value == null) return "Waiting";
  return new Intl.NumberFormat("en", {
    style: "unit",
    unit: "kilobyte",
    maximumFractionDigits: 0,
  }).format(Number(value) / 1024);
}

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const release = await db.mediaRelease.findFirst({
    where: { id, ownerId: user.id },
    include: {
      sourceAsset: true,
      variants: true,
      events: { orderBy: { receivedAt: "desc" }, take: 8 },
    },
  });
  if (!release) notFound();

  const currentVariants = release.variants.filter((variant) => variant.generation === release.generation);
  const variants = new Map(currentVariants.map((variant) => [variant.recipeKey, variant]));
  const active = ["UPLOADING", "PROCESSING"].includes(release.status);
  const packageSavings = aggregateByteSavings(release.sourceAsset?.bytes ?? null, currentVariants.map((variant) => variant.bytes));
  const responsiveUrl = release.sourceAsset
    ? cloudinaryClient().url(release.sourceAsset.publicId, {
        secure: true,
        version: release.sourceAsset.version,
        transformation: [{ width: 1600, crop: "limit" }, { quality: "auto", fetch_format: "auto" }],
      })
    : null;

  return (
    <>
      <ReleaseRefresh active={active} />
      <header className="pagebar">
        <div>
          <h1>{release.title}</h1>
          <p className="subtle">{release.eventName}{release.speaker ? ` · ${release.speaker}` : ""}</p>
        </div>
        <div className="header-actions">
          <span className={`status ${release.status}`}>{release.status}</span>
          {release.status === "FAILED" && <RetryButton releaseId={release.id} />}
        </div>
      </header>

      {release.failureMessage && <p className="error">{release.failureMessage}</p>}

      <div className="detail-grid">
        <section>
          {release.status === "DRAFT" ? (
            <UploadPanel releaseId={release.id} />
          ) : release.sourceAsset ? (
            <div className="source-stage">
              <Image
                unoptimized
                width={release.sourceAsset.width}
                height={release.sourceAsset.height}
                src={release.sourceAsset.secureUrl}
                alt={`Master image for ${release.title}`}
              />
            </div>
          ) : (
            <UploadPanel releaseId={release.id} />
          )}
        </section>

        <aside>
          <h2>Release record</h2>
          <dl className="aside-list record-list">
            <div className="aside-item"><dt>Campaign</dt><dd>{release.campaign}</dd></div>
            <div className="aside-item"><dt>Asset type</dt><dd>{release.assetType}</dd></div>
            <div className="aside-item"><dt>Generation</dt><dd>{release.generation}</dd></div>
            <div className="aside-item"><dt>Source size</dt><dd>{bytes(release.sourceAsset?.bytes)}</dd></div>
            <div className="aside-item"><dt>Template</dt><dd>Event recap · v1</dd></div>
            {packageSavings != null && <div className="aside-item"><dt>Package savings</dt><dd>{packageSavings}% across comparable outputs</dd></div>}
            {responsiveUrl && <div className="aside-item"><dt>Responsive delivery</dt><dd><CopyLink value={responsiveUrl} /></dd></div>}
            {release.status === "READY" && (
              <div className="aside-item"><dt>Manifest</dt><dd><a href={`/api/releases/${release.id}/manifest`} target="_blank">Open JSON ↗</a></dd></div>
            )}
          </dl>
        </aside>
      </div>

      <section className="recipe-rail">
        <h2>Channel exports</h2>
        <div className="recipe-grid">
          {RECIPES.map((recipe) => {
            const variant = variants.get(recipe.key);
            return (
              <article className="recipe" key={recipe.key}>
                <div className="recipe-media">
                  {variant?.secureUrl ? (
                    <Image unoptimized width={recipe.width} height={recipe.height} src={variant.secureUrl} alt={`${recipe.label} crop`} />
                  ) : (
                    <span className={`status ${variant?.status ?? "PENDING"}`}>{variant?.status ?? "PENDING"}</span>
                  )}
                </div>
                <div className="recipe-body">
                  <div className="recipe-name">{recipe.label}</div>
                  <div className="recipe-spec">
                    {recipe.width} × {recipe.height} · JPG · {bytes(variant?.bytes)}
                    {release.sourceAsset && variant?.bytes ? ` · ${byteSavings(release.sourceAsset.bytes, variant.bytes)}% smaller` : ""}
                  </div>
                  {variant?.secureUrl && (
                    <div className="recipe-actions">
                      <a href={variant.secureUrl} download>Download</a>
                      <CopyLink value={variant.secureUrl} label="Copy URL" />
                      <a href={variant.secureUrl} target="_blank">Open</a>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="event-section">
        <div className="section-heading">
          <h2>Processing history</h2>
          <p className="subtle">Accepted Cloudinary notifications for this release.</p>
        </div>
        <div className="event-ledger">
          {release.events.length ? release.events.map((event) => (
            <div className="event-row" key={event.id}>
              <div><strong>{event.eventType}</strong><span>{event.provider}</span></div>
              <span>{event.processingError ?? (event.processedAt ? "Processed" : "Received")}</span>
              <time dateTime={event.receivedAt.toISOString()}>{event.receivedAt.toLocaleString()}</time>
            </div>
          )) : <p className="event-empty">Waiting for the first provider notification.</p>}
        </div>
      </section>
    </>
  );
}
