import { describe, expect, it } from "vitest";
import {
  buildInitialOpenSections,
  findActiveNavItem,
  groupNavBySection,
  isNavActive,
  parseStoredOpenSections,
  shouldShowSectionLabel,
} from "./navUtils";
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
    section: "Operations",
    name: "Production",
    href: "/admin/operations/production",
    icon: stubIcon,
  },
];

describe("isNavActive", () => {
  it("matches exact pathname", () => {
    expect(isNavActive("/admin/orders", "/admin/orders")).toBe(true);
  });

  it("matches nested routes under href", () => {
    expect(isNavActive("/admin/orders/123", "/admin/orders")).toBe(true);
    expect(isNavActive("/admin/website/pages", "/admin/website")).toBe(true);
  });

  it("does not match sibling prefixes", () => {
    expect(isNavActive("/admin/orders-archive", "/admin/orders")).toBe(false);
    expect(isNavActive("/admin/dashboard", "/admin/dash")).toBe(false);
  });

  it("does not match parent when on unrelated path", () => {
    expect(isNavActive("/admin/customers", "/admin/orders")).toBe(false);
  });
});

describe("groupNavBySection", () => {
  it("groups consecutive sections preserving order", () => {
    const groups = groupNavBySection(sampleItems);
    expect(groups.map((g) => g.section)).toEqual([
      "Overview",
      "Sales",
      "Operations",
    ]);
    expect(groups[1].items.map((i) => i.name)).toEqual(["Orders", "Products"]);
  });

  it("returns empty array for empty input", () => {
    expect(groupNavBySection([])).toEqual([]);
  });
});

describe("shouldShowSectionLabel", () => {
  it("shows label for first item and section changes", () => {
    expect(shouldShowSectionLabel(sampleItems, 0)).toBe(true);
    expect(shouldShowSectionLabel(sampleItems, 1)).toBe(true);
    expect(shouldShowSectionLabel(sampleItems, 2)).toBe(false);
    expect(shouldShowSectionLabel(sampleItems, 3)).toBe(true);
  });
});

describe("findActiveNavItem", () => {
  it("returns the most specific matching href", () => {
    const items: AdminNavItem[] = [
      {
        section: "Ops",
        name: "Ops Root",
        href: "/admin/operations",
        icon: stubIcon,
      },
      {
        section: "Ops",
        name: "Production",
        href: "/admin/operations/production",
        icon: stubIcon,
      },
    ];
    expect(
      findActiveNavItem(items, "/admin/operations/production")?.name
    ).toBe("Production");
  });

  it("returns undefined when nothing matches", () => {
    expect(findActiveNavItem(sampleItems, "/admin/unknown")).toBeUndefined();
  });
});

describe("buildInitialOpenSections", () => {
  it("keeps single-item sections open and defaults multi-item to closed", () => {
    const groups = groupNavBySection(sampleItems);
    const open = buildInitialOpenSections(groups, "/admin/dashboard", {});
    expect(open.Overview).toBe(true);
    expect(open.Sales).toBe(false);
    // Operations has only one item in sample → always expanded
    expect(open.Operations).toBe(true);
  });

  it("opens the section containing the active route", () => {
    const groups = groupNavBySection(sampleItems);
    const open = buildInitialOpenSections(groups, "/admin/orders", {});
    expect(open.Sales).toBe(true);
  });

  it("restores manually opened sections from storage", () => {
    const multi: AdminNavItem[] = [
      ...sampleItems,
      {
        section: "Operations",
        name: "Stock",
        href: "/admin/operations/stock",
        icon: stubIcon,
      },
    ];
    const groups = groupNavBySection(multi);
    const open = buildInitialOpenSections(groups, "/admin/dashboard", {
      Operations: true,
    });
    expect(open.Operations).toBe(true);
    expect(open.Sales).toBe(false);
  });
});

describe("parseStoredOpenSections", () => {
  it("returns empty object for invalid JSON", () => {
    expect(parseStoredOpenSections(null)).toEqual({});
    expect(parseStoredOpenSections("{")).toEqual({});
    expect(parseStoredOpenSections("[]")).toEqual({});
  });

  it("keeps only boolean values", () => {
    expect(
      parseStoredOpenSections(JSON.stringify({ Sales: true, Ops: "yes" }))
    ).toEqual({ Sales: true });
  });
});
