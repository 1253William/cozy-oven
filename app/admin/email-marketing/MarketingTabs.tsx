"use client";

import Link from "next/link";
import {
  Clock01Icon,
  MailSend01Icon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import AdminIcon from "../components/AdminIcon";
import type { MarketingTab } from "./emailMarketingUtils";

const TABS: { id: MarketingTab; label: string; icon: IconSvgElement; href: string }[] = [
  { id: "compose", label: "Compose", icon: MailSend01Icon, href: "/admin/email-marketing?tab=compose" },
  { id: "templates", label: "Templates", icon: PaintBoardIcon, href: "/admin/email-marketing?tab=templates" },
  { id: "history", label: "History", icon: Clock01Icon, href: "/admin/email-marketing?tab=history" },
];

export default function MarketingTabs({ active }: { active: MarketingTab }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
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
