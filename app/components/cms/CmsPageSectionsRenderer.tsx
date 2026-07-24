import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import EditorialProductCard from "../EditorialProductCard";
import type { CmsPageSection } from "../../services/cmsService";
import type { Product } from "../../services/productService";

type CmsPageSectionsRendererProps = {
  sections: CmsPageSection[];
  productsBySectionId?: Record<string, Product[]>;
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
        const products = productsBySectionId[section.id] || [];

        if (section.type === "promoBanner" && c.message) {
          return (
            <div
              key={section.id}
              className="bg-[#222222] px-4 py-3 text-center text-sm text-[#faf9f5]"
            >
              <span>{c.message}</span>
              {c.ctaHref ? (
                <CtaLink
                  preview={preview}
                  href={c.ctaHref}
                  className="ml-3 font-semibold underline underline-offset-2"
                >
                  {c.ctaLabel || "Shop"}
                </CtaLink>
              ) : null}
            </div>
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
              {products.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
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

        return null;
      })}
    </>
  );
}
