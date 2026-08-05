"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "../../../services/orderService";
import useCustomerProducts from "../../../hooks/useCustomerProducts";
import { calculatePaystackPaymentBreakdown } from "../../../utils/paymentBreakdown";
import PackageSelectionEditor, {
  type PackageSelection,
  usePackageSelection,
} from "./PackageSelectionEditor";
import AdminPromotionSelector from "./AdminPromotionSelector";
import type { PromotionQuote } from "../../../services/promotionService";

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  packageSelections?: PackageSelection[];
}

export default function AddInvoiceModal({ isOpen, onClose, onSuccess }: AddInvoiceModalProps) {
  const { products } = useCustomerProducts({ limit: 100 });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [promotionQuote, setPromotionQuote] = useState<PromotionQuote | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableSizes = selectedProduct?.selectOptions?.filter(
    (opt) => opt.isAvailable !== false && opt.soldIndividually !== false
  ) || [];
  const packageSelection = usePackageSelection(selectedProduct);
  const subtotalAmount = invoiceItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const codeDiscountAmount = promotionQuote?.pricing.codeDiscountAmount || 0;
  const remainingSubtotal = Math.max(0, subtotalAmount - codeDiscountAmount);
  const parsedManualDiscount = discountAmount.trim() ? Number(discountAmount) : 0;
  const displayedManualDiscount =
    Number.isFinite(parsedManualDiscount) && parsedManualDiscount > 0
      ? Math.min(parsedManualDiscount, remainingSubtotal)
      : 0;
  const totalAmount = Math.max(
    0,
    subtotalAmount - codeDiscountAmount - displayedManualDiscount
  );
  const paymentBreakdown = calculatePaystackPaymentBreakdown(totalAmount);
  const promotionItems = invoiceItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    ...(item.size ? { size: item.size } : {}),
    ...(item.packageSelections?.length
      ? { packageSelections: item.packageSelections }
      : {}),
  }));

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setContactNumber("");
    setDeliveryAddress("");
    setCity("");
    setSpecialInstructions("");
    setDiscountAmount("");
    setPromotionQuote(null);
    setInvoiceItems([]);
    setSelectedProductId("");
    setSelectedSize("");
    setQuantity(1);
    setError(null);
  };

  const handleAddItem = () => {
    if (!selectedProductId || quantity < 1) {
      setError("Please select a product and quantity");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
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
          (opt) =>
            opt.label === selectedSize &&
            opt.isAvailable !== false &&
            opt.soldIndividually !== false
        )
      : null;

    const unitPrice = sizeOption?.additionalPrice ?? product.price;

    setInvoiceItems([
      ...invoiceItems,
      {
        productId: selectedProductId,
        productName: product.productName,
        quantity,
        unitPrice,
        ...(selectedSize && { size: selectedSize }),
        ...(product.productType === "package" && { packageSelections: packageSelection.selections }),
      },
    ]);
    setSelectedProductId("");
    setSelectedSize("");
    setQuantity(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim() || !contactNumber.trim()) {
      setError("Customer name, email, and contact number are required");
      return;
    }

    if (invoiceItems.length === 0) {
      setError("Please add at least one item to the invoice");
      return;
    }
    if (
      !Number.isFinite(parsedManualDiscount) ||
      parsedManualDiscount < 0 ||
      parsedManualDiscount > remainingSubtotal
    ) {
      setError(
        "Manual discount must be between GHS 0.00 and the subtotal remaining after the promotion"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const items = invoiceItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.size && { size: item.size }),
        ...(item.packageSelections && item.packageSelections.length > 0
          ? { packageSelections: item.packageSelections }
          : {}),
      }));

      const response = await orderService.createInvoice({
        items,
        deliveryFee: 0,
        deliveryAddress: deliveryAddress.trim() || "Invoice order",
        city: city.trim() || undefined,
        specialInstruction: specialInstructions.trim() || undefined,
        contactNumber: contactNumber.trim(),
        fullName: customerName.trim(),
        email: customerEmail.trim(),
        paymentMethod: "paystack",
        discountAmount: parsedManualDiscount || undefined,
        discountCode: promotionQuote?.promotion.code,
      });

      const orderId = response.data?.orderId || response.order?.orderId;
      if (orderId) {
        try {
          await orderService.downloadInvoicePdf(orderId);
        } catch (downloadError) {
          console.error("Invoice created, but PDF download failed:", downloadError);
          alert("Invoice created, but the PDF download failed. You can download it from the orders table.");
        }
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      setError(err?.response?.data?.message || "Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#faf9f5] shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-[#b9aca2]/60 bg-[#faf9f5] px-6 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#222222]">Create Invoice</h2>
                  <p className="text-sm text-[#5d6043]">Generate a GHS invoice with a Paystack payment link.</p>
                </div>
                <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-[#b9aca2]">
                  <AdminIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-[#222222]">Customer Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      placeholder="Full name *"
                      required
                    />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      placeholder="Email for Paystack payment *"
                      required
                    />
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      placeholder="Contact number *"
                      required
                    />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      placeholder="Delivery address"
                    />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      placeholder="City"
                    />
                  </div>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                    rows={3}
                    placeholder="Invoice notes or delivery instructions"
                  />
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-[#222222]">Invoice Items</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setSelectedSize("");
                      }}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                    {availableSizes.length > 0 && (
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                      >
                        <option value="">Regular</option>
                        {availableSizes.map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} (+GHS {opt.additionalPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition-colors hover:bg-[#222222]"
                    >
                      <AdminIcon icon={Add01Icon} size={16} />
                      Add
                    </button>
                  </div>

                  <PackageSelectionEditor
                    product={selectedProduct}
                    groups={packageSelection.groups}
                    counts={packageSelection.counts}
                    onChangeCount={packageSelection.changeCount}
                    contextLabel="invoice"
                  />

                  {invoiceItems.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {invoiceItems.map((item, index) => (
                        <div
                          key={`${item.productId}-${index}`}
                          className="flex items-center justify-between rounded-lg border border-[#b9aca2]/60 bg-[#faf9f5] p-3"
                        >
                          <div>
                            <p className="font-medium text-[#222222]">{item.productName}</p>
                            <p className="text-sm text-[#5d6043]">
                              {item.size || "Regular"} x {item.quantity} = GHS {(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
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
                          </div>
                          <button
                            type="button"
                            onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                          >
                            <AdminIcon icon={Delete02Icon} size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="border-t border-[#b9aca2]/60 pt-4">
                        <div className="space-y-2">
                          <AdminPromotionSelector
                            items={promotionItems}
                            quote={promotionQuote}
                            onChange={setPromotionQuote}
                          />
                          <div className="pt-2">
                            <label className="mb-2 block text-sm font-medium text-[#5d6043]">
                              Manual Discount Amount (Optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={remainingSubtotal}
                              step="0.01"
                              value={discountAmount}
                              onChange={(event) => setDiscountAmount(event.target.value)}
                              placeholder="0.00"
                              className="w-full rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-[#5d6043]">
                            <span>Product subtotal</span>
                            <span>GHS {subtotalAmount.toFixed(2)}</span>
                          </div>
                          {codeDiscountAmount > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-700">
                              <span>Promotion ({promotionQuote?.promotion.code})</span>
                              <span>-GHS {codeDiscountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {displayedManualDiscount > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-700">
                              <span>Manual discount</span>
                              <span>-GHS {displayedManualDiscount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm text-[#5d6043]">
                            <span>Order total</span>
                            <span>GHS {totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-[#5d6043]">
                            <span>Transaction fee (2%)</span>
                            <span>GHS {paymentBreakdown.transactionFee.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#b9aca2]/60 pt-2">
                            <span className="text-lg font-semibold text-[#222222]">Total to pay</span>
                            <span className="text-xl font-bold text-[#5d6043]">GHS {paymentBreakdown.chargedAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  The PDF includes your logo, GHS totals, and a link that redirects the customer to Paystack.
                </div>

                <div className="flex gap-3 border-t border-[#b9aca2]/60 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-[#b9aca2] px-4 py-2 transition-colors hover:bg-[#faf9f5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || invoiceItems.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <AdminIcon icon={Package01Icon} size={16} />
                        Create & Download
                      </>
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
