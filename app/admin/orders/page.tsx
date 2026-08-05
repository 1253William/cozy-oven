"use client";

import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  Delete02Icon,
  DeliveryTruck01Icon,
  Download01Icon,
  Edit02Icon,
  FilterIcon,
  Package01Icon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import AdminPageHeader from "../components/AdminPageHeader";
import { useAuth } from "../../context/AuthContext";
import { orderService, type Order } from "../../services/orderService";
import ViewOrderModal from "./components/ViewOrderModal";
import AddOrderModal from "./components/AddOrderModal";
import AddInvoiceModal from "./components/AddInvoiceModal";

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "on-delivery", label: "On Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusColor = (status?: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "preparing":
      return "bg-blue-100 text-blue-700";
    case "on-delivery":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-[#b9aca2] text-[#5d6043]";
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "pending":
      return <AdminIcon icon={Clock01Icon} size={16} />;
    case "preparing":
      return <AdminIcon icon={Package01Icon} size={16} />;
    case "on-delivery":
      return <AdminIcon icon={DeliveryTruck01Icon} size={16} />;
    case "delivered":
      return <AdminIcon icon={CheckmarkCircle02Icon} size={16} />;
    case "cancelled":
      return <AdminIcon icon={CancelCircleIcon} size={16} />;
    default:
      return null;
  }
};

const formatOrderDate = (order: Order) => {
  const dateValue = order.transactionDateIso || order.createdAt;
  if (!dateValue) return order.date || "-";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return order.date || "-";

  return parsedDate.toLocaleDateString();
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [discountCodeFilter, setDiscountCodeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivered: 0,
    awaitingPayment: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, currentPage, appliedSearch, statusFilter, paymentMethodFilter, discountCodeFilter]);

  const fetchOrders = async () => {
  try {
    setLoading(true);

    const response = await orderService.getAllOrders({
      page: currentPage,
      limit: 10,
      search: appliedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
      discountCode: discountCodeFilter.trim() || undefined,
    });

    if (!response?.success || !response.data) {
      setOrders([]);
      setTotalPages(1);
      return;
    }

    const data = response.data;

    // Orders
    const ordersArray: Order[] = data.orders ?? [];
    setOrders(ordersArray);

    // Pagination
    if (data.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
    } else {
      setTotalPages(1);
    }

    // Statistics
    if (data.statistics) {
      setStatistics({
        total: data.statistics.totalOrders ?? 0,
        pending: data.statistics.pending ?? 0,
        preparing: data.statistics.preparing ?? 0,
        delivered: data.statistics.delivered ?? 0,
        awaitingPayment: data.statistics.awaitingPayment ?? 0,
      });
    } else {
      // fallback: compute from orders
      setStatistics({
        total: ordersArray.length,
        pending: ordersArray.filter((o) => o.status === "pending").length,
        preparing: ordersArray.filter((o) => o.status === "preparing").length,
        delivered: ordersArray.filter((o) => o.status === "delivered").length,
        awaitingPayment: ordersArray.filter((o) => o.paymentStatus === "pending").length,
      });
    }

  } catch (error) {
    console.error("Error fetching orders:", error);
    setOrders([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const allowedStatuses = ["pending", "preparing", "on-delivery", "delivered", "cancelled"] as const;
    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      alert("Invalid status selected. Please choose a valid status.");
      return;
    }

    try {
      const response = await orderService.updateOrderStatus(orderId, status);

      if (response?.success) {
        await fetchOrders();
        setEditingOrderId(null);
        setNewStatus("");
      } else {
        alert(response?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await orderService.deleteOrder(orderId);
      if (response?.success) {
        await fetchOrders();
      } else {
        alert(response?.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      await orderService.downloadInvoicePdf(orderId);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  const handleMarkInvoicePaid = async (orderId: string) => {
    const transactionRef = prompt("Payment reference (optional)") || undefined;
    if (!confirm("Mark this invoice as paid and add it to order totals?")) {
      return;
    }

    try {
      const response = await orderService.markInvoicePaid(orderId, transactionRef);
      if (response?.success) {
        await fetchOrders();
      } else {
        alert(response?.message || "Failed to mark invoice as paid");
      }
    } catch (error) {
      console.error("Error marking invoice paid:", error);
      alert("Failed to mark invoice as paid");
    }
  };

  const filteredOrders = orders;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Orders"
          description="Manage all customer orders"
          actions={
            <>
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors"
              >
                <AdminIcon icon={Package01Icon} size={20} />
                Add Order
              </button>
              <button
                onClick={() => setShowAddInvoiceModal(true)}
                className="flex items-center gap-2 rounded-lg border border-[#5d6043] px-4 py-2 text-[#5d6043] transition-colors hover:bg-[#5d6043] hover:text-[#faf9f5]"
              >
                <AdminIcon icon={Package01Icon} size={20} />
                Create Invoice
              </button>
            </>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
            <p className="text-sm text-[#5d6043] font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-[#222222] mt-1">{statistics.total}</p>
          </div>
          <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
            <p className="text-sm text-[#5d6043] font-medium">Awaiting Payment</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{statistics.awaitingPayment}</p>
          </div>
          <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
            <p className="text-sm text-[#5d6043] font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{statistics.pending}</p>
          </div>
          <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
            <p className="text-sm text-[#5d6043] font-medium">Preparing</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{statistics.preparing}</p>
          </div>
          <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
            <p className="text-sm text-[#5d6043] font-medium">Delivered</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{statistics.delivered}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <AdminIcon icon={Search01Icon} size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    setAppliedSearch(searchQuery.trim());
                  }
                }}
                placeholder="Search by order ID, customer name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <AdminIcon icon={FilterIcon} size={20} className="text-[#b9aca2]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2">
              <select
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              >
                <option value="all">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="paystack">Paystack</option>
                <option value="mobile-money">Mobile Money</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="relative min-w-[190px]">
              <AdminIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]" />
              <input
                type="text"
                value={discountCodeFilter}
                onChange={(event) => {
                  setDiscountCodeFilter(event.target.value.toUpperCase());
                  setCurrentPage(1);
                }}
                placeholder="Filter by code"
                maxLength={32}
                className="w-full rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 uppercase focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
              />
            </div>
          </div>
        </div>

        {/* Orders Table/Cards */}
        <div className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#faf9f5] border-b border-[#b9aca2]/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6043] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#faf9f5] divide-y divide-[#b9aca2]/60">
                {loading ? (
                  <tr >
                    <td colSpan={8} className="px-6 py-8 text-center text-[#5d6043]">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#5d6043]">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <tr key={order.orderId || order._id || idx} className="hover:bg-[#faf9f5]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-[#222222]">{order.orderId}</span>
                        {order.promotion?.code && (
                          <span className="mt-1 block text-xs font-semibold text-green-700">
                            {order.promotion.code}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-[#222222]">{order.customer || 'N/A'}</p>
                          <p className="text-xs text-[#5d6043]">{order.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#5d6043]">{order.items || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#222222]">{order.amount || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {order.source === "invoice" && order.paymentStatus !== "paid"
                              ? "invoice unpaid"
                              : order.paymentStatus === "pending"
                                ? "awaiting payment"
                                : order.paymentStatus || 'N/A'}
                          </span>
                          {order.invoice?.invoiceId && (
                            <p className="text-xs text-[#5d6043] mt-1">{order.invoice.invoiceId}</p>
                          )}
                          {order.paidAt && (
                            <p className="text-xs text-[#5d6043] mt-1">{order.paidAt}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingOrderId === order.orderId ? (
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="text-xs border border-[#b9aca2] rounded px-2 py-1 focus:ring-2 focus:ring-[#5d6043]"
                          >
                            <option value="">Select status</option>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="on-delivery">On Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {String(order.status ?? "").charAt(0).toUpperCase() +
                              String(order.status ?? "").slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#5d6043]">
                          {formatOrderDate(order)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingOrderId === order.orderId ? (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(order.orderId, newStatus)}
                                disabled={!newStatus}
                                className="px-2 py-1 text-xs text-[#faf9f5] bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingOrderId(null);
                                  setNewStatus("");
                                }}
                                className="px-2 py-1 text-xs text-[#5d6043] border border-[#b9aca2] hover:bg-[#b9aca2] rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setViewingOrderId(order.orderId)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View Order"
                              >
                                <AdminIcon icon={ViewIcon} size={16} />
                              </button>
                              {order.source === "invoice" && (
                                <button
                                  onClick={() => handleDownloadInvoice(order.orderId)}
                                  className="p-1 text-[#5d6043] hover:bg-[#b9aca2] rounded transition-colors"
                                  title="Download Invoice"
                                >
                                  <AdminIcon icon={Download01Icon} size={16} />
                                </button>
                              )}
                              {order.source === "invoice" && order.paymentStatus !== "paid" && (
                                <button
                                  onClick={() => handleMarkInvoicePaid(order.orderId)}
                                  className="p-1 text-green-700 hover:bg-green-50 rounded transition-colors"
                                  title="Mark Invoice Paid"
                                >
                                  <AdminIcon icon={CreditCardIcon} size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingOrderId(order.orderId);
                                  setNewStatus(order.status ?? "");
                                }}
                                className="p-1 text-[#5d6043] hover:bg-[#b9aca2] rounded transition-colors"
                                title="Edit Status"
                              >
                                <AdminIcon icon={Edit02Icon} size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.orderId)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Order"
                              >
                                <AdminIcon icon={Delete02Icon} size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden p-4">
            {loading ? (
              <div className="text-center py-8 text-[#5d6043]">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-[#5d6043]">No orders found</div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.orderId} className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#222222]">{order.orderId}</h3>
                        {order.promotion?.code && (
                          <p className="text-xs font-semibold text-green-700">
                            Promotion: {order.promotion.code}
                          </p>
                        )}
                        <p className="text-sm text-[#5d6043]">{order.contactNumber}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {String(order.status ?? "").charAt(0).toUpperCase() +
                          String(order.status ?? "").slice(1)}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-[#5d6043] mb-1">Date</p>
                       <p className="text-sm font-medium text-[#222222]">
                        {formatOrderDate(order)}
                      </p>

                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-3">
                      <p className="text-xs text-[#5d6043] mb-1">Delivery Address</p>
                      <p className="text-sm text-[#5d6043]">{order.deliveryAddress}</p>
                    </div>

                    {order.source === "invoice" && (
                      <div className="mb-3 rounded-lg border border-[#b9aca2]/60 p-3">
                        <p className="text-xs text-[#5d6043] mb-1">Invoice</p>
                        <p className="text-sm text-[#222222]">{order.invoice?.invoiceId || order.orderId}</p>
                        <p className="text-sm text-[#5d6043]">Status: {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {editingOrderId === order.orderId ? (
                      <div className="flex flex-col gap-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full text-sm border border-[#b9aca2] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#5d6043]"
                        >
                          <option value="">Select status</option>
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="on-delivery">On Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, newStatus)}
                            disabled={!newStatus}
                            className="flex-1 px-3 py-2 text-sm text-[#faf9f5] bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrderId(null);
                              setNewStatus("");
                            }}
                            className="flex-1 px-3 py-2 text-sm text-[#5d6043] border border-[#b9aca2] hover:bg-[#b9aca2] rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingOrderId(order.orderId)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                        >
                          <AdminIcon icon={ViewIcon} size={16} />
                          View Details
                        </button>
                        {order.source === "invoice" && (
                          <button
                            onClick={() => handleDownloadInvoice(order.orderId)}
                            className="px-3 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                          >
                            <AdminIcon icon={Download01Icon} size={16} />
                          </button>
                        )}
                        {order.source === "invoice" && order.paymentStatus !== "paid" && (
                          <button
                            onClick={() => handleMarkInvoicePaid(order.orderId)}
                            className="px-3 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <AdminIcon icon={CreditCardIcon} size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingOrderId(order.orderId);
                            setNewStatus(order.status ?? "");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                        >
                          <AdminIcon icon={Edit02Icon} size={16} />
                          Edit Status
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.orderId)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <AdminIcon icon={Delete02Icon} size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {!loading && filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <AdminIcon icon={Package01Icon} size={64} className="text-[#b9aca2] mx-auto mb-4" />
              <p className="text-[#5d6043]">No orders found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewingOrderId && (
        <ViewOrderModal
          orderId={viewingOrderId}
          onClose={() => setViewingOrderId(null)}
        />
      )}
      
      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
        onSuccess={() => {
          fetchOrders();
          setShowAddOrderModal(false);
        }}
      />

      <AddInvoiceModal
        isOpen={showAddInvoiceModal}
        onClose={() => setShowAddInvoiceModal(false)}
        onSuccess={() => {
          fetchOrders();
          setShowAddInvoiceModal(false);
        }}
      />
    </AdminLayout>
  );
}
