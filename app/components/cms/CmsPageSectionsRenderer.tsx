import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import EditorialProductCard from "../EditorialProductCard";
import type { CmsPageSection } from "../../services/cmsService";
import type { Product } from "../../services/productService";
import PromoSection from "./PromoSection";

type CmsPageSectionsRendererProps = {
  sections: CmsPageSection[];
  productsBySectionId?: Record<string, Product[]>;
  /** Optional catalog for resolving promo product thumbnails */
  products?: Product[];
  /** When true, CTAs render as non-navigating spans (admin preview). */
  preview?: boolean;
  /** When true, include disabled sections (useful for section-level preview). */
  includeDisabled?: boolean;
};

const splitParagraphs = (body?: string) =>
  String(body || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

/** Convert allowed watch URLs to embeddable iframe src. */
function toVideoEmbedSrc(raw?: string): string | null {
  const value = String(raw || "").trim();
  if (!value.startsWith("https://")) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
      if (parts[0] === "shorts" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
      return null;
    }
    if (host === "vimeo.com" || host === "www.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") {
      return value;
    }
    if (host === "res.cloudinary.com") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

function CtaLink({
  href,
  className,
  children,
  preview,
}: {
  href: string;
  className: string;
  children: ReactNode;
  preview?: boolean;
}) {
  if (preview) {
    return <span className={className}>{children}</span>;
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function CmsPageSectionsRenderer({
  sections,
  productsBySectionId = {},
  products = [],
  preview = false,
  includeDisabled = false,
}: CmsPageSectionsRendererProps) {
  const sorted = [...(sections || [])]
    .filter((section) => includeDisabled || section.enabled !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (sorted.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-[#5d6043]">This page has no sections yet.</p>
      </section>
    );
  }

  return (
    <>
      {sorted.map((section) => {
        const c = section.content || {};
        const productsForStrip = productsBySectionId[section.id] || [];

        if (section.type === "promoBanner" && (c.message || c.headline)) {
          const productThumb = c.productId
            ? products.find((product) => String(product.id) === String(c.productId))
                ?.thumbnail
            : undefined;
          return (
            <PromoSection
              key={section.id}
              message={String(c.message || c.headline || "")}
              body={c.body}
              ctaLabel={c.ctaLabel || "Shop"}
              ctaHref={c.ctaHref || "/shop"}
              endsAt={c.endsAt}
              tone={c.tone}
              imageUrl={c.imageUrl}
              productThumbnailUrl={productThumb}
              dismissible={!preview}
              preview={preview}
              storageKey={`page-promo:${section.id}:${String(c.message || "").slice(0, 40)}`}
            />
          );
        }

        if (section.type === "hero") {
          return (
            <section
              key={section.id}
              className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1fr] lg:gap-12 lg:px-8 lg:py-20"
            >
              <div>
                {c.eyebrow ? (
                  <p className="mb-4 text-sm font-medium text-[#bd6325]">{c.eyebrow}</p>
                ) : null}
                <h1 className="prototype-heading max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] text-[#222222]">
                  {c.headline || "Welcome"}
                </h1>
                {c.body ? (
                  <p className="mt-5 max-w-xl text-lg leading-8 text-[#5d6043]">{c.body}</p>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  {c.ctaLabel && c.ctaHref ? (
                    <CtaLink
                      preview={preview}
                      href={c.ctaHref}
                      className="editorial-button px-7 py-3.5"
                    >
                      {c.ctaLabel}
                    </CtaLink>
                  ) : null}
                  {c.secondaryCtaLabel && c.secondaryCtaHref ? (
                    <CtaLink
                      preview={preview}
                      href={c.secondaryCtaHref}
                      className="editorial-button-outline px-7 py-3.5"
                    >
                      {c.secondaryCtaLabel}
                    </CtaLink>
                  ) : null}
                </div>
              </div>
              {c.imageUrl ? (
                <div className="relative min-h-[360px] overflow-hidden rounded-[36px] bg-[#b9aca2]">
                  <Image
                    src={c.imageUrl}
                    alt={c.headline || "Hero"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : null}
            </section>
          );
        }

        if (section.type === "signature") {
          return (
            <section
              key={section.id}
              className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8"
            >
              {c.imageUrl ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-[#b9aca2]">
                  <Image
                    src={c.imageUrl}
                    alt={c.headline || "Featured"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <div>
                {c.eyebrow ? (
                  <p className="mb-2 text-sm uppercase tracking-[0.16em] text-[#bd6325]">
                    {c.eyebrow}
                  </p>
                ) : null}
                <h2 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
                  {c.headline || "Featured"}
                </h2>
                {c.body ? (
                  <p className="mt-4 text-lg leading-8 text-[#5d6043]">{c.body}</p>
                ) : null}
                {c.ctaLabel && c.ctaHref ? (
                  <CtaLink
                    preview={preview}
                    href={c.ctaHref}
                    className="editorial-button mt-6 inline-flex px-6 py-3"
                  >
                    {c.ctaLabel}
                  </CtaLink>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "giftCta") {
          return (
            <section
              key={section.id}
              className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8"
            >
              <div>
                <h2 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
                  {c.headline || "Send a gift"}
                </h2>
                {c.body ? (
                  <p className="mt-4 text-lg leading-8 text-[#5d6043]">{c.body}</p>
                ) : null}
                {c.ctaLabel && c.ctaHref ? (
                  <CtaLink
                    preview={preview}
                    href={c.ctaHref}
                    className="editorial-button mt-6 inline-flex px-6 py-3"
                  >
                    {c.ctaLabel}
                  </CtaLink>
                ) : null}
              </div>
              {c.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-[#b9aca2]">
                  <Image
                    src={c.imageUrl}
                    alt={c.headline || "Gift"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
            </section>
          );
        }

        if (section.type === "productStrip") {
          return (
            <section key={section.id} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
                    {c.headline || "Shop the picks"}
                  </h2>
                  {c.body ? (
                    <p className="mt-2 max-w-xl text-[#5d6043]">{c.body}</p>
                  ) : null}
                </div>
                {c.ctaLabel && c.ctaHref ? (
                  <CtaLink
                    preview={preview}
                    href={c.ctaHref}
                    className="text-sm font-semibold text-[#5d6043] underline underline-offset-2"
                  >
                    {c.ctaLabel}
                  </CtaLink>
                ) : null}
              </div>
              {productsForStrip.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {productsForStrip.map((product) => (
                    <EditorialProductCard key={product.id} product={product} compact />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-[#b9aca2] px-4 py-10 text-center text-sm text-[#5d6043]">
                  No products selected for this strip yet.
                </p>
              )}
            </section>
          );
        }

        if (section.type === "faq") {
          return (
            <section
              key={section.id}
              className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8"
            >
              <h2 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
                {c.headline || "FAQs"}
              </h2>
              {c.body ? (
                <p className="mt-4 text-lg leading-8 text-[#5d6043]">{c.body}</p>
              ) : (
                <p className="mt-4 text-sm text-[#5d6043]">
                  FAQ answers come from your site FAQ list on the homepage. Use this
                  block for a short intro.
                </p>
              )}
            </section>
          );
        }

        if (section.type === "newsletter") {
          return (
            <section
              key={section.id}
              className="border-y border-[#b9aca2] bg-[#eeeae0]/40 px-4 py-14 sm:px-6 lg:px-8"
            >
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
                  {c.headline || "Stay in the loop"}
                </h2>
                {c.body ? (
                  <p className="mt-4 text-lg leading-8 text-[#5d6043]">{c.body}</p>
                ) : null}
                <p className="mt-6 text-sm text-[#5d6043]">
                  Newsletter signup lives on the homepage. This section shares the message.
                </p>
              </div>
            </section>
          );
        }

        if (section.type === "textIntro") {
          const paragraphs = splitParagraphs(c.body);
          return (
            <section
              key={section.id}
              className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28"
            >
              <h1 className="font-editorial text-3xl tracking-[-0.03em] sm:text-4xl">
                {c.headline || "Welcome"}
              </h1>
              {paragraphs.length > 0 ? (
                <div className="mx-auto mt-8 max-w-[680px] space-y-5 text-lg leading-8 text-[#5d6043]">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </section>
          );
        }

        if (section.type === "storySplit") {
          const imageLeft = c.imagePosition !== "right";
          const imageBlock = c.imageUrl ? (
            <div className="relative min-h-[360px] overflow-hidden rounded-[36px] border border-[rgba(34,34,34,0.10)] bg-[#b9aca2] shadow-[0_18px_55px_rgba(34,34,34,0.14)]">
              <Image
                src={c.imageUrl}
                alt={c.headline || "Story"}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="min-h-[240px] rounded-[36px] bg-[#eeeae0]" />
          );
          const textBlock = (
            <div className="flex flex-col justify-center">
              <h2 className="font-editorial text-2xl tracking-[-0.03em] sm:text-3xl">
                {c.headline || "Our story"}
              </h2>
              <div className="mt-7 space-y-4 text-lg leading-8 text-[#5d6043]">
                {splitParagraphs(c.body).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              {c.ctaLabel && c.ctaHref ? (
                <CtaLink
                  preview={preview}
                  href={c.ctaHref}
                  className="editorial-button mt-6 inline-flex w-fit px-6 py-3"
                >
                  {c.ctaLabel}
                </CtaLink>
              ) : null}
            </div>
          );
          return (
            <section
              key={section.id}
              className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24"
            >
              {imageLeft ? (
                <>
                  {imageBlock}
                  {textBlock}
                </>
              ) : (
                <>
                  {textBlock}
                  {imageBlock}
                </>
              )}
            </section>
          );
        }

        if (section.type === "featureGrid") {
          const items = Array.isArray(c.items) ? c.items.filter(Boolean) : [];
          return (
            <section
              key={section.id}
              className="bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-4 py-20 text-[#faf9f5] sm:px-6 lg:px-8"
            >
              <div className="mx-auto max-w-6xl">
                {c.headline ? (
                  <div className="mb-10 text-center">
                    <h2 className="font-editorial text-2xl tracking-[-0.03em] sm:text-3xl">
                      {c.headline}
                    </h2>
                  </div>
                ) : null}
                {items.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => (
                      <div
                        key={item}
                        className="rounded-[24px] border border-[#faf9f5]/10 bg-[#faf9f5]/10 p-6 text-[#faf9f5]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : null}
                {c.body ? (
                  <p className="mx-auto mt-10 max-w-3xl border-t border-[#faf9f5]/10 pt-8 text-center text-lg leading-8 text-[#b9aca2]">
                    {c.body}
                  </p>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "valuesRow") {
          const items = Array.isArray(c.items) ? c.items.filter(Boolean) : [];
          if (!items.length) return null;
          return (
            <section
              key={section.id}
              className="border-y border-[#b9aca2] bg-[#faf9f5] px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#b9aca2] px-5 py-3 text-sm font-semibold text-[#5d6043]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "closingCta") {
          return (
            <section
              key={section.id}
              className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28"
            >
              <div className="editorial-card p-8 sm:p-12">
                <h2 className="font-editorial text-4xl">{c.headline || "Thank you"}</h2>
                <div className="font-editorial mx-auto mt-8 max-w-2xl space-y-5 text-xl italic leading-9 text-[#5d6043]">
                  {splitParagraphs(c.body).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
                {(c.ctaLabel || c.secondaryCtaLabel) && (
                  <div className="mt-10 border-t border-[#b9aca2] pt-8">
                    <p className="text-lg font-semibold">With love & gratitude,</p>
                    {c.ctaLabel ? (
                      c.ctaHref && !preview ? (
                        <Link
                          href={c.ctaHref}
                          className="font-editorial mt-2 inline-block text-4xl text-[#bd6325]"
                        >
                          {c.ctaLabel}
                        </Link>
                      ) : (
                        <p className="font-editorial mt-2 text-4xl text-[#bd6325]">
                          {c.ctaLabel}
                        </p>
                      )
                    ) : null}
                    {c.secondaryCtaLabel ? (
                      <p className="mt-1 text-sm text-[#5d6043]">{c.secondaryCtaLabel}</p>
                    ) : null}
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (section.type === "steps") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <ol className="grid gap-6 sm:gap-8">
                {cards.map((card, index) => (
                  <li
                    key={`${card.title || "step"}-${index}`}
                    className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-6"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#5d6043] text-sm font-semibold text-[#faf9f5]">
                      {index + 1}
                    </span>
                    <div>
                      {card.title ? (
                        <h3 className="text-xl font-semibold text-[#222222]">{card.title}</h3>
                      ) : null}
                      {card.body ? (
                        <p className="mt-2 text-base leading-7 text-[#5d6043]">{card.body}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        }

        if (section.type === "occasionCards") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body || card?.imageUrl)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, index) => {
                  const inner = (
                    <>
                      <div className="relative aspect-[4/3] bg-[#b9aca2]">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.title || "Occasion"}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 1024px) 50vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-5">
                        {card.title ? (
                          <h3 className="text-xl font-semibold text-[#222222]">{card.title}</h3>
                        ) : null}
                        {card.body ? (
                          <p className="mt-2 text-sm leading-6 text-[#5d6043]">{card.body}</p>
                        ) : null}
                      </div>
                    </>
                  );
                  const className =
                    "group overflow-hidden rounded-[28px] border border-[rgba(34,34,34,0.10)] bg-[#faf9f5] shadow-[0_12px_40px_rgba(34,34,34,0.08)] transition hover:-translate-y-0.5";
                  if (card.href && !preview) {
                    return (
                      <Link
                        key={`${card.title || "occasion"}-${index}`}
                        href={card.href}
                        className={className}
                      >
                        {inner}
                      </Link>
                    );
                  }
                  return (
                    <div key={`${card.title || "occasion"}-${index}`} className={className}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        if (section.type === "quote") {
          if (!c.body?.trim()) return null;
          return (
            <section
              key={section.id}
              className="bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-4 py-20 text-[#faf9f5] sm:px-6 lg:px-8"
            >
              <blockquote className="mx-auto max-w-3xl text-center">
                <p className="font-editorial text-3xl leading-snug tracking-[-0.03em] sm:text-4xl">
                  &ldquo;{c.body.trim()}&rdquo;
                </p>
                {(c.ctaLabel || c.secondaryCtaLabel) && (
                  <footer className="mt-8 text-sm text-[#b9aca2]">
                    {c.ctaLabel ? <cite className="not-italic font-semibold">{c.ctaLabel}</cite> : null}
                    {c.ctaLabel && c.secondaryCtaLabel ? " · " : null}
                    {c.secondaryCtaLabel || null}
                  </footer>
                )}
              </blockquote>
            </section>
          );
        }

        if (section.type === "hoursLocation") {
          if (!c.address && !c.phone && !c.hours && !c.headline) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              <div className="grid gap-8 rounded-[32px] border border-[rgba(34,34,34,0.10)] bg-[#faf9f5]/80 p-7 shadow-[0_12px_40px_rgba(34,34,34,0.08)] sm:p-10 lg:grid-cols-2">
                <div>
                  <h2 className="font-editorial text-3xl tracking-[-0.03em] sm:text-4xl">
                    {c.headline || "Visit & pickup"}
                  </h2>
                  {c.address ? (
                    <p className="mt-5 text-base leading-7 text-[#5d6043]">{c.address}</p>
                  ) : null}
                  {c.phone ? (
                    preview ? (
                      <p className="mt-3 text-base font-semibold text-[#222222]">{c.phone}</p>
                    ) : (
                      <a
                        href={`tel:${c.phone}`}
                        className="mt-3 inline-flex min-h-11 items-center text-base font-semibold text-[#222222] hover:text-[#bd6325]"
                      >
                        {c.phone}
                      </a>
                    )
                  ) : null}
                  {c.ctaLabel && c.ctaHref ? (
                    <div className="mt-6">
                      <CtaLink
                        href={c.ctaHref}
                        preview={preview}
                        className="editorial-button-outline inline-flex min-h-11 items-center px-5 py-2.5 text-sm"
                      >
                        {c.ctaLabel}
                      </CtaLink>
                    </div>
                  ) : null}
                </div>
                {c.hours ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#5d6043]">
                      Hours
                    </h3>
                    <div className="mt-4 space-y-2 text-base leading-7 text-[#222222]">
                      {splitParagraphs(c.hours).map((line) => (
                        <p key={line.slice(0, 24)}>{line}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "imageGallery") {
          const urls = Array.isArray(c.galleryUrls)
            ? c.galleryUrls.map((url) => String(url || "").trim()).filter(Boolean)
            : [];
          if (!urls.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                {urls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-[24px] border border-[rgba(34,34,34,0.08)] bg-[#b9aca2]"
                  >
                    <Image
                      src={url}
                      alt={c.headline ? `${c.headline} ${index + 1}` : `Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "statsRow") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="border-y border-[rgba(34,34,34,0.10)] bg-[#faf9f5]/70 px-4 py-14 sm:px-6 lg:px-8"
            >
              <div className="mx-auto max-w-6xl">
                {c.headline ? (
                  <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                    {c.headline}
                  </h2>
                ) : null}
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {cards.map((card, index) => (
                    <div
                      key={`${card.title || "stat"}-${index}`}
                      className="text-center"
                    >
                      <p className="font-editorial text-3xl tracking-[-0.03em] text-[#222222] sm:text-4xl">
                        {card.title}
                      </p>
                      {card.body ? (
                        <p className="mt-2 text-sm font-medium text-[#5d6043]">{card.body}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "dualCta") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {cards.slice(0, 2).map((card, index) => {
                  const inner = (
                    <>
                      {card.imageUrl ? (
                        <div className="relative aspect-[16/10] bg-[#b9aca2]">
                          <Image
                            src={card.imageUrl}
                            alt={card.title || "CTA"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : null}
                      <div className="p-6 sm:p-8">
                        {card.title ? (
                          <h3 className="text-2xl font-semibold text-[#222222]">{card.title}</h3>
                        ) : null}
                        {card.body ? (
                          <p className="mt-3 text-base leading-7 text-[#5d6043]">{card.body}</p>
                        ) : null}
                        <span className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#bd6325]">
                          Learn more →
                        </span>
                      </div>
                    </>
                  );
                  const className =
                    "overflow-hidden rounded-[28px] border border-[rgba(34,34,34,0.10)] bg-[#faf9f5] shadow-[0_12px_40px_rgba(34,34,34,0.08)] transition hover:-translate-y-0.5";
                  if (card.href && !preview) {
                    return (
                      <Link
                        key={`${card.title || "cta"}-${index}`}
                        href={card.href}
                        className={className}
                      >
                        {inner}
                      </Link>
                    );
                  }
                  return (
                    <div key={`${card.title || "cta"}-${index}`} className={className}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        if (section.type === "iconFeatureCards") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-10 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, index) => (
                  <article
                    key={`${card.title || "feature"}-${index}`}
                    className="rounded-[28px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/90 p-6 shadow-[0_12px_40px_rgba(34,34,34,0.06)]"
                  >
                    {card.imageUrl ? (
                      <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-2xl bg-[#eeeae0]">
                        <Image
                          src={card.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="mb-5 h-14 w-14 rounded-2xl bg-[#5d6043]/15" />
                    )}
                    {card.title ? (
                      <h3 className="text-xl font-semibold text-[#222222]">{card.title}</h3>
                    ) : null}
                    {card.body ? (
                      <p className="mt-2 text-sm leading-6 text-[#5d6043]">{card.body}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "photoBreak") {
          if (!c.imageUrl?.trim()) return null;
          return (
            <section key={section.id} className="relative w-full">
              <div className="relative h-[42vh] min-h-[240px] max-h-[520px] w-full bg-[#b9aca2] sm:h-[50vh]">
                <Image
                  src={c.imageUrl}
                  alt={c.body || "Cozy Oven"}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              {c.body ? (
                <p className="mx-auto max-w-3xl px-4 py-5 text-center text-sm italic text-[#5d6043] sm:px-6">
                  {c.body}
                </p>
              ) : null}
            </section>
          );
        }

        if (section.type === "priceList") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-8 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <ul className="divide-y divide-[rgba(34,34,34,0.10)] rounded-[28px] border border-[rgba(34,34,34,0.10)] bg-[#faf9f5]/80 px-5 sm:px-7">
                {cards.map((card, index) => (
                  <li
                    key={`${card.title || "item"}-${index}`}
                    className="flex min-h-14 flex-wrap items-baseline justify-between gap-3 py-4"
                  >
                    <span className="text-base font-medium text-[#222222]">
                      {card.title}
                    </span>
                    <span className="text-base font-semibold text-[#5d6043]">
                      {card.body}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        if (section.type === "videoEmbed") {
          const embedSrc = toVideoEmbedSrc(c.videoUrl);
          if (!embedSrc) return null;
          const isCloudinary = embedSrc.includes("res.cloudinary.com");
          return (
            <section
              key={section.id}
              className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-4 text-center text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              {c.body ? (
                <p className="mx-auto mb-8 max-w-2xl text-center text-[#5d6043]">{c.body}</p>
              ) : null}
              <div className="relative aspect-video overflow-hidden rounded-[28px] border border-[rgba(34,34,34,0.10)] bg-[#222222] shadow-[0_18px_55px_rgba(34,34,34,0.14)]">
                {isCloudinary ? (
                  <video
                    src={embedSrc}
                    controls
                    className="h-full w-full object-cover"
                    playsInline
                  />
                ) : (
                  <iframe
                    src={embedSrc}
                    title={c.headline || "Video"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </section>
          );
        }

        if (section.type === "customFaq") {
          const cards = Array.isArray(c.cards)
            ? c.cards.filter((card) => card?.title || card?.body)
            : [];
          if (!cards.length) return null;
          return (
            <section
              key={section.id}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
            >
              {c.headline ? (
                <h2 className="font-editorial mb-8 text-3xl tracking-[-0.03em] sm:text-4xl">
                  {c.headline}
                </h2>
              ) : null}
              <div className="grid gap-3">
                {cards.map((card, index) => (
                  <details
                    key={`${card.title || "faq"}-${index}`}
                    open={index === 0}
                    className="rounded-[22px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/78 p-5 shadow-[0_12px_40px_rgba(34,34,34,0.08)]"
                  >
                    <summary className="cursor-pointer text-base font-semibold text-[#222222]">
                      {card.title}
                    </summary>
                    {card.body ? (
                      <p className="mt-3 whitespace-pre-line leading-7 text-[#5d6043]">
                        {card.body}
                      </p>
                    ) : null}
                  </details>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === "whatsappBand") {
          if (!c.headline && !c.body && !c.ctaLabel) return null;
          const href = c.ctaHref || "https://api.whatsapp.com/message/QAOMJAY7KI7WP1";
          return (
            <section
              key={section.id}
              className="bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#2F855A] px-4 py-16 text-[#faf9f5] sm:px-6 lg:px-8"
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
                {c.headline ? (
                  <h2 className="font-editorial text-3xl tracking-[-0.03em] sm:text-4xl">
                    {c.headline}
                  </h2>
                ) : null}
                {c.body ? (
                  <p className="max-w-xl text-base leading-7 text-[#faf9f5]/85">{c.body}</p>
                ) : null}
                {c.ctaLabel ? (
                  preview ? (
                    <span className="inline-flex min-h-11 items-center rounded-full bg-[#faf9f5] px-7 py-3 font-semibold text-[#222222]">
                      {c.ctaLabel}
                    </span>
                  ) : (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full bg-[#faf9f5] px-7 py-3 font-semibold text-[#222222] shadow-[0_16px_30px_rgba(34,34,34,0.18)] transition hover:-translate-y-0.5"
                    >
                      {c.ctaLabel}
                    </a>
                  )
                ) : null}
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
