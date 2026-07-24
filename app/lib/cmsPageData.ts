import { normalizeProductList, Product } from "../services/productService";
import type { CmsPage } from "../services/cmsService";
import { isSaleActive } from "./productPricing";

const getApiBase = () =>
  (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cozy-oven-bakery-backend.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");

export async function fetchCmsPageBySlug(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/cms/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  try {
    const res = await fetch(
      `${getApiBase()}/api/v1/store/customer/products?page=1&limit=100`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const products = normalizeProductList(Array.isArray(json.data) ? json.data : []);
    const wanted = new Set(ids.map(String));
    return products.filter((product) => wanted.has(String(product.id)));
  } catch {
    return [];
  }
}

export async function fetchOnSaleProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/api/v1/store/customer/products?page=1&limit=100`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const products = normalizeProductList(Array.isArray(json.data) ? json.data : []);
    return products.filter(
      (product) => product.isAvailable !== false && isSaleActive(product)
    );
  } catch {
    return [];
  }
}
