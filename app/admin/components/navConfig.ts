import type { IconSvgElement } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  Audit01Icon,
  CalculatorIcon,
  CookBookIcon,
  DashboardSquare01Icon,
  DiscountIcon,
  FactoryIcon,
  Globe02Icon,
  HelpCircleIcon,
  InboxIcon,
  MailSend01Icon,
  MoneyBag01Icon,
  Notification03Icon,
  PackageReceiveIcon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  StarIcon,
  UserCircleIcon,
  UserMultiple02Icon,
  WarehouseIcon,
} from "@hugeicons/core-free-icons";

export type AdminNavItem = {
  section: string;
  name: string;
  href: string;
  icon: IconSvgElement;
};

/**
 * Single source of truth for admin sidebar nav.
 * Each item uses a unique Hugeicons glyph (no Package/BarChart3/Mail reuse).
 */
export const menuItems: AdminNavItem[] = [
  {
    section: "Overview",
    name: "Dashboard",
    icon: DashboardSquare01Icon,
    href: "/admin/dashboard",
  },
  {
    section: "Sales",
    name: "Customers",
    icon: UserMultiple02Icon,
    href: "/admin/customers",
  },
  {
    section: "Sales",
    name: "Products",
    icon: ShoppingBag01Icon,
    href: "/admin/products",
  },
  {
    section: "Sales",
    name: "Orders",
    icon: ShoppingCart01Icon,
    href: "/admin/orders",
  },
  {
    section: "Sales",
    name: "Promotions",
    icon: DiscountIcon,
    href: "/admin/promotions",
  },
  {
    section: "Operations",
    name: "Purchases",
    icon: PackageReceiveIcon,
    href: "/admin/inventory",
  },
  {
    section: "Operations",
    name: "Production",
    icon: FactoryIcon,
    href: "/admin/operations/production",
  },
  {
    section: "Operations",
    name: "Finished Stock",
    icon: WarehouseIcon,
    href: "/admin/operations/stock",
  },
  {
    section: "Operations",
    name: "Inventory Review",
    icon: Audit01Icon,
    href: "/admin/operations/counts",
  },
  {
    section: "Costing",
    name: "Cost Items",
    icon: CalculatorIcon,
    href: "/admin/cost-items",
  },
  {
    section: "Costing",
    name: "Recipes",
    icon: CookBookIcon,
    href: "/admin/recipes",
  },
  {
    section: "Finance",
    name: "Overhead Costs",
    icon: MoneyBag01Icon,
    href: "/admin/expenses",
  },
  {
    section: "Finance",
    name: "Reports",
    icon: AnalyticsUpIcon,
    href: "/admin/reports",
  },
  {
    section: "Content",
    name: "Website",
    icon: Globe02Icon,
    href: "/admin/website",
  },
  {
    section: "Content",
    name: "Subscribers",
    icon: InboxIcon,
    href: "/admin/subscribers",
  },
  {
    section: "Content",
    name: "Email Marketing",
    icon: MailSend01Icon,
    href: "/admin/email-marketing",
  },
  {
    section: "Content",
    name: "FAQs",
    icon: HelpCircleIcon,
    href: "/admin/faqs",
  },
  {
    section: "Content",
    name: "Reviews",
    icon: StarIcon,
    href: "/admin/reviews",
  },
  {
    section: "Administration",
    name: "Notifications",
    icon: Notification03Icon,
    href: "/admin/notifications",
  },
  {
    section: "Administration",
    name: "Admin Profile",
    icon: UserCircleIcon,
    href: "/admin/profile",
  },
];
