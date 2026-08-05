"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "./AdminIcon";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems } from "./navConfig";
import { isNavActive, shouldShowSectionLabel } from "./navUtils";

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
};

function NavList({
  pathname,
  collapsed,
  notificationCount,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  notificationCount: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-2">
      {menuItems.map((item, index) => {
        const active = isNavActive(pathname, item.href);

        return (
          <Fragment key={item.name}>
            {shouldShowSectionLabel(menuItems, index) && !collapsed && (
              <li className={index === 0 ? "px-4 pb-1" : "px-4 pb-1 pt-4"}>
                <span className="text-xs font-semibold uppercase text-[#5d6043]/70">
                  {item.section}
                </span>
              </li>
            )}
            <li>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 rounded-lg transition-colors relative group ${
                  collapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                } ${
                  active
                    ? "bg-[#5d6043] text-[#faf9f5]"
                    : "text-[#5d6043] hover:bg-[#b9aca2]"
                }`}
              >
                <AdminIcon icon={item.icon} />
                {!collapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.name === "Notifications" &&
                      notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-[#faf9f5] text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                          {notificationCount > 99
                            ? "99+"
                            : notificationCount}
                        </span>
                      )}
                  </>
                )}
                {collapsed &&
                  item.name === "Notifications" &&
                  notificationCount > 0 && (
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
            </li>
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
