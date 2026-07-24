import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CmsPageSectionsRenderer from "../../components/cms/CmsPageSectionsRenderer";
import {
  fetchCmsPageBySlug,
  fetchCustomerProducts,
  fetchOnSaleProducts,
  resolveSectionProducts,
} from "../../lib/cmsPageData";
import { splitLeadingPromo } from "../../lib/cmsSectionOrder";
import type { Product } from "../../services/productService";

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

  const firstText = page.sections?.find(
    (section) => section.content?.body || section.content?.headline
  )?.content;
  const title = page.seoTitle || `${page.title} | Cozy Oven`;
  const description =
    page.seoDescription ||
    firstText?.body?.slice(0, 160) ||
    firstText?.headline ||
    page.content?.body?.slice(0, 160) ||
    `Explore ${page.title} at Cozy Oven.`;

  const imageUrl =
    page.sections?.find((section) => section.content?.imageUrl)?.content?.imageUrl ||
    page.content?.imageUrl;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonical}`,
      siteName: "Cozy Oven",
      images: imageUrl ? [{ url: imageUrl, alt: page.title }] : undefined,
      type: "website",
    },
  };
}

export default async function CmsStorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchCmsPageBySlug(slug);
  if (!page) notFound();

  const sections = page.sections || [];
  const { leadingPromo, rest } = splitLeadingPromo(sections);
  const bodySections = leadingPromo ? rest : sections;
  const needsProducts = bodySections.some((section) => section.type === "productStrip");

  const allProducts = needsProducts ? await fetchCustomerProducts() : [];
  const saleProducts = bodySections.some(
    (section) => section.type === "productStrip" && section.content?.showOnSaleProducts
  )
    ? await fetchOnSaleProducts()
    : [];

  const productsBySectionId: Record<string, Product[]> = {};
  for (const section of bodySections) {
    if (section.type !== "productStrip") continue;
    productsBySectionId[section.id] = resolveSectionProducts(section, {
      allProducts,
      saleProducts,
    });
  }

  return (
    <>
      {/* Clears the fixed delivery banner so chrome below isn’t covered */}
      <div className="h-9 shrink-0" aria-hidden />
      {leadingPromo ? (
        <CmsPageSectionsRenderer sections={[leadingPromo]} />
      ) : null}
      <Navbar />
      <main className="editorial-shell">
        <CmsPageSectionsRenderer
          sections={bodySections}
          productsBySectionId={productsBySectionId}
        />
      </main>
      <Footer />
    </>
  );
}
