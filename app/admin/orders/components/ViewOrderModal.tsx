"use client";

import { useState, useEffect } from "react";
import { X, Package, User, CreditCard, Loader2 } from "lucide-react";
import { orderService } from "../../../services/orderService";
import Image from "next/image";

interface OrderItem {
  productId: string;
  name: string;
  thumbnail: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface OrderDetails {
  orderId: string;
  customer: {
    name: string;
    email: string;
    contactNumber: string;
    deliveryAddress: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
  };
  payment: {
    status: string;
    method: string;
    transactionRef?: string;
    paidAt?: string;
  };
  orderStatus: string;
  createdAt: string;
}

interface ViewOrderModalProps {
  orderId: string | null;
  onClose: () => void;
}

export default function ViewOrderModal({ orderId, onClose }: ViewOrderModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(orderId);
      
      if (response.success && response.data) {
        setOrderDetails(response.data as OrderDetails);
      } else {
        setError("Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && orderDetails && (
              <div className="space-y-6">
                {/* Order ID and Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Order ID</h4>
                    <p className="text-lg font-bold text-gray-900">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderDetails.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : orderDetails.orderStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : orderDetails.orderStatus === 'preparing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {orderDetails.orderStatus.charAt(0).toUpperCase() + orderDetails.orderStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Customer Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetails.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetails.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetails.customer.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Delivery Address</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetails.customer.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Order Items</h4>
                  </div>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                          <p className="text-xs text-gray-600">
                            GHS {item.unitPrice.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            GHS {item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Pricing Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-[#2A2C22]">
                        GHS {orderDetails.pricing.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Payment Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Payment Status</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                        orderDetails.payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {orderDetails.payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {orderDetails.payment.method}
                      </p>
                    </div>
                    {orderDetails.payment.transactionRef && (
                      <div>
                        <p className="text-xs text-gray-600">Transaction Reference</p>
                        <p className="text-sm font-medium text-gray-900">
                          {orderDetails.payment.transactionRef}
                        </p>
                      </div>
                    )}
                    {orderDetails.payment.paidAt && (
                      <div>
                        <p className="text-xs text-gray-600">Paid At</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(orderDetails.payment.paidAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <p className="text-xs text-gray-600">Order Placed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(orderDetails.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
