import type { CmsPageSection } from "../services/cmsService";
import type { Product } from "../services/productService";
import { isSaleActive } from "./productPricing";

export function resolveSectionProducts(
  section: CmsPageSection,
  opts: {
    allProducts: Product[];
    saleProducts?: Product[];
  }
): Product[] {
  const content = section.content || {};
  const wanted = Array.isArray(content.productIds)
    ? content.productIds.map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (wanted.length > 0) {
    const byId = new Map(opts.allProducts.map((product) => [String(product.id), product]));
    const selected = wanted
      .map((id) => byId.get(String(id)))
      .filter(Boolean) as Product[];
    if (selected.length > 0) return selected;
  }

  const category = content.categoryFilter?.trim() || "";
  if (category) {
    const filtered = opts.allProducts.filter((product) =>
      product.productCategory?.toLowerCase().includes(category.toLowerCase())
    );
    if (filtered.length > 0) return filtered.slice(0, 12);
  }

  if (content.showOnSaleProducts) {
    const sale =
      opts.saleProducts ||
      opts.allProducts.filter(
        (product) => product.isAvailable !== false && isSaleActive(product)
      );
    return sale.slice(0, 12);
  }

  return [];
}
