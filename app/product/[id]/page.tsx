import type { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store";
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://cozy-oven-bakery-backend-t8x2.onrender.com"
    : "http://localhost:5000");

const stripTags = (value?: string) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

async function getProduct(id: string) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/store/customer/products/${id}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const raw = payload?.data;
    if (!raw) return null;

    return {
      id: raw.id || raw._id || id,
      name: raw.productName,
      description: stripTags(raw.productDetails),
      price: Number(raw.price || 0),
      thumbnail: raw.thumbnail || raw.productThumbnail,
      images: raw.images || raw.productImages || [],
      isAvailable: raw.isAvailable !== false && raw.productStatus !== "out of stock",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  const canonical = `/product/${id}`;

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
      alternates: { canonical },
    };
  }

  const title = `${product.name} | Cozy Oven`;
  const description =
    product.description ||
    `Order ${product.name} from Cozy Oven for premium banana bread, gift boxes, and baked treats in Ghana.`;
  const image = product.thumbnail || product.images[0] || "/gift.png";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonical}`,
      siteName: "Cozy Oven",
      images: [{ url: image, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  const canonicalUrl = `${siteUrl}/product/${id}`;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: [product.thumbnail, ...product.images].filter(Boolean),
        brand: {
          "@type": "Brand",
          name: "Cozy Oven",
        },
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "GHS",
          price: product.price.toFixed(2),
          availability: product.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
        />
      )}
      <ProductDetailsClient />
    </>
  );
}
