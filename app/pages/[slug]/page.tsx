import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EditorialProductCard from "../../components/EditorialProductCard";
import {
  fetchCmsPageBySlug,
  fetchOnSaleProducts,
  fetchProductsByIds,
} from "../../lib/cmsPageData";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchCmsPageBySlug(slug);
  const canonical = `/pages/${slug}`;

  if (!page) {
    return {
      title: "Page Not Found",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const title = page.seoTitle || `${page.title} | Cozy Oven`;
  const description =
    page.seoDescription ||
    page.content?.body?.slice(0, 160) ||
    `Explore ${page.title} at Cozy Oven.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonical}`,
      siteName: "Cozy Oven",
      images: page.content?.imageUrl
        ? [{ url: page.content.imageUrl, alt: page.title }]
        : undefined,
      type: "website",
    },
  };
}

export default async function CmsStorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchCmsPageBySlug(slug);
  if (!page) notFound();

  const selectedProducts = await fetchProductsByIds(page.content?.productIds || []);
  const saleProducts = page.content?.showOnSaleProducts
    ? await fetchOnSaleProducts()
    : [];

  const products =
    selectedProducts.length > 0
      ? selectedProducts
      : saleProducts;

  const headline = page.content?.headline || page.title;
  const isPromo = page.template === "promo";
  const isSeasonal = page.template === "seasonal";

  return (
    <>
      <Navbar />
      <main className="editorial-shell">
        <section
          className={`relative overflow-hidden ${
            isPromo ? "bg-[#222222] text-[#faf9f5]" : "bg-[#faf9f5] text-[#222222]"
          }`}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <div>
              {isSeasonal && (
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[#bd6325]">
                  Seasonal
                </p>
              )}
              <h1 className="font-editorial text-4xl tracking-[-0.03em] sm:text-5xl">
                {headline}
              </h1>
              {page.content?.body ? (
                <p
                  className={`mt-5 max-w-xl text-base leading-8 ${
                    isPromo ? "text-[#faf9f5]/80" : "text-[#5d6043]"
                  }`}
                >
                  {page.content.body}
                </p>
              ) : null}
              {page.content?.ctaLabel && page.content?.ctaHref ? (
                <Link
                  href={page.content.ctaHref}
                  className={`mt-8 inline-flex ${
                    isPromo ? "editorial-button-outline border-[#faf9f5] text-[#faf9f5]" : "editorial-button"
                  } px-5 py-3`}
                >
                  {page.content.ctaLabel}
                </Link>
              ) : null}
            </div>
            {page.content?.imageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] bg-[#b9aca2]">
                <Image
                  src={page.content.imageUrl}
                  alt={headline}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : null}
          </div>
        </section>

        {products.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="font-editorial mb-8 text-3xl tracking-[-0.03em] text-[#222222]">
              {page.content?.showOnSaleProducts && selectedProducts.length === 0
                ? "On sale"
                : "Shop the picks"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <EditorialProductCard key={product.id} product={product} compact />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
