import { Product, normalizeProductList } from "../services/productService";
import { Faq } from "../services/faqService";
import type { HomepageConfig, HomepageSection } from "../services/cmsService";

const getApiBase = () =>
  (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cozy-oven-bakery-backend-t8x2.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");

export async function fetchHomeProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/api/v1/store/customer/products?page=1&limit=100`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return normalizeProductList(Array.isArray(json.data) ? json.data : []).filter(
      (p) => p.isAvailable !== false
    );
  } catch {
    return [];
  }
}

export async function fetchHomeFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/faqs`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export async function fetchHomeCms(): Promise<HomepageConfig | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/cms/homepage`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export const fallbackHomepageSections = (): HomepageSection[] => [
  {
    id: "hero",
    type: "hero",
    enabled: true,
    sortOrder: 1,
    content: {
      eyebrow: "Tema-baked · Ghana-loved · Gift-ready",
      headline: "Moist banana bread, freshly baked.",
      body: "Homemade loaves and gift boxes for cravings, family tables, and moments worth remembering.",
      ctaLabel: "Shop now",
      ctaHref: "/shop",
      secondaryCtaLabel: "Send a gift box",
      secondaryCtaHref: "/shop#package",
      imageUrl:
        "https://res.cloudinary.com/daljxj4yl/image/upload/v1782461961/cozyoven/products_thumbnails/urzdqfzt92jqdnhx0mef.jpg",
    },
  },
  {
    id: "product-strip",
    type: "productStrip",
    enabled: true,
    sortOrder: 3,
    content: {
      headline: "Customer favourites, freshly baked.",
      body: "Shop our most loved loaves, boxes, and creamy yoghurt treats.",
      ctaLabel: "Shop all",
      ctaHref: "/shop",
    },
  },
  {
    id: "gift-cta",
    type: "giftCta",
    enabled: true,
    sortOrder: 4,
    content: {
      headline: "Send a Cozy Oven gift box.",
      body: "Build a warm gift for birthdays, thank-yous, office teams, and just-because surprises.",
      ctaLabel: "Build a gift box",
      ctaHref: "/shop#package",
      imageUrl: "/gift.png",
    },
  },
  {
    id: "faq",
    type: "faq",
    enabled: true,
    sortOrder: 5,
    content: {
      headline: "Delivery, freshness and gifting.",
    },
  },
  {
    id: "newsletter",
    type: "newsletter",
    enabled: true,
    sortOrder: 6,
    content: {
      headline: "New flavours, fresh bakes and special offers.",
      ctaLabel: "Subscribe",
    },
  },
];
