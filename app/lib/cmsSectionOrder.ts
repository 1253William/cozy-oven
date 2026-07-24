import type { CmsPageSection } from "../services/cmsService";

/** Enabled sections in display order. */
export function sortEnabledCmsSections(
  sections: CmsPageSection[] | null | undefined,
  includeDisabled = false
): CmsPageSection[] {
  return [...(sections || [])]
    .filter((section) => includeDisabled || section.enabled !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * If the first section is a promo, pull it out so the storefront can render it
 * above the sticky navbar (below the fixed delivery banner).
 */
export function splitLeadingPromo(sections: CmsPageSection[] | null | undefined): {
  leadingPromo: CmsPageSection | null;
  rest: CmsPageSection[];
} {
  const sorted = sortEnabledCmsSections(sections);
  const first = sorted[0];
  const hasPromoCopy = Boolean(
    String(first?.content?.message || first?.content?.headline || "").trim()
  );

  if (first?.type === "promoBanner" && hasPromoCopy) {
    return { leadingPromo: first, rest: sorted.slice(1) };
  }

  return { leadingPromo: null, rest: sorted };
}
