"use client";

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { orderService, type Order } from "@/app/services/orderService";

// Order status types
type OrderStatus = "pending" | "preparing" | "on-delivery" | "delivered" | "cancelled";

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Order Processed", color: "bg-blue-500", progress: 25 };
    case "preparing":
      return { label: "Being Prepared", color: "bg-orange-500", progress: 50 };
    case "on-delivery":
      return { label: "On The Way", color: "bg-purple-500", progress: 75 };
    case "delivered":
      return { label: "Delivered", color: "bg-green-500", progress: 100 };
    case "cancelled":
      return { label: "Cancelled", color: "bg-red-500", progress: 0 };
    default:
      return { label: "Unknown", color: "bg-gray-300", progress: 0 };
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrderHistory();
        if (response.success && response.data) {
          setOrders(response.data);
        } else {
          setError(response.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const hasOrders = orders.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage your orders</p>
      </div>

      {loading ? (
        // Loading state
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <Package className="w-16 h-16 text-gray-400 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      ) : error ? (
        // Error state
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-red-100 rounded-full p-6 mb-4">
            <Package className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Failed to load orders
          </h2>
          <p className="text-red-600 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-full hover:bg-[#1a1c12] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : !hasOrders ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-full hover:bg-[#1a1c12] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        // Orders list
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.orderStatus);
            return (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-[#2A2C22]">
                      GHS {((order.total || order.totalAmount || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center justify-between py-2 border-t border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name || "Product"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        GHS {(item.total || (item.unitPrice * item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {statusInfo.label}
                    </span>
                    <span className="text-sm text-gray-600">
                      {statusInfo.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${statusInfo.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${statusInfo.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Delivery Information */}
                {order.deliveryAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Delivery Address:</span>{" "}
                      {order.deliveryAddress}
                    </p>
                    {order.contactNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Contact:</span>{" "}
                        {order.contactNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
