"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "../../../services/orderService";
import useCustomerProducts from "../../../hooks/useCustomerProducts";
import PackageSelectionEditor, {
  type PackageSelection,
  usePackageSelection,
} from "./PackageSelectionEditor";
import customerService, { type Customer } from "../../../services/customerService";
import type { PromotionQuote } from "../../../services/promotionService";
import AdminPromotionSelector from "./AdminPromotionSelector";

type ManualPaymentMethod = "cash" | "mobile-money" | "bank-transfer" | "cheque";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  packageSelections?: PackageSelection[];
}

export default function AddOrderModal({ isOpen, onClose, onSuccess }: AddOrderModalProps) {
  const { products } = useCustomerProducts({ limit: 100 });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [promotionQuote, setPromotionQuote] = useState<PromotionQuote | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const availableSizes = selectedProduct?.selectOptions?.filter(
    opt => opt.isAvailable !== false && opt.soldIndividually !== false
  ) || [];
  const packageSelection = usePackageSelection(selectedProduct);

  useEffect(() => {
    if (!isOpen || selectedCustomerLabel) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setIsLoadingCustomers(true);
        setCustomerSearchError(null);
        const response = await customerService.getAllCustomers({
          page: 1,
          limit: 20,
          search: customerSearch.trim() || undefined,
        });
        if (active) setCustomerResults(response.data || []);
      } catch (err) {
        console.error("Customer directory search failed:", err);
        if (active) {
          setCustomerResults([]);
          setCustomerSearchError("Unable to load customers");
        }
      } finally {
        if (active) setIsLoadingCustomers(false);
      }
    }, customerSearch.trim() ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customerSearch, isOpen, selectedCustomerLabel]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.registeredUserId || null);
    setSelectedCustomerLabel(customer.fullName || customer.email || customer.phoneNumber || "Existing customer");
    setCustomerName(customer.fullName || "");
    setCustomerEmail(customer.email || "");
    setContactNumber(customer.phoneNumber || "");
    setCustomerSearch("");
    setCustomerResults([]);
    setCustomerSearchError(null);
  };

  const handleClearCustomerSelection = () => {
    setSelectedCustomerId(null);
    setSelectedCustomerLabel("");
    setCustomerSearch("");
  };

  const handleAddItem = () => {
    if (!selectedProductId || quantity < 1) {
      setError("Please select a product and quantity");
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (product.productType === "package" && !packageSelection.isComplete) {
      setError(
        packageSelection.groups.length === 0
          ? "This package has no valid configuration"
          : "Please complete the package selections before adding this item"
      );
      return;
    }

    const sizeOption = selectedSize 
      ? product.selectOptions?.find(
          opt =>
            opt.label === selectedSize &&
            opt.isAvailable !== false &&
            opt.soldIndividually !== false
        )
      : null;
    
    const unitPrice = sizeOption?.additionalPrice ?? product.price;

    const newItem: OrderItem = {
      productId: selectedProductId,
      productName: product.productName,
      quantity,
      unitPrice,
      ...(selectedSize && { size: selectedSize }),
      ...(product.productType === "package" && {
        packageSelections: packageSelection.selections,
      }),
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProductId("");
    setSelectedSize("");
    setQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !contactNumber.trim()) {
      setError("Please fill in customer name and contact number");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }

    const subtotalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const codeDiscountAmount = promotionQuote?.pricing.codeDiscountAmount || 0;
    const remainingSubtotal = Math.max(0, subtotalAmount - codeDiscountAmount);
    const parsedDiscount = discountAmount.trim() ? Number(discountAmount) : 0;
    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > remainingSubtotal) {
      setError("Manual discount must be between GHS 0.00 and the subtotal remaining after the promotion");
      return;
    }

    setIsSubmitting(true);

    try {
      const items = orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.size && { size: item.size }),
        ...(item.packageSelections?.length ? { packageSelections: item.packageSelections } : {}),
      }));

      await orderService.createOfflineSale({
        items,
        deliveryFee: 0,
        deliveryAddress: deliveryAddress.trim() || "In-person purchase",
        city: city.trim() || undefined,
        specialInstruction: specialInstructions.trim() || undefined,
        contactNumber: contactNumber.trim(),
        fullName: customerName.trim(),
        email: customerEmail.trim() || undefined,
        customerId: selectedCustomerId || undefined,
        discountAmount: parsedDiscount || undefined,
        discountCode: promotionQuote?.promotion.code,
        paymentMethod,
        paymentReference: paymentMethod !== "cash" ? paymentReference.trim() || undefined : undefined,
        transactionDate: transactionDate || undefined,
      });

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setContactNumber("");
      setSelectedCustomerId(null);
      setSelectedCustomerLabel("");
      setCustomerSearch("");
      setCustomerResults([]);
      setDeliveryAddress("");
      setCity("");
      setTransactionDate("");
      setPaymentMethod("cash");
      setPaymentReference("");
      setDiscountAmount("");
      setPromotionQuote(null);
      setSpecialInstructions("");
      setOrderItems([]);
      setSelectedProductId("");
      setSelectedSize("");
      setQuantity(1);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err?.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotalAmount = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const codeDiscountAmount = promotionQuote?.pricing.codeDiscountAmount || 0;
  const remainingSubtotal = Math.max(0, subtotalAmount - codeDiscountAmount);
  const parsedDiscountAmount = Number(discountAmount);
  const displayedManualDiscount =
    Number.isFinite(parsedDiscountAmount) && parsedDiscountAmount > 0
      ? Math.min(parsedDiscountAmount, remainingSubtotal)
      : 0;
  const totalAmount = Math.max(
    0,
    subtotalAmount - codeDiscountAmount - displayedManualDiscount
  );
  const promotionItems = orderItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    ...(item.size ? { size: item.size } : {}),
    ...(item.packageSelections?.length
      ? { packageSelections: item.packageSelections }
      : {}),
  }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#faf9f5] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#faf9f5] border-b border-[#b9aca2]/60 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#222222]">Add Manual Order</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#b9aca2] rounded-full transition-colors"
                >
                  <AdminIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-[#222222] mb-4">Customer Information</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">
                      Existing Customer (Optional)
                    </label>
                    {selectedCustomerLabel ? (
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#5d6043]/30 bg-[#eeeae0] px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <AdminIcon icon={UserIcon} size={20} className="text-[#5d6043]" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#222222]">{selectedCustomerLabel}</p>
                            <p className="text-xs text-[#5d6043]">
                              {selectedCustomerId ? "Registered customer" : "Previous guest customer"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearCustomerSelection}
                          className="shrink-0 text-sm font-medium text-[#5d6043] hover:text-[#222222]"
                        >
                          Use different customer
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[#b9aca2]/70 bg-white">
                        <div className="relative">
                          <AdminIcon icon={Search01Icon} size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5d6043]" />
                          <input
                            type="search"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search by name, email, or phone"
                            className="w-full rounded-lg border-0 bg-transparent py-2.5 pl-9 pr-10 focus:ring-2 focus:ring-[#5d6043]"
                          />
                          {isLoadingCustomers && (
                            <AdminIcon icon={Loading03Icon} size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#5d6043]" />
                          )}
                        </div>
                        <div className="max-h-48 overflow-y-auto border-t border-[#b9aca2]/50">
                          {customerSearchError ? (
                            <p className="px-4 py-3 text-sm text-red-700">{customerSearchError}</p>
                          ) : !isLoadingCustomers && customerResults.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-[#5d6043]">No existing customers found.</p>
                          ) : (
                            customerResults.map((customer, index) => (
                              <button
                                key={
                                  customer.registeredUserId ||
                                  customer.email ||
                                  customer.phoneNumber ||
                                  customer._id ||
                                  index
                                }
                                type="button"
                                onClick={() => handleSelectCustomer(customer)}
                                className="flex w-full items-center gap-3 border-b border-[#b9aca2]/40 px-4 py-3 text-left last:border-b-0 hover:bg-[#faf9f5]"
                              >
                                <AdminIcon icon={UserIcon} size={16} className="text-[#5d6043]" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-[#222222]">
                                    {customer.fullName || "Unnamed customer"}
                                  </span>
                                  <span className="block truncate text-xs text-[#5d6043]">
                                    {[customer.email, customer.phoneNumber].filter(Boolean).join(" | ") || "No contact details"}
                                  </span>
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        Delivery Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        placeholder="In-person purchase if left empty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        City (Optional)
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5d6043] mb-2">
                        Transaction Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={transactionDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Add Items */}
                <div>
                  <h3 className="text-lg font-semibold text-[#222222] mb-4">Order Items</h3>
                  <div className="bg-[#faf9f5] p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5d6043] mb-2">Product</label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => {
                            setSelectedProductId(e.target.value);
                            setSelectedSize("");
                          }}
                          className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {availableSizes.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-[#5d6043] mb-2">Size</label>
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                          >
                            <option value="">Regular</option>
                            {availableSizes.map((opt) => (
                              <option key={opt.label} value={opt.label}>
                                {opt.label} (+GHS {opt.additionalPrice.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-[#5d6043] mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors"
                        >
                          <AdminIcon icon={Add01Icon} size={16} />
                          Add
                        </button>
                      </div>
                    </div>
                    <PackageSelectionEditor
                      product={selectedProduct}
                      groups={packageSelection.groups}
                      counts={packageSelection.counts}
                      onChangeCount={packageSelection.changeCount}
                      contextLabel="order"
                    />
                  </div>

                  {/* Order Items List */}
                  {orderItems.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-[#faf9f5] p-3 rounded-lg border border-[#b9aca2]/60"
                        >
                          <div>
                            <p className="font-medium text-[#222222]">{item.productName}</p>
                            <p className="text-sm text-[#5d6043]">
                              {item.size || "Regular"} × {item.quantity} = GHS {(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            {item.packageSelections?.map((selection) => (
                              <p
                                key={`${selection.groupId || selection.groupLabel}-${selection.label}`}
                                className="text-xs text-[#5d6043]"
                              >
                                {selection.groupLabel ? `${selection.groupLabel}: ` : ""}
                                {selection.label} x {selection.quantity}
                              </p>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <AdminIcon icon={Delete02Icon} size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="mt-4 pt-4 border-t border-[#b9aca2]/60">
                        <div className="mb-3">
                          <AdminPromotionSelector
                            items={promotionItems}
                            quote={promotionQuote}
                            onChange={setPromotionQuote}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="mb-2 block text-sm font-medium text-[#5d6043]">
                            Discount Amount (Optional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={remainingSubtotal}
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#5d6043]">Subtotal</span>
                          <span className="text-[#222222]">GHS {subtotalAmount.toFixed(2)}</span>
                        </div>
                        {codeDiscountAmount > 0 && (
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-[#5d6043]">
                              Promotion ({promotionQuote?.promotion.code})
                            </span>
                            <span className="text-green-700">
                              -GHS {codeDiscountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {displayedManualDiscount > 0 && (
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-[#5d6043]">Manual discount</span>
                            <span className="text-green-700">-GHS {displayedManualDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between border-t border-[#b9aca2]/40 pt-2">
                          <span className="text-lg font-semibold text-[#222222]">Total</span>
                          <span className="text-xl font-bold text-[#5d6043]">GHS {totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-[#222222]">Payment Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d6043]">
                        Payment Method *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => {
                          const nextMethod = e.target.value as ManualPaymentMethod;
                          setPaymentMethod(nextMethod);
                          if (nextMethod === "cash") setPaymentReference("");
                        }}
                        className="w-full rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      >
                        <option value="cash">Cash</option>
                        <option value="mobile-money">Mobile Money</option>
                        <option value="bank-transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    {paymentMethod !== "cash" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#5d6043]">
                          {paymentMethod === "cheque" ? "Cheque Number" : "Transaction Reference"} (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={120}
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder={
                            paymentMethod === "mobile-money"
                              ? "Mobile Money transaction ID"
                              : paymentMethod === "bank-transfer"
                                ? "Bank transfer reference"
                                : "Cheque number"
                          }
                          className="w-full rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#b9aca2]/60">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || orderItems.length === 0}
                    className="flex-1 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Order"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

