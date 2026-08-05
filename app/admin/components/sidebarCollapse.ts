/** localStorage key for the user's sidebar collapsed preference. */
export const SIDEBAR_COLLAPSED_KEY = "admin.sidebarCollapsed";

/** Route prefixes that auto-collapse the desktop sidebar. */
export const AUTO_COLLAPSE_PREFIXES = [
  "/admin/website",
  "/admin/email-marketing",
  "/admin/orders",
  "/admin/recipes",
  "/admin/operations",
] as const;

/** True when pathname is under a workspace-heavy auto-collapse prefix. */
export function shouldAutoCollapse(pathname: string): boolean {
  return AUTO_COLLAPSE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Read collapsed preference from storage; defaults to expanded (`false`). */
export function readCollapsedPreference(
  storage: Pick<Storage, "getItem"> | null | undefined
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persist collapsed preference to storage. */
export function writeCollapsedPreference(
  collapsed: boolean,
  storage: Pick<Storage, "setItem"> | null | undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "true" : "false");
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Effective desktop collapsed state:
 * - Auto-collapse routes force collapsed unless a session override is set.
 * - Elsewhere, use the persisted preference.
 */
export function getEffectiveCollapsed(options: {
  pathname: string;
  preference: boolean;
  sessionOverride: boolean;
}): boolean {
  const { pathname, preference, sessionOverride } = options;
  if (shouldAutoCollapse(pathname)) {
    return sessionOverride ? false : true;
  }
  return preference;
}

/**
 * Session override after a manual toggle.
 * Expanding on an auto-collapse route sets the override; collapsing clears it.
 */
export function nextSessionOverrideAfterToggle(options: {
  pathname: string;
  nextCollapsed: boolean;
}): boolean {
  const { pathname, nextCollapsed } = options;
  if (nextCollapsed) return false;
  return shouldAutoCollapse(pathname);
}

/**
 * Clear session override when navigating off auto-collapse routes.
 * Moving between auto-collapse routes keeps the override.
 */
export function nextSessionOverrideOnNavigate(options: {
  nextPathname: string;
  sessionOverride: boolean;
}): boolean {
  const { nextPathname, sessionOverride } = options;
  if (!sessionOverride) return false;
  return shouldAutoCollapse(nextPathname);
}
