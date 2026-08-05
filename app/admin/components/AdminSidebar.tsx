"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Bookmark01Icon,
  BookmarkOff01Icon,
  Cancel01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "./AdminIcon";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems } from "./navConfig";
import {
  isFavorite,
  MAX_NAV_FAVORITES,
  resolveFavoriteItems,
} from "./navFavorites";
import {
  buildInitialOpenSections,
  groupNavBySection,
  isNavActive,
  isSingleItemSection,
  NAV_SECTIONS_STORAGE_KEY,
  parseStoredOpenSections,
  sectionContainsActive,
} from "./navUtils";

export type AdminSidebarProps = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  notificationCount: number;
  displayName: string;
  displayEmail: string;
  onLogout: () => void;
  favoriteHrefs: string[];
  onToggleFavorite: (href: string) => void;
};

function FavoritePinButton({
  href,
  name,
  favorited,
  atLimit,
  onToggleFavorite,
}: {
  href: string;
  name: string;
  favorited: boolean;
  atLimit: boolean;
  onToggleFavorite: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite(href);
      }}
      disabled={!favorited && atLimit}
      title={
        favorited
          ? "Unpin"
          : atLimit
            ? `Maximum ${MAX_NAV_FAVORITES} favorites`
            : "Pin favorite"
      }
      aria-label={favorited ? `Unpin ${name}` : `Pin ${name}`}
      className={`shrink-0 rounded-md p-1 transition-opacity ${
        favorited
          ? "text-[#5d6043] opacity-100"
          : "text-[#5d6043]/70 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      } hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-30`}
    >
      <AdminIcon
        icon={favorited ? BookmarkOff01Icon : Bookmark01Icon}
        size={14}
      />
    </button>
  );
}

function NavLinkItem({
  item,
  pathname,
  collapsed,
  notificationCount,
  favorited,
  atFavoriteLimit,
  onToggleFavorite,
  onNavigate,
  showPin,
}: {
  item: (typeof menuItems)[number];
  pathname: string;
  collapsed: boolean;
  notificationCount: number;
  favorited: boolean;
  atFavoriteLimit: boolean;
  onToggleFavorite: (href: string) => void;
  onNavigate?: () => void;
  showPin: boolean;
}) {
  const active = isNavActive(pathname, item.href);
  const showNotificationBadge =
    item.name === "Notifications" && notificationCount > 0;

  return (
    <li>
      <div
        className={`group relative flex items-center rounded-lg transition-colors ${
          active
            ? "bg-[#5d6043] text-[#faf9f5]"
            : "text-[#5d6043] hover:bg-[#b9aca2]"
        }`}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          title={collapsed ? item.name : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 ${
            collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
          } ${showPin && !collapsed ? "pr-2" : ""}`}
        >
          <AdminIcon icon={item.icon} />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate font-medium">
                {item.name}
              </span>
              {showNotificationBadge && (
                <span className="ml-auto bg-red-500 text-[#faf9f5] text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </>
          )}
          {collapsed && showNotificationBadge && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-[#faf9f5] text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#222222] px-2 py-1 text-xs font-medium text-[#faf9f5] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              {item.name}
            </span>
          )}
        </Link>
        {showPin && !collapsed && (
          <div className={`pr-2 ${active ? "text-[#faf9f5]" : ""}`}>
            <FavoritePinButton
              href={item.href}
              name={item.name}
              favorited={favorited}
              atLimit={atFavoriteLimit}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function NavList({
  pathname,
  collapsed,
  notificationCount,
  favoriteHrefs,
  onToggleFavorite,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  notificationCount: number;
  favoriteHrefs: string[];
  onToggleFavorite: (href: string) => void;
  onNavigate?: () => void;
}) {
  const favoriteItems = resolveFavoriteItems(menuItems, favoriteHrefs);
  const atFavoriteLimit = favoriteHrefs.length >= MAX_NAV_FAVORITES;
  const groups = useMemo(() => groupNavBySection(menuItems), []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") {
        return buildInitialOpenSections(groups, pathname, {});
      }
      const stored = parseStoredOpenSections(
        window.localStorage.getItem(NAV_SECTIONS_STORAGE_KEY)
      );
      return buildInitialOpenSections(groups, pathname, stored);
    }
  );

  // Keep the active route's section expanded when navigating.
  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const group of groups) {
        if (isSingleItemSection(group)) {
          if (!next[group.section]) {
            next[group.section] = true;
            changed = true;
          }
          continue;
        }
        if (sectionContainsActive(group, pathname) && !next[group.section]) {
          next[group.section] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname, groups]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        NAV_SECTIONS_STORAGE_KEY,
        JSON.stringify(openSections)
      );
    } catch {
      // ignore quota / private mode
    }
  }, [openSections]);

  const toggleSection = (section: string, forceOpen?: boolean) => {
    const group = groups.find((g) => g.section === section);
    if (group && isSingleItemSection(group)) return;

    setOpenSections((prev) => {
      const nextOpen = forceOpen ?? !prev[section];
      return { ...prev, [section]: nextOpen };
    });
  };

  return (
    <ul className="space-y-2">
      {favoriteItems.length > 0 && (
        <>
          {!collapsed && (
            <li className="px-4 pb-1">
              <span className="text-xs font-semibold uppercase text-[#5d6043]/70">
                Favorites
              </span>
            </li>
          )}
          {favoriteItems.map((item) => (
            <NavLinkItem
              key={`fav-${item.href}`}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              notificationCount={notificationCount}
              favorited
              atFavoriteLimit={atFavoriteLimit}
              onToggleFavorite={onToggleFavorite}
              onNavigate={onNavigate}
              showPin={!collapsed}
            />
          ))}
          <li
            className={`${collapsed ? "mx-1 my-2" : "mx-2 my-3"} border-t border-[#b9aca2]/50`}
            aria-hidden
          />
        </>
      )}

      {groups.map((group, groupIndex) => {
        const isOpen =
          isSingleItemSection(group) || openSections[group.section] === true;
        const hasActive = sectionContainsActive(group, pathname);

        return (
          <Fragment key={group.section}>
            <li className={groupIndex === 0 ? "" : "pt-2"}>
              <button
                type="button"
                onClick={() => toggleSection(group.section)}
                disabled={isSingleItemSection(group)}
                aria-expanded={isOpen}
                title={collapsed ? group.section : undefined}
                className={`flex w-full items-center rounded-lg text-[#5d6043] transition-colors ${
                  collapsed
                    ? "justify-center px-2 py-2 hover:bg-[#b9aca2]/40"
                    : "justify-between px-4 py-2 hover:bg-[#b9aca2]/30"
                } ${hasActive ? "font-semibold" : ""} ${
                  isSingleItemSection(group) ? "cursor-default" : ""
                }`}
              >
                {collapsed ? (
                  <span className="relative group/section">
                    <span className="text-[10px] font-bold uppercase tracking-wide">
                      {group.section.slice(0, 3)}
                    </span>
                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#222222] px-2 py-1 text-xs font-medium text-[#faf9f5] opacity-0 shadow-sm transition-opacity group-hover/section:opacity-100">
                      {group.section}
                      {isOpen ? " · open" : " · closed"}
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#5d6043]/80">
                      {group.section}
                    </span>
                    {!isSingleItemSection(group) && (
                      <AdminIcon
                        icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                        size={14}
                      />
                    )}
                  </>
                )}
              </button>
            </li>

            {isOpen &&
              group.items.map((item) => {
                const favorited = isFavorite(item.href, favoriteHrefs);
                return (
                  <NavLinkItem
                    key={item.name}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    notificationCount={notificationCount}
                    favorited={favorited}
                    atFavoriteLimit={atFavoriteLimit}
                    onToggleFavorite={onToggleFavorite}
                    onNavigate={onNavigate}
                    showPin
                  />
                );
              })}
          </Fragment>
        );
      })}
    </ul>
  );
}

function UserFooter({
  collapsed,
  displayName,
  displayEmail,
  onLogout,
}: {
  collapsed: boolean;
  displayName: string;
  displayEmail: string;
  onLogout: () => void;
}) {
  return (
    <div className={`border-t border-[#b9aca2]/60 ${collapsed ? "p-2" : "p-4"}`}>
      {!collapsed && (
        <div className="mb-3 px-4">
          <p className="text-sm font-semibold text-[#222222] truncate">
            {displayName}
          </p>
          <p className="text-xs text-[#5d6043] truncate">{displayEmail}</p>
        </div>
      )}

      <button
        onClick={onLogout}
        title={collapsed ? "Logout" : undefined}
        className={`flex items-center rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full group relative ${
          collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
        }`}
      >
        <AdminIcon icon={Logout01Icon} size={20} />
        {!collapsed && <span className="font-medium">Logout</span>}
        {collapsed && (
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#222222] px-2 py-1 text-xs font-medium text-[#faf9f5] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            Logout
          </span>
        )}
      </button>
    </div>
  );
}

export default function AdminSidebar({
  pathname,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  notificationCount,
  displayName,
  displayEmail,
  onLogout,
  favoriteHrefs,
  onToggleFavorite,
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-[#faf9f5] border-r border-[#b9aca2]/60 fixed h-full z-40 transition-[width] duration-300 ease-in-out ${
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        }`}
      >
        <div
          className={`border-b border-[#b9aca2]/60 flex items-center ${
            collapsed ? "p-3 justify-center" : "p-6 justify-between"
          }`}
        >
          {!collapsed && (
            <Image src="/cozy3.png" alt="Cozy Oven" width={100} height={60} />
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-lg text-[#5d6043] hover:bg-[#b9aca2] transition-colors shrink-0"
          >
            {collapsed ? (
              <AdminIcon icon={ArrowRight01Icon} size={20} />
            ) : (
              <AdminIcon icon={ArrowLeft01Icon} size={20} />
            )}
          </button>
        </div>

        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            collapsed ? "p-2" : "p-4"
          }`}
        >
          <NavList
            pathname={pathname}
            collapsed={collapsed}
            notificationCount={notificationCount}
            favoriteHrefs={favoriteHrefs}
            onToggleFavorite={onToggleFavorite}
          />
        </nav>

        <UserFooter
          collapsed={collapsed}
          displayName={displayName}
          displayEmail={displayEmail}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 flex h-full w-64 flex-col bg-[#faf9f5] border-r border-[#b9aca2]/60 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#b9aca2]/60">
          <div>
            <h1 className="text-xl font-bold text-[#5d6043]">Cozy Oven</h1>
            <p className="text-xs text-[#5d6043]">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-[#b9aca2]"
            aria-label="Close menu"
          >
            <AdminIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <NavList
            pathname={pathname}
            collapsed={false}
            notificationCount={notificationCount}
            favoriteHrefs={favoriteHrefs}
            onToggleFavorite={onToggleFavorite}
            onNavigate={onMobileClose}
          />
        </nav>

        <UserFooter
          collapsed={false}
          displayName={displayName}
          displayEmail={displayEmail}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}
