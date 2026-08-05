"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import {
  getEffectiveCollapsed,
  nextSessionOverrideAfterToggle,
  nextSessionOverrideOnNavigate,
  readCollapsedPreference,
  writeCollapsedPreference,
} from "./sidebarCollapse";

interface AdminLayoutProps {
  children: ReactNode;
}

const COLLAPSED_CHANGE_EVENT = "admin-sidebar-collapsed";

function subscribeCollapsedPreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COLLAPSED_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COLLAPSED_CHANGE_EVENT, onStoreChange);
  };
}

function getCollapsedPreferenceSnapshot() {
  return readCollapsedPreference(window.localStorage);
}

function getCollapsedPreferenceServerSnapshot() {
  return false;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const collapsedPreference = useSyncExternalStore(
    subscribeCollapsedPreference,
    getCollapsedPreferenceSnapshot,
    getCollapsedPreferenceServerSnapshot
  );
  const [sessionOverride, setSessionOverride] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const nextOverride = nextSessionOverrideOnNavigate({
      nextPathname: pathname,
      sessionOverride,
    });
    if (nextOverride !== sessionOverride) {
      setSessionOverride(nextOverride);
    }
  }

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "Admin") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user?.role === "Admin") {
        try {
          const response = await notificationService.getUnreadNotifications();
          if (response.success) {
            setNotificationCount(response.unread);
          }
        } catch (error) {
          console.error("Error fetching notification count:", error);
          setNotificationCount(0);
        }
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const displayName = user?.fullName || "Admin";
  const displayEmail = user?.email || "";

  const collapsed = getEffectiveCollapsed({
    pathname,
    preference: collapsedPreference,
    sessionOverride,
  });

  const handleToggleCollapse = () => {
    const nextCollapsed = !collapsed;
    writeCollapsedPreference(nextCollapsed, window.localStorage);
    window.dispatchEvent(new Event(COLLAPSED_CHANGE_EVENT));
    setSessionOverride(
      nextSessionOverrideAfterToggle({
        pathname,
        nextCollapsed,
      })
    );
  };

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
      <AdminSidebar
        pathname={pathname}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        notificationCount={notificationCount}
        displayName={displayName}
        displayEmail={displayEmail}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 transition-[margin] duration-300 ease-in-out ${
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        }`}
      >
        <AdminTopBar
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onMobileMenuOpen={() => setIsSidebarOpen(true)}
          notificationCount={notificationCount}
          displayName={displayName}
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
