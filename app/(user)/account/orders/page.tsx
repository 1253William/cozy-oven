"use client";

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Order status types
type OrderStatus = "processed" | "baking" | "delivery" | "on-the-way" | "delivered";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

// Mock data - replace with API call
const mockOrders: Order[] = [
  // {
  //   id: "1",
  //   orderNumber: "ORD-2024-001",
  //   date: "2024-01-15",
  //   status: "on-the-way",
  //   items: [
  //     {
  //       id: "1",
  //       name: "Classic Banana Bread",
  //       size: "Medium",
  //       quantity: 2,
  //       price: 45.00,
  //     },
  //   ],
  //   total: 90.00,
  // },
];

const getStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case "processed":
      return { label: "Order Processed", color: "bg-blue-500", progress: 25 };
    case "baking":
      return { label: "Being Baked", color: "bg-orange-500", progress: 50 };
    case "delivery":
      return { label: "Given to Delivery Rider", color: "bg-purple-500", progress: 75 };
    case "on-the-way":
      return { label: "On The Way", color: "bg-green-500", progress: 90 };
    case "delivered":
      return { label: "Delivered", color: "bg-gray-500", progress: 100 };
    default:
      return { label: "Unknown", color: "bg-gray-300", progress: 0 };
  }
};

export default function OrdersPage() {
  const hasOrders = mockOrders.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage your orders</p>
      </div>

      {!hasOrders ? (
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
          {mockOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-[#2A2C22]">
                      GHS {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-t border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.size} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        GHS {(item.price * item.quantity).toFixed(2)}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
