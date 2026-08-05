import { describe, expect, it } from "vitest";
import {
  AUTO_COLLAPSE_PREFIXES,
  getEffectiveCollapsed,
  nextSessionOverrideAfterToggle,
  nextSessionOverrideOnNavigate,
  readCollapsedPreference,
  shouldAutoCollapse,
  SIDEBAR_COLLAPSED_KEY,
  writeCollapsedPreference,
} from "./sidebarCollapse";

function createMemoryStorage(
  initial: Record<string, string> = {}
): Storage {
  const store = { ...initial };
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      for (const key of Object.keys(store)) delete store[key];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    key() {
      return null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  };
}

describe("shouldAutoCollapse", () => {
  it.each(AUTO_COLLAPSE_PREFIXES)(
    "matches exact prefix %s",
    (prefix) => {
      expect(shouldAutoCollapse(prefix)).toBe(true);
    }
  );

  it("matches nested routes under prefixes", () => {
    expect(shouldAutoCollapse("/admin/website/pages")).toBe(true);
    expect(shouldAutoCollapse("/admin/orders/123")).toBe(true);
    expect(shouldAutoCollapse("/admin/operations/production")).toBe(true);
    expect(shouldAutoCollapse("/admin/email-marketing/campaigns")).toBe(true);
    expect(shouldAutoCollapse("/admin/recipes/abc")).toBe(true);
  });

  it("does not match sibling or unrelated paths", () => {
    expect(shouldAutoCollapse("/admin/dashboard")).toBe(false);
    expect(shouldAutoCollapse("/admin/customers")).toBe(false);
    expect(shouldAutoCollapse("/admin/orders-archive")).toBe(false);
    expect(shouldAutoCollapse("/admin/website-settings")).toBe(false);
  });
});

describe("readCollapsedPreference / writeCollapsedPreference", () => {
  it("defaults to expanded when storage is missing or empty", () => {
    expect(readCollapsedPreference(null)).toBe(false);
    expect(readCollapsedPreference(undefined)).toBe(false);
    expect(readCollapsedPreference(createMemoryStorage())).toBe(false);
  });

  it("reads true/false from storage", () => {
    expect(
      readCollapsedPreference(
        createMemoryStorage({ [SIDEBAR_COLLAPSED_KEY]: "true" })
      )
    ).toBe(true);
    expect(
      readCollapsedPreference(
        createMemoryStorage({ [SIDEBAR_COLLAPSED_KEY]: "false" })
      )
    ).toBe(false);
  });

  it("writes preference to storage", () => {
    const storage = createMemoryStorage();
    writeCollapsedPreference(true, storage);
    expect(storage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe("true");
    writeCollapsedPreference(false, storage);
    expect(storage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe("false");
  });

  it("no-ops write when storage is unavailable", () => {
    expect(() => writeCollapsedPreference(true, null)).not.toThrow();
  });
});

describe("getEffectiveCollapsed", () => {
  it("uses preference on non-auto-collapse routes", () => {
    expect(
      getEffectiveCollapsed({
        pathname: "/admin/dashboard",
        preference: true,
        sessionOverride: false,
      })
    ).toBe(true);
    expect(
      getEffectiveCollapsed({
        pathname: "/admin/dashboard",
        preference: false,
        sessionOverride: false,
      })
    ).toBe(false);
  });

  it("forces collapse on auto-collapse routes without override", () => {
    expect(
      getEffectiveCollapsed({
        pathname: "/admin/orders",
        preference: false,
        sessionOverride: false,
      })
    ).toBe(true);
  });

  it("stays expanded on auto-collapse routes with session override", () => {
    expect(
      getEffectiveCollapsed({
        pathname: "/admin/website/pages",
        preference: true,
        sessionOverride: true,
      })
    ).toBe(false);
  });
});

describe("nextSessionOverrideAfterToggle", () => {
  it("sets override when expanding on an auto-collapse route", () => {
    expect(
      nextSessionOverrideAfterToggle({
        pathname: "/admin/orders",
        nextCollapsed: false,
      })
    ).toBe(true);
  });

  it("does not set override when expanding on a normal route", () => {
    expect(
      nextSessionOverrideAfterToggle({
        pathname: "/admin/dashboard",
        nextCollapsed: false,
      })
    ).toBe(false);
  });

  it("clears override when collapsing", () => {
    expect(
      nextSessionOverrideAfterToggle({
        pathname: "/admin/orders",
        nextCollapsed: true,
      })
    ).toBe(false);
  });
});

describe("nextSessionOverrideOnNavigate", () => {
  it("keeps override when staying on auto-collapse routes", () => {
    expect(
      nextSessionOverrideOnNavigate({
        nextPathname: "/admin/website/pages",
        sessionOverride: true,
      })
    ).toBe(true);
  });

  it("clears override when leaving auto-collapse routes", () => {
    expect(
      nextSessionOverrideOnNavigate({
        nextPathname: "/admin/dashboard",
        sessionOverride: true,
      })
    ).toBe(false);
  });

  it("stays false when override was already off", () => {
    expect(
      nextSessionOverrideOnNavigate({
        nextPathname: "/admin/orders",
        sessionOverride: false,
      })
    ).toBe(false);
  });
});
