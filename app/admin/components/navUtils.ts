import type { AdminNavItem } from "./navConfig";

/** True when pathname matches href exactly or is a nested route under it. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type NavSectionGroup = {
  section: string;
  items: AdminNavItem[];
};

/** Group flat nav items into ordered sections (preserves item order). */
export function groupNavBySection(items: AdminNavItem[]): NavSectionGroup[] {
  const groups: NavSectionGroup[] = [];
  const indexBySection = new Map<string, number>();

  for (const item of items) {
    const existing = indexBySection.get(item.section);
    if (existing === undefined) {
      indexBySection.set(item.section, groups.length);
      groups.push({ section: item.section, items: [item] });
    } else {
      groups[existing].items.push(item);
    }
  }

  return groups;
}

/** Whether a section label should render before this index in a flat list. */
export function shouldShowSectionLabel(
  items: AdminNavItem[],
  index: number
): boolean {
  if (index === 0) return true;
  return items[index].section !== items[index - 1].section;
}

/** Resolve the nav item whose href best matches the current pathname. */
export function findActiveNavItem(
  items: AdminNavItem[],
  pathname: string
): AdminNavItem | undefined {
  const matches = items.filter((item) => isNavActive(pathname, item.href));
  if (matches.length === 0) return undefined;
  return matches.reduce((best, item) =>
    item.href.length > best.href.length ? item : best
  );
}

export const NAV_SECTIONS_STORAGE_KEY = "admin.navSectionsOpen";

/** Single-item sections (e.g. Overview) stay expanded so Dashboard is never buried. */
export function isSingleItemSection(group: NavSectionGroup): boolean {
  return group.items.length <= 1;
}

export function sectionContainsActive(
  group: NavSectionGroup,
  pathname: string
): boolean {
  return group.items.some((item) => isNavActive(pathname, item.href));
}

/** Parse persisted open-section map from localStorage JSON. */
export function parseStoredOpenSections(
  raw: string | null
): Record<string, boolean> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (typeof value === "boolean") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Initial open map: single-item always open; active section open;
 * otherwise restore manual preference (default closed).
 */
export function buildInitialOpenSections(
  groups: NavSectionGroup[],
  pathname: string,
  stored: Record<string, boolean>
): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const group of groups) {
    if (isSingleItemSection(group)) {
      open[group.section] = true;
      continue;
    }
    if (sectionContainsActive(group, pathname)) {
      open[group.section] = true;
      continue;
    }
    open[group.section] = stored[group.section] === true;
  }
  return open;
}
