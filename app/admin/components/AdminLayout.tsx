"use client";

import { Fragment, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import notificationService from "../../services/notificationService";
import AdminIcon from "./AdminIcon";
import { menuItems } from "./navConfig";
import { isNavActive, shouldShowSectionLabel } from "./navUtils";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "Admin") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    // Fetch notification count when user is authenticated
    const fetchNotificationCount = async () => {
      if (user?.role === "Admin") {
        try {
          const response = await notificationService.getUnreadNotifications();
          if (response.success) {
            setNotificationCount(response.unread);
          }
        } catch (error) {
          console.error("Error fetching notification count:", error);
          setNotificationCount(0); // Graceful fallback
        }
      }
    };

    fetchNotificationCount();
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Prevent hydration mismatch by using stable placeholders
  const displayName = user?.fullName || "Admin";
  const displayEmail = user?.email || "";

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (isLoading || !isAuthenticated || user?.role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] text-[#5d6043]">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#faf9f5] border-r border-[#b9aca2]/60 fixed h-full">
        <div className="p-6 border-b border-[#b9aca2]/60">
          <Image src="/cozy3.png" alt="Cozy Oven" width={100} height={60} />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const active = isNavActive(pathname, item.href);

              return (
                <Fragment key={item.name}>
                  {shouldShowSectionLabel(menuItems, index) && (
                    <li className={index === 0 ? "px-4 pb-1" : "px-4 pb-1 pt-4"}>
                      <span className="text-xs font-semibold uppercase text-[#5d6043]/70">
                        {item.section}
                      </span>
                    </li>
                  )}
                <li>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                      active
                        ? "bg-[#5d6043] text-[#faf9f5]"
                        : "text-[#5d6043] hover:bg-[#b9aca2]"
                    }`}
                  >
                    <AdminIcon icon={item.icon} />
                    <span className="font-medium">{item.name}</span>
                    {item.name === "Notifications" && notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-[#faf9f5] text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </Link>
                </li>
                </Fragment>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#b9aca2]/60">
          <div className="mb-3 px-4">
            <p className="text-sm font-semibold text-[#222222] truncate">{displayName}</p>
            <p className="text-xs text-[#5d6043] truncate">{displayEmail}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 flex h-full w-64 flex-col bg-[#faf9f5] border-r border-[#b9aca2]/60 z-50 transform transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-[#b9aca2]/60">
          <div>
            <h1 className="text-xl font-bold text-[#5d6043]">Cozy Oven</h1>
            <p className="text-xs text-[#5d6043]">Admin Panel</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-[#b9aca2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const active = isNavActive(pathname, item.href);

              return (
                <Fragment key={item.name}>
                  {shouldShowSectionLabel(menuItems, index) && (
                    <li className={index === 0 ? "px-4 pb-1" : "px-4 pb-1 pt-4"}>
                      <span className="text-xs font-semibold uppercase text-[#5d6043]/70">
                        {item.section}
                      </span>
                    </li>
                  )}
                <li>
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                      active
                        ? "bg-[#5d6043] text-[#faf9f5]"
                        : "text-[#5d6043] hover:bg-[#b9aca2]"
                    }`}
                  >
                    <AdminIcon icon={item.icon} />
                    <span className="font-medium">{item.name}</span>
                    {item.name === "Notifications" && notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-[#faf9f5] text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </Link>
                </li>
                </Fragment>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#b9aca2]/60">
          <div className="mb-3 px-4">
            <p className="text-sm font-semibold text-[#222222] truncate">{displayName}</p>
            <p className="text-xs text-[#5d6043] truncate">{displayEmail}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Top Bar */}
        <header className="lg:hidden bg-[#faf9f5] border-b border-[#b9aca2]/60 px-4 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-[#b9aca2]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#5d6043]">Cozy Oven</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
