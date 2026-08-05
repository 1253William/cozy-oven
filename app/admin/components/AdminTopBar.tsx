"use client";

import {
  Menu01Icon,
  Notification03Icon,
  Search01Icon,
  SidebarLeft01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import AdminIcon from "./AdminIcon";
import { menuItems } from "./navConfig";
import { findActiveNavItem } from "./navUtils";

export type AdminTopBarProps = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileMenuOpen: () => void;
  onOpenCommandPalette: () => void;
  notificationCount: number;
  displayName: string;
};

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-[#faf9f5] text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AdminTopBar({
  pathname,
  collapsed,
  onToggleCollapse,
  onMobileMenuOpen,
  onOpenCommandPalette,
  notificationCount,
  displayName,
}: AdminTopBarProps) {
  const active = findActiveNavItem(menuItems, pathname);
  const pageTitle = active?.name ?? "Admin";
  const sectionLabel = active?.section;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden bg-[#faf9f5] border-b border-[#b9aca2]/60 px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="p-2 rounded-lg hover:bg-[#b9aca2]"
            aria-label="Open menu"
          >
            <AdminIcon icon={Menu01Icon} size={24} />
          </button>
          <h1 className="text-lg font-bold text-[#5d6043]">Cozy Oven</h1>
          <Link
            href="/admin/notifications"
            className="relative p-2 rounded-lg text-[#5d6043] hover:bg-[#b9aca2] transition-colors"
            aria-label={
              notificationCount > 0
                ? `Notifications (${notificationCount} unread)`
                : "Notifications"
            }
          >
            <AdminIcon icon={Notification03Icon} size={22} />
            <NotificationBadge count={notificationCount} />
          </Link>
        </div>
      </header>

      {/* Desktop sticky top bar */}
      <header className="hidden lg:flex sticky top-0 z-30 items-center gap-4 border-b border-[#b9aca2]/60 bg-[#faf9f5]/95 px-6 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 rounded-lg text-[#5d6043] hover:bg-[#b9aca2] transition-colors shrink-0"
        >
          <AdminIcon icon={SidebarLeft01Icon} size={20} />
        </button>

        <div className="min-w-0 flex-1">
          {sectionLabel ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5d6043]/70 truncate">
              {sectionLabel}
            </p>
          ) : null}
          <h1 className="text-lg font-bold text-[#222222] truncate leading-tight">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[#5d6043] hover:bg-[#b9aca2] transition-colors"
            aria-label="Open command palette"
            title="Search (Ctrl+K)"
          >
            <AdminIcon icon={Search01Icon} size={18} />
            <span className="hidden xl:inline text-sm text-[#5d6043]/70">
              Search
            </span>
            <kbd className="hidden xl:inline rounded border border-[#b9aca2]/70 px-1.5 py-0.5 text-[10px] font-medium text-[#5d6043]/70">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/admin/notifications"
            className="relative p-2 rounded-lg text-[#5d6043] hover:bg-[#b9aca2] transition-colors"
            aria-label={
              notificationCount > 0
                ? `Notifications (${notificationCount} unread)`
                : "Notifications"
            }
            title="Notifications"
          >
            <AdminIcon icon={Notification03Icon} size={20} />
            <NotificationBadge count={notificationCount} />
          </Link>

          <Link
            href="/admin/profile"
            className="ml-1 flex items-center gap-2 rounded-lg p-1.5 pr-2.5 text-[#5d6043] hover:bg-[#b9aca2] transition-colors"
            title="Admin Profile"
            aria-label="Admin Profile"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5d6043] text-xs font-semibold text-[#faf9f5]">
              {initials || (
                <AdminIcon icon={UserCircleIcon} size={18} className="text-[#faf9f5]" />
              )}
            </span>
            <span className="hidden xl:inline text-sm font-medium text-[#222222] max-w-[10rem] truncate">
              {displayName}
            </span>
          </Link>
        </div>
      </header>
    </>
  );
}
