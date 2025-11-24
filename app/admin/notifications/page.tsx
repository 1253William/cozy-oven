"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";

// Mock notification data - replace with actual API calls
const mockNotifications = [
  {
    id: 1,
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-156 has been placed by John Doe",
    timestamp: "2024-11-24T10:30:00",
    read: false,
    icon: ShoppingCart,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    type: "inventory",
    title: "Low Stock Alert",
    message: "Chocolate Chip Delight is running low on stock (5 remaining)",
    timestamp: "2024-11-24T09:15:00",
    read: false,
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 3,
    type: "order",
    title: "Order Delivered",
    message: "Order #ORD-142 has been successfully delivered",
    timestamp: "2024-11-24T08:00:00",
    read: true,
    icon: Package,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    type: "sales",
    title: "Sales Milestone",
    message: "Congratulations! You've reached GHS 50,000 in monthly sales",
    timestamp: "2024-11-23T16:45:00",
    read: true,
    icon: TrendingUp,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 5,
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-155 has been placed by Sarah Williams",
    timestamp: "2024-11-23T14:20:00",
    read: true,
    icon: ShoppingCart,
    color: "bg-blue-100 text-blue-600",
  },
];

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notif) => !notif.read)
      : notifications;

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your business activities
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors"
            >
              <CheckCheck className="w-5 h-5" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#2A2C22] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-[#2A2C22] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-3">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-[#2A2C22] font-medium hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications
              </h2>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
