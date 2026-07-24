import { normalizeProductList, Product } from "../services/productService";
import type { CmsPage } from "../services/cmsService";
import { isSaleActive } from "./productPricing";

export { resolveSectionProducts } from "./cmsSectionProducts";

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

export async function fetchCustomerProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/store/customer/products?page=1&limit=100`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return normalizeProductList(Array.isArray(json.data) ? json.data : []);
  } catch {
    return [];
  }
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const products = await fetchCustomerProducts();
  const byId = new Map(products.map((product) => [String(product.id), product]));
  return ids
    .map((id) => byId.get(String(id)))
    .filter(Boolean) as Product[];
}

export async function fetchOnSaleProducts(): Promise<Product[]> {
  const products = await fetchCustomerProducts();
  return products.filter(
    (product) => product.isAvailable !== false && isSaleActive(product)
  );
}
