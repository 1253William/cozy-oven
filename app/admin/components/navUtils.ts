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
