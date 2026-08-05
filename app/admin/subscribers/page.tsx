"use client";

import {
  Download01Icon,
  Loading03Icon,
  Mail01Icon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import subscriberService, { type Subscriber } from "../../services/subscriberService";

export default function SubscribersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchSubscribers();
    }
     
  }, [isAuthenticated, user]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriberService.getAllSubscribers();

      if (!response?.success) {
        setSubscribers([]);
        setError(response?.message || "Failed to fetch subscribers");
        return;
      }

      if (!Array.isArray(response.data)) {
        console.error("Unexpected subscribers response format:", response);
        setSubscribers([]);
        setError("Unexpected subscribers data format from server.");
        return;
      }

      setSubscribers(response.data);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setSubscribers([]);
      setError("Failed to fetch subscribers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled client-side
  };

  const handleExportCSV = () => {
    const filtered = getFilteredSubscribers();
    const csvContent = [
      ["First Name", "Email", "Subscribed Date"],
      ...filtered.map((sub) => [
        sub.fullName,
        sub.email,
        new Date(sub.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cozy-oven-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredSubscribers = () => {
    if (!searchQuery.trim()) return subscribers;
    const query = searchQuery.toLowerCase();
    return subscribers.filter(
      (sub) =>
        sub.fullName.toLowerCase().includes(query) ||
        sub.email.toLowerCase().includes(query)
    );
  };

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const filteredSubscribers = getFilteredSubscribers();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast Notifications */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
              Email Subscribers
            </h1>
            <p className="text-sm sm:text-base text-[#5d6043] mt-1">
              Manage your VIP email list subscribers
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#bd6325] text-[#faf9f5] rounded-lg hover:bg-[#bd6325] transition-colors"
              disabled={loading || filteredSubscribers.length === 0}
            >
              <AdminIcon icon={Download01Icon} size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-[#faf9f5] rounded-xl shadow-sm p-6 border border-[#b9aca2]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#bd6325]/10 rounded-full flex items-center justify-center">
              <AdminIcon icon={Mail01Icon} size={24} className="text-[#bd6325]" />
            </div>
            <div>
              <p className="text-sm text-[#5d6043] font-medium">Total Subscribers</p>
              <p className="text-3xl font-bold text-[#222222]">
                {loading ? "..." : subscribers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <AdminIcon icon={Search01Icon} size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#bd6325] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <AdminIcon icon={Loading03Icon} size={32} className="text-[#bd6325] animate-spin" />
          </div>
        )}

        {/* Subscribers List - Card view on mobile, table on larger screens */}
        {!loading && (
          <div className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 overflow-hidden">
            {filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <AdminIcon icon={Mail01Icon} size={48} className="text-[#b9aca2] mx-auto mb-4" />
                <p className="text-[#5d6043]">
                  {searchQuery
                    ? "No subscribers found matching your search."
                    : "No subscribers yet."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredSubscribers.map((subscriber) => (
                    <div
                      key={subscriber._id}
                      className="bg-[#faf9f5] rounded-lg shadow-sm border border-[#b9aca2]/40 p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#bd6325]/10 rounded-full flex items-center justify-center">
                          <AdminIcon icon={UserAdd01Icon} size={20} className="text-[#bd6325]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#222222] truncate">
                            {subscriber.fullName}
                          </p>
                          <button
                            onClick={() =>
                              router.push(`/admin/email-marketing?email=${encodeURIComponent(subscriber.email)}&name=${encodeURIComponent(subscriber.fullName)}`)
                            }
                            className="mt-1 text-xs text-[#bd6325] hover:text-[#bd6325] flex items-center gap-1"
                          >
                            <AdminIcon icon={Mail01Icon} size={12} />
                            <span className="truncate">{subscriber.email}</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-[#5d6043]">
                        <p className="font-medium">
                          Subscribed on{" "}
                          {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#faf9f5] border-b border-[#b9aca2]/60">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                          Subscribed Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#faf9f5] divide-y divide-[#b9aca2]/60">
                      {filteredSubscribers.map((subscriber) => (
                        <tr
                          key={subscriber._id}
                          className="hover:bg-[#faf9f5] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#bd6325]/10 rounded-full flex items-center justify-center">
                                <AdminIcon icon={UserAdd01Icon} size={20} className="text-[#bd6325]" />
                              </div>
                              <span className="text-sm font-medium text-[#222222]">
                                {subscriber.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`/admin/email-marketing?email=${encodeURIComponent(subscriber.email)}&name=${encodeURIComponent(subscriber.fullName)}`}
                              className="text-sm text-[#bd6325] hover:underline flex items-center gap-2"
                            >
                              <AdminIcon icon={Mail01Icon} size={16} />
                              {subscriber.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6043]">
                            {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                router.push(`/admin/email-marketing?email=${encodeURIComponent(subscriber.email)}&name=${encodeURIComponent(subscriber.fullName)}`)
                              }
                              className="text-sm text-[#bd6325] hover:text-[#bd6325] font-medium"
                            >
                              Send Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

