"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/website", label: "Home" },
  { href: "/admin/website/pages", label: "Pages" },
];

export default function WebsiteTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin/website"
            ? pathname === "/admin/website"
            : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-[#5d6043] text-[#faf9f5]"
                : "bg-[#faf9f5] text-[#5d6043] ring-1 ring-[#b9aca2] hover:bg-[#eeeae0]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
