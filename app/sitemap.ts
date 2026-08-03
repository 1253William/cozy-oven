import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store";
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://cozy-oven-bakery-backend-t8x2.onrender.com"
    : "http://localhost:5000");

async function getProductUrls() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/store/customer/products?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const payload = await response.json();
    const products = Array.isArray(payload?.data) ? payload.data : [];

    return products
      .map((product: any) => product.id || product._id)
      .filter(Boolean)
      .map((id: string) => ({
        url: `${siteUrl}/product/${id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

async function getCmsPageUrls() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/cms/pages`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const pages = Array.isArray(payload?.data) ? payload.data : [];
    return pages
      .map((page: { slug?: string; updatedAt?: string }) => page.slug)
      .filter(Boolean)
      .map((slug: string) => ({
        url: `${siteUrl}/pages/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cozy-kart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const [productUrls, cmsUrls] = await Promise.all([getProductUrls(), getCmsPageUrls()]);
  return [...staticRoutes, ...productUrls, ...cmsUrls];
}
