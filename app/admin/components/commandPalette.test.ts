import { describe, expect, it } from "vitest";
import { filterCommandPaletteItems } from "./commandPalette";
import type { AdminNavItem } from "./navConfig";

const stubIcon = [] as unknown as AdminNavItem["icon"];

const sampleItems: AdminNavItem[] = [
  {
    section: "Overview",
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: stubIcon,
  },
  {
    section: "Sales",
    name: "Orders",
    href: "/admin/orders",
    icon: stubIcon,
  },
  {
    section: "Sales",
    name: "Products",
    href: "/admin/products",
    icon: stubIcon,
  },
  {
    section: "Content",
    name: "Email Marketing",
    href: "/admin/email-marketing",
    icon: stubIcon,
  },
];

describe("filterCommandPaletteItems", () => {
  it("returns all items when query is empty", () => {
    expect(filterCommandPaletteItems(sampleItems, "").map((i) => i.name)).toEqual(
      ["Dashboard", "Orders", "Products", "Email Marketing"]
    );
  });

  it("filters by name (case-insensitive)", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "ord").map((i) => i.name)
    ).toEqual(["Orders"]);
  });

  it("filters by section", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "sales").map((i) => i.name)
    ).toEqual(["Orders", "Products"]);
  });

  it("filters by href", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "email-marketing").map(
        (i) => i.name
      )
    ).toEqual(["Email Marketing"]);
  });

  it("puts favorites first in favorite order", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "", [
        "/admin/products",
        "/admin/dashboard",
      ]).map((i) => i.name)
    ).toEqual(["Products", "Dashboard", "Orders", "Email Marketing"]);
  });

  it("keeps favorites-first order after filtering", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "s", [
        "/admin/products",
        "/admin/dashboard",
      ]).map((i) => i.name)
    ).toEqual(["Products", "Dashboard", "Orders"]);
  });

  it("ignores favorite hrefs that are not in the filtered set", () => {
    expect(
      filterCommandPaletteItems(sampleItems, "email", [
        "/admin/orders",
        "/admin/email-marketing",
      ]).map((i) => i.name)
    ).toEqual(["Email Marketing"]);
  });
});
