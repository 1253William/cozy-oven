"use client";

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { orderService, type Order } from "@/app/services/orderService";

const getStepsForStatus = (status: string) => {
  const fulfillmentStep =
    status === "awaiting-pickup"
      ? { key: "awaiting-pickup", label: "Awaiting Pickup" }
      : { key: "on-delivery", label: "Out for Delivery" };

  return [
    { key: "pending", label: "Order Placed" },
    { key: "preparing", label: "Preparing" },
    fulfillmentStep,
    { key: "delivered", label: "Delivered" },
  ];
};

const getStatusIndex = (status: string) => {
  if (status === "cancelled") return -1;
  if (status === "pending") return 0;
  if (status === "preparing") return 1;
  if (status === "awaiting-pickup" || status === "on-delivery") return 2;
  if (status === "delivered") return 3;
  return 0;
};

const formatStatusLabel = (status?: string) =>
  String(status ?? "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
    <div className="text-[#222222]">
      <div className="mb-10 text-center">
        <h1 className="font-editorial text-5xl leading-tight">Track Your Order</h1>
        <p className="mx-auto mt-4 max-w-xl text-[#5d6043]">
          Track and manage your orders.
        </p>
      </div>

      {loading ? (
        <div className="editorial-card flex flex-col items-center justify-center py-16">
          <Package className="mb-4 h-14 w-14 animate-pulse text-[#bd6325]" />
          <p className="text-[#5d6043]">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="editorial-card flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 h-14 w-14 text-red-400" />
          <h2 className="font-editorial text-3xl">Failed to load orders</h2>
          <p className="mb-6 mt-3 max-w-md text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="editorial-button px-7 py-3"
          >
            Try Again
          </button>
        </div>
      ) : !hasOrders ? (
        <div className="editorial-card flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="mb-4 h-14 w-14 text-[#bd6325]" />
          <h2 className="font-editorial text-3xl">No orders yet</h2>
          <p className="mb-6 mt-3 max-w-md text-[#5d6043]">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link href="/shop" className="editorial-button px-7 py-3">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const steps = getStepsForStatus(order.status || "");
            const activeIndex = getStatusIndex(order.status || "");
            const isCancelled = order.status === "cancelled";

            return (
              <article key={order.orderId} className="editorial-card p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-5 border-b border-[#b9aca2] pb-6 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-medium text-[#bd6325]">
                      Order #{order.orderId}
                    </p>
                    <h3 className="font-editorial mt-2 text-3xl">{order.title || "Order Items"}</h3>
                    <p className="mt-2 text-sm text-[#5d6043]">{order.createdAt || order.date || order.paidAt}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-[#5d6043]">Total</p>
                    <p className="text-2xl font-bold text-[#bd6325]">
                      GHS {((order.price || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  {isCancelled ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                      This order was cancelled.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-4">
                      {steps.map((step, index) => {
                        const complete = index <= activeIndex;
                        return (
                          <div key={step.key} className="relative">
                            <div className={`h-1 rounded-full ${complete ? "bg-[#bd6325]" : "bg-[#b9aca2]"}`} />
                            <div className="mt-3 flex items-center gap-3">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                                  complete
                                    ? "border-[#bd6325] bg-[#bd6325] text-[#faf9f5]"
                                    : "border-[#b9aca2] bg-[#faf9f5] text-[#5d6043]"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <span className="text-sm font-semibold text-[#5d6043]">{step.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-8 grid gap-4 rounded-2xl border border-[#b9aca2] bg-[#faf9f5] p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Item</p>
                    <p className="mt-1 font-semibold">{order.title || "Order Items"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Status</p>
                    <p className="mt-1 font-semibold">{formatStatusLabel(order.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Delivery</p>
                    <p className="mt-1 font-semibold">{order.deliveryAddress || "Scheduled with Cozy Oven"}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
