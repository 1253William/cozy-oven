/** localStorage key for pinned admin nav hrefs. */
export const NAV_FAVORITES_KEY = "admin.navFavorites";

/** Maximum number of pinned nav items. */
export const MAX_NAV_FAVORITES = 5;

/** Normalize a raw favorites list: strings only, unique, capped. */
export function normalizeFavorites(
  hrefs: unknown,
  max: number = MAX_NAV_FAVORITES
): string[] {
  if (!Array.isArray(hrefs)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of hrefs) {
    if (typeof value !== "string" || value.length === 0) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= max) break;
  }
  return result;
}

/** Read favorite hrefs from storage; defaults to empty. */
export function readFavorites(
  storage: Pick<Storage, "getItem"> | null | undefined
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(NAV_FAVORITES_KEY);
    if (!raw) return [];
    return normalizeFavorites(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** Persist favorite hrefs to storage. */
export function writeFavorites(
  hrefs: string[],
  storage: Pick<Storage, "setItem"> | null | undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(
      NAV_FAVORITES_KEY,
      JSON.stringify(normalizeFavorites(hrefs))
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export type ToggleFavoriteResult = {
  favorites: string[];
  /** False when the href was not already pinned and the list is at max. */
  changed: boolean;
};

/**
 * Toggle a nav href in the favorites list.
 * Unpinning always succeeds. Pinning fails (unchanged) when already at max.
 */
export function toggleFavorite(
  href: string,
  favorites: string[],
  max: number = MAX_NAV_FAVORITES
): ToggleFavoriteResult {
  const current = normalizeFavorites(favorites, max);
  if (current.includes(href)) {
    return {
      favorites: current.filter((item) => item !== href),
      changed: true,
    };
  }
  if (current.length >= max) {
    return { favorites: current, changed: false };
  }
  return { favorites: [...current, href], changed: true };
}

/** Whether an href is currently favorited. */
export function isFavorite(href: string, favorites: string[]): boolean {
  return favorites.includes(href);
}

/**
 * Resolve favorite hrefs to nav items, preserving favorite order.
 * Unknown hrefs are skipped.
 */
export function resolveFavoriteItems<T extends { href: string }>(
  items: T[],
  favoriteHrefs: string[]
): T[] {
  const byHref = new Map(items.map((item) => [item.href, item]));
  const resolved: T[] = [];
  for (const href of favoriteHrefs) {
    const item = byHref.get(href);
    if (item) resolved.push(item);
  }
  return resolved;
}
