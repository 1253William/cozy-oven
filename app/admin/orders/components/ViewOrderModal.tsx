"use client";

import {
  Cancel01Icon,
  CreditCardIcon,
  Loading03Icon,
  Package01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

import { useState, useEffect } from "react";
import { orderService } from "../../../services/orderService";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PaymentBreakdown } from "../../../utils/paymentBreakdown";
import { formatPaymentMethod } from "../../../utils/paymentMethod";

interface OrderItem {
  productId: string;
  name: string;
  thumbnail: string;
  unitPrice: number;
  quantity: number;
  total: number;
  size?: string; // Add size variation field
  packageSelections?: {
    label: string;
    quantity: number;
    groupLabel?: string;
    groupId?: string;
    type?: "fixed" | "selection";
  }[];
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
    specialInstructions?: string;
  };
  items: OrderItem[];
  orderDetails?: OrderDetailsData;
  pricing: {
    subtotal: number;
    discountAmount: number;
    manualDiscountAmount: number;
    codeDiscountAmount: number;
    deliveryFee: number;
    totalAmount: number;
    paymentBreakdown?: PaymentBreakdown;
  };
  payment: {
    status: string;
    method: string;
    transactionRef?: string;
    paymentBreakdown?: PaymentBreakdown;
    paidAt?: string;
  };
  source?: string;
  promotion?: {
    code: string;
    name: string;
    kind: "general" | "influencer";
    influencerName?: string;
  };
  invoice?: {
    invoiceId?: string;
    status?: string;
    currency?: string;
    paymentLink?: string;
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

      console.log("Order Details:", response);

      if (!response?.success) {
        setError(response?.message || "Failed to fetch order details");
        return;
      }

      const raw = (response as any).data || (response as any).order;
      if (!raw) {
        setError("No order data returned from server");
        return;
      }

      // Normalise backend response into OrderDetails shape
      const rawPricing = raw.pricing || {};
      const rawBreakdownSource =
        rawPricing.paymentBreakdown ||
        raw.payment?.paymentBreakdown ||
        raw.paymentBreakdown;
      // Offline/cash sales never set a payment breakdown, but the schema stores
      // an empty one ({ currency, feeRate }) from field defaults. Only treat it
      // as real when the charge amounts are present, otherwise the fee/charge
      // rows below would call .toFixed on undefined and crash the modal.
      const rawPaymentBreakdown =
        rawBreakdownSource &&
        typeof rawBreakdownSource.transactionFee === "number" &&
        typeof rawBreakdownSource.chargedAmount === "number"
          ? rawBreakdownSource
          : undefined;

      const pricingSubtotal =
        typeof rawPricing.subtotal === "number"
          ? rawPricing.subtotal
          : typeof raw.subtotal === "number"
          ? raw.subtotal
          : typeof raw.totalAmount === "number"
          ? raw.totalAmount
          : raw.amount && typeof raw.amount === "string" && raw.amount.startsWith("GHS")
          ? parseFloat(raw.amount.replace("GHS", "").trim())
          : 0;

      const deliveryFee =
        typeof rawPricing.deliveryFee === "number"
          ? rawPricing.deliveryFee
          : typeof raw.deliveryFee === "number"
          ? raw.deliveryFee
          : 0;

      const pricingDiscount =
        typeof rawPricing.discountAmount === "number"
          ? rawPricing.discountAmount
          : typeof raw.discountAmount === "number"
            ? raw.discountAmount
            : 0;
      const codeDiscountAmount =
        typeof rawPricing.codeDiscountAmount === "number"
          ? rawPricing.codeDiscountAmount
          : typeof raw.codeDiscountAmount === "number"
            ? raw.codeDiscountAmount
            : raw.promotion?.appliedAmount || 0;
      const manualDiscountAmount =
        typeof rawPricing.manualDiscountAmount === "number"
          ? rawPricing.manualDiscountAmount
          : typeof raw.manualDiscountAmount === "number"
            ? raw.manualDiscountAmount
            : raw.promotion
              ? Math.max(0, pricingDiscount - codeDiscountAmount)
              : pricingDiscount;

      const normalized: OrderDetails = {
        orderId: raw.orderId || raw._id || orderId,
        customer: {
          name: raw.customer?.name || raw.customerName || raw.customer || "N/A",
          email: raw.customer?.email || raw.email || "",
          contactNumber: raw.customer?.contactNumber || raw.contactNumber || "",
          deliveryAddress:
            raw.customer?.deliveryAddress ||
            raw.deliveryAddress ||
            (raw.deliveryMethod === "pickup" || raw.deliveryType === "pickup"
              ? "Pickup from store"
              : ""),
          city: raw.customer?.city || raw.city,
          specialInstructions:
            raw.customer?.specialInstructions ||
            raw.specialInstructions ||
            raw.specialInstruction,
        },
        items: Array.isArray(raw.items)
          ? raw.items.map((item: any) => ({
              productId: item.productId || item._id || "",
              name: item.name || item.productName || "Item",
              thumbnail: item.thumbnail || item.productThumbnail || "",
              unitPrice:
                typeof item.unitPrice === "number"
                  ? item.unitPrice
                  : typeof item.price === "number"
                  ? item.price
                  : 0,
              quantity: item.quantity || 1,
              total:
                typeof item.total === "number"
                  ? item.total
                  : (typeof item.unitPrice === "number"
                      ? item.unitPrice
                      : typeof item.price === "number"
                      ? item.price
                      : 0) * (item.quantity || 1),
              size: item.size,
              packageSelections: Array.isArray(item.packageSelections)
                ? item.packageSelections
                : [],
            }))
          : [],
        orderDetails: raw.orderDetails
          ? {
              orderItems: (raw.orderDetails as any).orderItems,
              pickUpDetails: (raw.orderDetails as any).pickUpDetails,
            }
          : {
              orderItems: Array.isArray(raw.orderItems) ? raw.orderItems : undefined,
              pickUpDetails: raw.pickUpDetails,
            },
        pricing: {
          subtotal: pricingSubtotal,
          discountAmount: pricingDiscount,
          manualDiscountAmount,
          codeDiscountAmount,
          deliveryFee,
          totalAmount:
            typeof rawPricing.totalAmount === "number"
              ? rawPricing.totalAmount
              : typeof raw.totalAmount === "number"
              ? raw.totalAmount
              : pricingSubtotal - pricingDiscount + deliveryFee,
          paymentBreakdown: rawPaymentBreakdown,
        },
        payment: {
          status: raw.payment?.status || raw.paymentStatus || "pending",
          method: raw.payment?.method || raw.paymentMethod || "paystack",
          transactionRef:
            raw.payment?.transactionRef ||
            raw.transactionRef ||
            raw.reference,
          paymentBreakdown: rawPaymentBreakdown,
          paidAt: raw.payment?.paidAt || raw.paidAt,
        },
        source: raw.source,
        promotion: raw.promotion,
        invoice: raw.invoice,
        orderStatus: raw.orderStatus || raw.status || "pending",
        createdAt: raw.createdAt || raw.date || new Date().toISOString(),
      };

      setOrderDetails(normalized);
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
          className="relative bg-[#faf9f5] rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#b9aca2] transition z-10"
          >
            <AdminIcon icon={Cancel01Icon} size={20} />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#222222]">Order Details</h2>
              <p className="text-[#5d6043] mt-2">View complete order information</p>
            </div>
            {/* Error and Loading States */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <AdminIcon icon={Loading03Icon} size={32} className="text-[#5d6043] animate-spin" />
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
                <div className="flex items-center justify-between p-4 bg-[#faf9f5] rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-[#5d6043]">Order ID</h4>
                    <p className="text-lg font-bold text-[#222222]">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderDetails.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : orderDetails.orderStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : orderDetails.orderStatus === 'preparing'
                        ? 'bg-blue-100 text-blue-700'
                        : orderDetails.orderStatus === 'awaiting-pickup'
                        ? 'bg-teal-100 text-teal-700'
                        : orderDetails.orderStatus === 'on-delivery'
                        ? 'bg-purple-100 text-purple-700'
                        : orderDetails.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#b9aca2] text-[#5d6043]'
                    }`}>
                      {(orderDetails.orderStatus || "")
                        .split("-")
                        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join(" ")}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="p-4 bg-[#faf9f5] rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AdminIcon icon={UserIcon} size={20} className="text-[#5d6043]" />
                    <h4 className="text-sm font-semibold text-[#222222]">Customer Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#5d6043]">Name</p>
                      <p className="text-sm font-medium text-[#222222]">{orderDetails.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5d6043]">Email</p>
                      <p className="text-sm font-medium text-[#222222]">{orderDetails.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5d6043]">Contact Number</p>
                      <p className="text-sm font-medium text-[#222222]">{orderDetails.customer.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5d6043]">Delivery Address</p>
                      <p className="text-sm font-medium text-[#222222]">{orderDetails.customer.deliveryAddress}</p>
                    </div>
                   
                    {orderDetails.customer.city && (
                      <div>
                        <p className="text-xs text-[#5d6043]">City</p>
                        <p className="text-sm font-medium text-[#222222]">{orderDetails.customer.city}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AdminIcon icon={Package01Icon} size={20} className="text-[#5d6043]" />
                    <h4 className="text-sm font-semibold text-[#222222]">Order Items</h4>
                  </div>
                  
                  {/* Display order items from orderDetails.orderItems if available */}
                  {orderDetails.orderDetails?.orderItems && orderDetails.orderDetails.orderItems.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {orderDetails.orderDetails.orderItems.map((item, index) => (
                        <div key={`order-item-${index}-${item.substring(0, 20)}`} className="p-3 bg-[#faf9f5] rounded-lg">
                          <p className="text-sm text-[#222222]">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  
                  {/* Display detailed items with images and prices */}
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="flex items-center gap-4 p-3 bg-[#faf9f5] rounded-lg">
                        <div className="w-16 h-16 bg-[#b9aca2] rounded-lg relative overflow-hidden shrink-0">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <AdminIcon icon={Package01Icon} size={32} className="text-[#b9aca2]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-[#222222]">{item.name}</h5>
                          {item.size && (
                            <p className="text-xs text-[#5d6043] mt-0.5">Size: {item.size}</p>
                          )}
                          {item.packageSelections && item.packageSelections.length > 0 && (
                            <div className="mt-1 text-xs text-[#5d6043]">
                              {item.packageSelections.map((selection) => (
                                <p key={`${selection.groupId || selection.groupLabel || "package"}-${selection.label}`}>
                                  {selection.groupLabel ? `${selection.groupLabel}: ` : ""}
                                  {selection.label} x {selection.quantity}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-[#5d6043] mt-1">
                            GHS {item.unitPrice.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#222222]">
                            GHS {item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup Details */}
                {(orderDetails.orderDetails?.pickUpDetails || orderDetails.customer.deliveryAddress === "Pickup from store") && (
                  <div className="p-4 bg-[#faf9f5] rounded-lg">
                    <h4 className="text-sm font-semibold text-[#222222] mb-3">Pickup Details</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#5d6043]">Pickup Date</p>
                        <p className="text-sm font-medium text-[#222222]">
                          {orderDetails.orderDetails?.pickUpDetails?.pickupDate || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#5d6043]">Special Instructions</p>
                        <p className="text-sm font-medium text-[#222222]">
                          {orderDetails.orderDetails?.pickUpDetails?.specialInstructions || "None"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="p-4 bg-[#faf9f5] rounded-lg">
                  <h4 className="text-sm font-semibold text-[#222222] mb-3">Pricing Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5d6043]">Subtotal</span>
                      <span className="text-[#5d6043]">
                        GHS {orderDetails.pricing.subtotal.toFixed(2)}
                      </span>
                    </div>
                    {orderDetails.pricing.codeDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5d6043]">
                          Promotion
                          {orderDetails.promotion?.code
                            ? ` (${orderDetails.promotion.code})`
                            : ""}
                        </span>
                        <span className="text-green-700">
                          -GHS {orderDetails.pricing.codeDiscountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {orderDetails.pricing.manualDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5d6043]">Manual discount</span>
                        <span className="text-green-700">
                          -GHS {orderDetails.pricing.manualDiscountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5d6043]">Order total</span>
                      <span className="text-[#5d6043]">
                        GHS {orderDetails.pricing.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {orderDetails.pricing.paymentBreakdown && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#5d6043]">Transaction fee (2%)</span>
                          <span className="text-[#5d6043]">
                            GHS {orderDetails.pricing.paymentBreakdown.transactionFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-[#b9aca2]/50 pt-2 text-base font-bold">
                          <span className="text-[#222222]">Paystack charge</span>
                          <span className="text-[#bd6325]">
                            GHS {orderDetails.pricing.paymentBreakdown.chargedAmount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {!orderDetails.pricing.paymentBreakdown && (
                      <div className="flex justify-between border-t border-[#b9aca2]/50 pt-2 text-base font-bold">
                        <span className="text-[#222222]">Total Amount</span>
                        <span className="text-[#5d6043]">
                          GHS {orderDetails.pricing.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {orderDetails.pricing.paymentBreakdown && (
                      <div className="rounded-lg bg-[#fff4e8] px-3 py-2 text-xs text-[#8f431b]">
                        Stored charged amount: {orderDetails.pricing.paymentBreakdown.chargedAmountPesewas} pesewas
                        {" "}({orderDetails.pricing.paymentBreakdown.currency})
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="p-4 bg-[#faf9f5] rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AdminIcon icon={CreditCardIcon} size={20} className="text-[#5d6043]" />
                    <h4 className="text-sm font-semibold text-[#222222]">Payment Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#5d6043]">Payment Status</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                        orderDetails.payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {orderDetails.payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#5d6043]">Payment Method</p>
                      <p className="text-sm font-medium text-[#222222]">
                        {formatPaymentMethod(orderDetails.payment.method)}
                      </p>
                    </div>
                    {orderDetails.payment.transactionRef && (
                      <div>
                        <p className="text-xs text-[#5d6043]">Transaction Reference</p>
                        <p className="text-sm font-medium text-[#222222]">
                          {orderDetails.payment.transactionRef}
                        </p>
                      </div>
                    )}
                    {orderDetails.payment.paidAt && (
                      <div>
                        <p className="text-xs text-[#5d6043]">Paid At</p>
                        <p className="text-sm font-medium text-[#222222]">
                          {new Date(orderDetails.payment.paidAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {orderDetails.source === "invoice" && orderDetails.invoice?.invoiceId && (
                      <div>
                        <p className="text-xs text-[#5d6043]">Invoice ID</p>
                        <p className="text-sm font-medium text-[#222222]">
                          {orderDetails.invoice.invoiceId}
                        </p>
                      </div>
                    )}
                    {orderDetails.source === "invoice" && orderDetails.invoice?.paymentLink && (
                      <div className="col-span-2">
                        <p className="text-xs text-[#5d6043]">Payment Link</p>
                        <a
                          href={orderDetails.invoice.paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-sm font-medium text-[#bd6325] hover:underline"
                        >
                          {orderDetails.invoice.paymentLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Date */}
                <div>
                  <p className="text-xs text-[#5d6043]">Order Placed</p>
                  <p className="text-sm font-medium text-[#222222]">
                    {new Date(orderDetails.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-[#b9aca2]/60">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#5d6043] text-[#faf9f5] rounded-full font-semibold hover:bg-[#222222] transition"
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
