import type { AdminNavItem } from "./navConfig";

/**
 * Filter nav items by query and sort favorites first (favorite order),
 * then remaining items in their original order.
 */
export function filterCommandPaletteItems(
  items: AdminNavItem[],
  query: string,
  favoriteHrefs: string[] = []
): AdminNavItem[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q)
        );
      })
    : items;

  if (favoriteHrefs.length === 0) return filtered;

  const filteredByHref = new Map(filtered.map((item) => [item.href, item]));
  const favoriteSet = new Set(favoriteHrefs);
  const favoritesFirst: AdminNavItem[] = [];

  for (const href of favoriteHrefs) {
    const item = filteredByHref.get(href);
    if (item) favoritesFirst.push(item);
  }

  const rest = filtered.filter((item) => !favoriteSet.has(item.href));
  return [...favoritesFirst, ...rest];
}
