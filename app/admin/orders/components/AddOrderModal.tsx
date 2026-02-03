"use client";

import { useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "../../../services/orderService";
import useCustomerProducts from "../../../hooks/useCustomerProducts";

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
}

export default function AddOrderModal({ isOpen, onClose, onSuccess }: AddOrderModalProps) {
  const { products } = useCustomerProducts({ limit: 100 });
  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find(p => p._id === selectedProductId);
  const availableSizes = selectedProduct?.selectOptions?.filter(opt => opt.isAvailable !== false) || [];

  const handleAddItem = () => {
    if (!selectedProductId || quantity < 1) {
      setError("Please select a product and quantity");
      return;
    }

    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    const sizeOption = selectedSize 
      ? product.selectOptions?.find(opt => opt.label === selectedSize && opt.isAvailable !== false)
      : null;
    
    const unitPrice = sizeOption?.additionalPrice ?? product.price;

    const newItem: OrderItem = {
      productId: selectedProductId,
      productName: product.productName,
      quantity,
      unitPrice,
      ...(selectedSize && { size: selectedSize }),
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

    setIsSubmitting(true);

    try {
      const items = orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ...(item.size && { size: item.size }),
      }));

      await orderService.checkout({
        items,
        deliveryFee: 0,
        deliveryAddress: deliveryAddress.trim() || "In-person purchase",
        city: city.trim() || undefined,
        specialInstruction: specialInstructions.trim() || undefined,
        contactNumber: contactNumber.trim(),
        paymentMethod: "cash",
      });

      // Reset form
      setCustomerName("");
      setContactNumber("");
      setDeliveryAddress("");
      setCity("");
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

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add Manual Order</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        placeholder="In-person purchase if left empty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City (Optional)
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Add Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => {
                            setSelectedProductId(e.target.value);
                            setSelectedSize("");
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {availableSizes.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items List */}
                  {orderItems.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              {item.size || "Regular"} × {item.quantity} = GHS {(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-xl font-bold text-[#2A2C22]">GHS {totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Payment Method:</strong> Cash (automatically set for manual orders)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || orderItems.length === 0}
                    className="flex-1 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
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

