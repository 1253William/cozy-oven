"use client";

import { useState, useEffect } from "react";
import { X, Package, User, CreditCard, Loader2 } from "lucide-react";
import { orderService } from "../../../services/orderService";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  productId: string;
  name: string;
  thumbnail: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface PickUpDetails {
  pickupDate?: string;
  specialInstructions?: string;
}

interface OrderDetailsData {
  orderItems?: string[];
  pickUpDetails?: PickUpDetails;
}

interface OrderDetails {
  orderId: string;
  customer: {
    name: string;
    email: string;
    contactNumber: string;
    deliveryAddress: string;
    city?: string;
  };
  items: OrderItem[];
  orderDetails?: OrderDetailsData;
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600 mt-2">View complete order information</p>
            </div>
            {/* Error and Loading States */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && orderDetails && (
              <div className="space-y-6">
                {/* Order ID and Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                <div className="p-4 bg-gray-50 rounded-lg">
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
                    {orderDetails.customer.city && (
                      <div>
                        <p className="text-xs text-gray-600">City</p>
                        <p className="text-sm font-medium text-gray-900">{orderDetails.customer.city}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Order Items</h4>
                  </div>
                  
                  {/* Display order items from orderDetails.orderItems if available */}
                  {orderDetails.orderDetails?.orderItems && orderDetails.orderDetails.orderItems.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {orderDetails.orderDetails.orderItems.map((item, index) => (
                        <div key={`order-item-${index}-${item.substring(0, 20)}`} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  
                  {/* Display detailed items with images and prices */}
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
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

                {/* Pickup Details */}
                {orderDetails.orderDetails?.pickUpDetails && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Pickup Details</h4>
                    <div className="space-y-2">
                      {orderDetails.orderDetails.pickUpDetails.pickupDate && (
                        <div>
                          <p className="text-xs text-gray-600">Pickup Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {orderDetails.orderDetails.pickUpDetails.pickupDate}
                          </p>
                        </div>
                      )}
                      {orderDetails.orderDetails.pickUpDetails.specialInstructions && (
                        <div>
                          <p className="text-xs text-gray-600">Special Instructions</p>
                          <p className="text-sm font-medium text-gray-900">
                            {orderDetails.orderDetails.pickUpDetails.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="p-4 bg-gray-50 rounded-lg">
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
                <div className="p-4 bg-gray-50 rounded-lg">
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

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#2A2C22] text-white rounded-full font-semibold hover:bg-[#1a1c12] transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
