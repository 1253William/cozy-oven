"use client";

import {
  BanIcon,
  Call02Icon,
  CheckmarkCircle02Icon,
  FilterIcon,
  Loading03Icon,
  Mail01Icon,
  MoreVerticalIcon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import customerService, {
  type Customer,
  type CustomerOverview,
} from "../../services/customerService";

export default function CustomersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      void fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, currentPage, statusFilter, appliedSearch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      void fetchOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const fetchCustomers = async () => {
    try {
      setListLoading(true);
      const response = await customerService.getAllCustomers({
        page: currentPage,
        limit: 10,
        search: appliedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (!response?.success || !Array.isArray(response.data)) {
        console.error("Unexpected customers response format:", response);
        setCustomers([]);
        setTotalPages(1);
        return;
      }

      setCustomers(response.data);
      setTotalPages(response.pagination?.pages ?? 1);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setListLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      setOverviewLoading(true);
      const response = await customerService.getCustomerOverview();
      if (response.success) {
        setOverview(response.data);
      }
    } catch (error) {
      console.error("Error fetching customer overview:", error);
    } finally {
      setOverviewLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchQuery.trim());
  };

  const handleStatusFilterChange = (value: "all" | "active" | "inactive") => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const handleViewDetails = async (customer: Customer) => {
    try {
      const params =
        customer.kind === "registered" && customer.registeredUserId
          ? { userId: customer.registeredUserId }
          : customer.email
            ? { email: customer.email }
            : customer.phoneNumber
              ? { phone: customer.phoneNumber }
              : null;

      if (!params) {
        alert("This customer has no email or phone to look up.");
        setSelectedCustomer(null);
        return;
      }

      const response = await customerService.getCustomerProfile(params);
      if (response.success) {
        const { customer: profile, orders } = response.data;
        const activityLabel = profile.isActive ? "Recent" : "Lapsed";
        const details = [
          "Customer Details",
          "",
          `Name: ${profile.fullName}`,
          `Email: ${profile.email || "—"}`,
          `Phone: ${profile.phoneNumber || "—"}`,
          `Type: ${response.data.kind === "registered" ? "Registered" : "Guest"}`,
          `Total Orders: ${orders.length}`,
          `Activity: ${activityLabel}`,
          `First order: ${new Date(profile.createdAt).toLocaleDateString()}`,
        ].join("\n");
        alert(details);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      alert("Failed to fetch customer details");
    }
    setSelectedCustomer(null);
  };

  const handleSendEmail = (customerEmail: string) => {
    router.push(
      `/admin/email-marketing?email=${encodeURIComponent(customerEmail)}`
    );
    setSelectedCustomer(null);
  };

  const handleDeactivate = async (customer: Customer) => {
    if (customer.kind !== "registered" || !customer.registeredUserId) {
      alert("Only registered customers can be deactivated.");
      setSelectedCustomer(null);
      return;
    }

    if (
      !confirm(
        `Deactivate ${customer.fullName || "this customer"}? They will no longer be able to log in.`
      )
    ) {
      setSelectedCustomer(null);
      return;
    }

    try {
      const response = await customerService.deactivateCustomer(
        customer.registeredUserId
      );
      if (response.success) {
        alert(response.message);
        void fetchCustomers();
        void fetchOverview();
      } else {
        alert(response.message || "Failed to deactivate customer");
      }
    } catch (error) {
      console.error("Error deactivating customer:", error);
      alert("Failed to deactivate customer");
    }
    setSelectedCustomer(null);
  };

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const activityBadge = (isRecent: boolean) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isRecent ? "bg-green-100 text-green-800" : "bg-[#b9aca2] text-[#222222]"
      }`}
      title={
        isRecent
          ? "Paid order in the last 90 days"
          : "No paid order in the last 90 days"
      }
    >
      {isRecent ? (
        <AdminIcon icon={CheckmarkCircle02Icon} size={12} className="mr-1" />
      ) : (
        <AdminIcon icon={BanIcon} size={12} className="mr-1" />
      )}
      {isRecent ? "Recent" : "Lapsed"}
    </span>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
            Customer Management
          </h1>
          <p className="text-sm sm:text-base text-[#5d6043] mt-1">
            Buyers from paid orders (registered accounts and walk-in guests)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-[#faf9f5] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#b9aca2]/40">
            <p className="text-xs sm:text-sm text-[#5d6043] font-medium">
              Total Customers
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#222222] mt-1">
              {overviewLoading ? "…" : overview?.totalCustomers || 0}
            </p>
          </div>
          <div className="bg-[#faf9f5] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#b9aca2]/40">
            <p className="text-xs sm:text-sm text-[#5d6043] font-medium">
              Recent Buyers
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
              {overviewLoading ? "…" : overview?.activeCustomers || 0}
            </p>
          </div>
          <div className="bg-[#faf9f5] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#b9aca2]/40">
            <p className="text-xs sm:text-sm text-[#5d6043] font-medium">
              New This Month
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
              {overviewLoading ? "…" : overview?.newThisMonth || 0}
            </p>
          </div>
          <div className="bg-[#faf9f5] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#b9aca2]/40">
            <p className="text-xs sm:text-sm text-[#5d6043] font-medium">
              Total Revenue
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#5d6043] mt-1 line-clamp-1">
              {overviewLoading
                ? "…"
                : `GHS ${overview?.totalRevenue?.toFixed(2) || "0.00"}`}
            </p>
          </div>
        </div>

        <div className="bg-[#faf9f5] rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-[#b9aca2]/40">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full relative">
              <AdminIcon
                icon={Search01Icon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 sm:w-5 sm:h-5 text-[#b9aca2]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <AdminIcon
                icon={FilterIcon}
                size={16}
                className="sm:w-5 sm:h-5 text-[#b9aca2]"
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              >
                <option value="all">All activity</option>
                <option value="active">Recent (90 days)</option>
                <option value="inactive">Lapsed</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="md:hidden space-y-3">
            {listLoading ? (
              <div className="text-center py-8">
                <AdminIcon
                  icon={Loading03Icon}
                  size={32}
                  className="text-[#5d6043] animate-spin mx-auto"
                />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#5d6043] text-sm">No customers found</p>
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.rowKey}
                  className="bg-[#faf9f5] rounded-lg shadow-sm p-4 border border-[#b9aca2]/40"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-[#5d6043] rounded-full flex items-center justify-center text-[#faf9f5] font-semibold shrink-0">
                        {customer.fullName?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#222222] text-sm truncate">
                          {customer.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-[#5d6043] truncate">
                          {customer.email || "No email"}
                          {customer.kind === "guest" ? " · Guest" : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedCustomer(
                          selectedCustomer === customer.rowKey
                            ? null
                            : customer.rowKey
                        )
                      }
                      className="p-1.5 hover:bg-[#b9aca2] rounded-lg shrink-0"
                    >
                      <AdminIcon
                        icon={MoreVerticalIcon}
                        size={16}
                        className="text-[#b9aca2]"
                      />
                    </button>
                  </div>

                  <div className="mb-3">{activityBadge(customer.isRecent)}</div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-[#5d6043]">Phone</p>
                      <p className="font-medium text-[#222222]">
                        {customer.phoneNumber || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#5d6043]">Orders</p>
                      <p className="font-medium text-[#222222]">
                        {customer.totalOrders}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#5d6043]">Spent</p>
                      <p className="font-semibold text-[#5d6043]">
                        GHS {customer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#5d6043]">First order</p>
                      <p className="font-medium text-[#222222]">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedCustomer === customer.rowKey && (
                    <div className="border-t border-[#b9aca2]/40 pt-3 space-y-2">
                      <button
                        onClick={() => void handleViewDetails(customer)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5d6043] hover:bg-[#faf9f5] rounded-lg"
                      >
                        <AdminIcon icon={ViewIcon} size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          if (customer.email) handleSendEmail(customer.email);
                        }}
                        disabled={!customer.email}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5d6043] hover:bg-[#faf9f5] rounded-lg disabled:opacity-40"
                      >
                        <AdminIcon icon={Mail01Icon} size={16} />
                        Send Email
                      </button>
                      {customer.kind === "registered" && (
                        <button
                          onClick={() => void handleDeactivate(customer)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <AdminIcon icon={BanIcon} size={16} />
                          Deactivate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#faf9f5] border-b border-[#b9aca2]/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      First order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#faf9f5] divide-y divide-[#b9aca2]/60">
                  {listLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <AdminIcon
                          icon={Loading03Icon}
                          size={32}
                          className="text-[#5d6043] animate-spin mx-auto"
                        />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-[#5d6043]"
                      >
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.rowKey} className="hover:bg-[#faf9f5]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#5d6043] rounded-full flex items-center justify-center text-[#faf9f5] font-semibold">
                              {customer.fullName?.charAt(0) || "?"}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-semibold text-[#222222]">
                                {customer.fullName || "N/A"}
                              </p>
                              {customer.kind === "guest" && (
                                <p className="text-xs text-[#5d6043]">Guest</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#222222]">
                            <div className="flex items-center gap-2 mb-1">
                              <AdminIcon
                                icon={Mail01Icon}
                                size={16}
                                className="text-[#b9aca2]"
                              />
                              <span>{customer.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AdminIcon
                                icon={Call02Icon}
                                size={16}
                                className="text-[#b9aca2]"
                              />
                              <span>{customer.phoneNumber || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#222222]">
                            {customer.totalOrders}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-[#5d6043]">
                            GHS {customer.totalSpent.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activityBadge(customer.isRecent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6043]">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setSelectedCustomer(
                                  selectedCustomer === customer.rowKey
                                    ? null
                                    : customer.rowKey
                                )
                              }
                              className="p-1 rounded-lg hover:bg-[#b9aca2]"
                            >
                              <AdminIcon
                                icon={MoreVerticalIcon}
                                size={20}
                                className="text-[#b9aca2]"
                              />
                            </button>

                            {selectedCustomer === customer.rowKey && (
                              <div className="absolute right-0 mt-2 w-48 bg-[#faf9f5] rounded-lg shadow-lg border border-[#b9aca2]/60 z-10">
                                <button
                                  onClick={() => void handleViewDetails(customer)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#5d6043] hover:bg-[#faf9f5] rounded-t-lg"
                                >
                                  <AdminIcon icon={ViewIcon} size={16} />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    if (customer.email)
                                      handleSendEmail(customer.email);
                                  }}
                                  disabled={!customer.email}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#5d6043] hover:bg-[#faf9f5] disabled:opacity-40"
                                >
                                  <AdminIcon icon={Mail01Icon} size={16} />
                                  Send Email
                                </button>
                                {customer.kind === "registered" && (
                                  <button
                                    onClick={() => void handleDeactivate(customer)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                  >
                                    <AdminIcon icon={BanIcon} size={16} />
                                    Deactivate
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!listLoading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[#5d6043]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
