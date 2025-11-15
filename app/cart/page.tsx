"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [deliveryFee] = useState(10); // Fixed delivery fee for now
  const taxRate = 0.125; // 12.5% tax

  const subtotal = getCartTotal();
  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee;

  const handleQuantityChange = (productId: string, newQuantity: number, size?: string) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
    } else {
      updateQuantity(productId, newQuantity, size);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Your basket&apos;s feeling lonely. Add some treats!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Browse our delicious selection of fresh-baked banana bread and pastries
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Shop Now
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = parseFloat(item.price.replace("GHS ", ""));
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            {item.selectedSize && (
                              <p className="text-sm text-gray-600">
                                Size: {item.selectedSize}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 mr-2">Qty:</span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1, item.selectedSize)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1, item.selectedSize)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              GHS {itemPrice.toFixed(2)} each
                            </p>
                            <p className="text-lg font-bold text-[#2A2C22]">
                              GHS {itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary - Right Side (Sticky on desktop) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>GHS {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (12.5%)</span>
                    <span>GHS {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>GHS {deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#2A2C22]">GHS {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
