"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  File01Icon,
  Globe02Icon,
  Home01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import AdminIcon from "../components/AdminIcon";

const TABS: { href: string; label: string; icon: IconSvgElement }[] = [
  { href: "/admin/website", label: "Home", icon: Home01Icon },
  { href: "/admin/website/about", label: "About", icon: InformationCircleIcon },
  { href: "/admin/website/pages", label: "Pages", icon: File01Icon },
  { href: "/admin/website/site", label: "Site", icon: Globe02Icon },
];

export default function WebsiteTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin/website"
            ? pathname === "/admin/website"
            : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-[#5d6043] text-[#faf9f5]"
                : "bg-[#faf9f5] text-[#5d6043] ring-1 ring-[#b9aca2] hover:bg-[#eeeae0]"
            }`}
          >
            <AdminIcon icon={tab.icon} size={16} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
