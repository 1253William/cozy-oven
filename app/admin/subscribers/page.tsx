"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { Search, Mail, Loader2, Download, UserPlus } from "lucide-react";
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
      if (response.success) {
        setSubscribers(response.data || []);
      } else {
        setError(response.message || "Failed to fetch subscribers");
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
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
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Email Subscribers
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your VIP email list subscribers
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#bd6325] text-white rounded-lg hover:bg-[#a8551f] transition-colors"
              disabled={loading || filteredSubscribers.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#bd6325]/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#bd6325]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : subscribers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd6325] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#bd6325] animate-spin" />
          </div>
        )}

        {/* Subscribers Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery
                    ? "No subscribers found matching your search."
                    : "No subscribers yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subscribed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscribers.map((subscriber) => (
                      <tr
                        key={subscriber._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#bd6325]/10 rounded-full flex items-center justify-center">
                              <UserPlus className="w-5 h-5 text-[#bd6325]" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {subscriber.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`mailto:${subscriber.email}`}
                            className="text-sm text-[#bd6325] hover:underline flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            {subscriber.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              (window.location.href = `mailto:${subscriber.email}?subject=Cozy Oven VIP Newsletter`)}
                            className="text-sm text-[#bd6325] hover:text-[#a8551f] font-medium"
                          >
                            Send Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

