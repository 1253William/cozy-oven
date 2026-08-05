import { describe, expect, it } from "vitest";
import {
  isFavorite,
  MAX_NAV_FAVORITES,
  NAV_FAVORITES_KEY,
  normalizeFavorites,
  readFavorites,
  resolveFavoriteItems,
  toggleFavorite,
  writeFavorites,
} from "./navFavorites";

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

describe("normalizeFavorites", () => {
  it("keeps unique strings in order and caps at max", () => {
    expect(
      normalizeFavorites(
        ["/a", "/b", "/a", "", 1, "/c", "/d", "/e", "/f"],
        5
      )
    ).toEqual(["/a", "/b", "/c", "/d", "/e"]);
  });

  it("returns empty for non-arrays", () => {
    expect(normalizeFavorites(null)).toEqual([]);
    expect(normalizeFavorites("nope")).toEqual([]);
  });
});

describe("readFavorites / writeFavorites", () => {
  it("defaults to empty when storage is missing or empty", () => {
    expect(readFavorites(null)).toEqual([]);
    expect(readFavorites(undefined)).toEqual([]);
    expect(readFavorites(createMemoryStorage())).toEqual([]);
  });

  it("reads valid JSON arrays from storage", () => {
    const storage = createMemoryStorage({
      [NAV_FAVORITES_KEY]: JSON.stringify([
        "/admin/orders",
        "/admin/products",
      ]),
    });
    expect(readFavorites(storage)).toEqual([
      "/admin/orders",
      "/admin/products",
    ]);
  });

  it("returns empty on invalid JSON", () => {
    const storage = createMemoryStorage({
      [NAV_FAVORITES_KEY]: "{not-json",
    });
    expect(readFavorites(storage)).toEqual([]);
  });

  it("writes normalized favorites to storage", () => {
    const storage = createMemoryStorage();
    writeFavorites(["/admin/orders", "/admin/orders", "/admin/products"], storage);
    expect(JSON.parse(storage.getItem(NAV_FAVORITES_KEY)!)).toEqual([
      "/admin/orders",
      "/admin/products",
    ]);
  });

  it("no-ops write when storage is unavailable", () => {
    expect(() => writeFavorites(["/admin/orders"], null)).not.toThrow();
  });
});

describe("toggleFavorite", () => {
  it("pins a new href", () => {
    expect(toggleFavorite("/admin/orders", [])).toEqual({
      favorites: ["/admin/orders"],
      changed: true,
    });
  });

  it("unpins an existing href", () => {
    expect(
      toggleFavorite("/admin/orders", ["/admin/orders", "/admin/products"])
    ).toEqual({
      favorites: ["/admin/products"],
      changed: true,
    });
  });

  it("does not pin beyond the max limit", () => {
    const full = Array.from(
      { length: MAX_NAV_FAVORITES },
      (_, i) => `/admin/item-${i}`
    );
    expect(toggleFavorite("/admin/extra", full)).toEqual({
      favorites: full,
      changed: false,
    });
  });

  it("still allows unpin when at the limit", () => {
    const full = Array.from(
      { length: MAX_NAV_FAVORITES },
      (_, i) => `/admin/item-${i}`
    );
    const result = toggleFavorite(full[0], full);
    expect(result.changed).toBe(true);
    expect(result.favorites).toHaveLength(MAX_NAV_FAVORITES - 1);
    expect(result.favorites).not.toContain(full[0]);
  });
});

describe("isFavorite", () => {
  it("detects membership", () => {
    expect(isFavorite("/admin/orders", ["/admin/orders"])).toBe(true);
    expect(isFavorite("/admin/orders", ["/admin/products"])).toBe(false);
  });
});

describe("resolveFavoriteItems", () => {
  it("resolves known hrefs in favorite order and skips unknown", () => {
    const items = [
      { href: "/admin/dashboard", name: "Dashboard" },
      { href: "/admin/orders", name: "Orders" },
      { href: "/admin/products", name: "Products" },
    ];
    expect(
      resolveFavoriteItems(items, [
        "/admin/products",
        "/admin/missing",
        "/admin/orders",
      ]).map((i) => i.name)
    ).toEqual(["Products", "Orders"]);
  });
});
