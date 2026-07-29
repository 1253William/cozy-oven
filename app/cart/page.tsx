"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/orderService";
import {
  clearCheckoutResumeToken,
  getCheckoutResumeToken,
} from "../utils/checkoutRecovery";
import { isAllowedPaymentRedirectUrl } from "../utils/paymentRedirect";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [pendingCheckoutAvailable, setPendingCheckoutAvailable] = useState(false);
  const [isResumingCheckout, setIsResumingCheckout] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  const subtotal = getCartTotal();
  const total = subtotal;

  useEffect(() => {
    setPendingCheckoutAvailable(Boolean(getCheckoutResumeToken()));
  }, []);

  const handleResumeCheckout = async () => {
    const resumeToken = getCheckoutResumeToken();
    if (!resumeToken) {
      setPendingCheckoutAvailable(false);
      return;
    }

    setIsResumingCheckout(true);
    setResumeError(null);

    try {
      const response = await orderService.resumeCheckout(resumeToken);
      const checkoutUrl =
        response.checkoutUrl ||
        response.data?.checkoutUrl ||
        response.authorizationUrl ||
        response.data?.authorizationUrl;

      if (response.success && checkoutUrl) {
        if (!isAllowedPaymentRedirectUrl(checkoutUrl)) {
          throw new Error("Invalid payment redirect URL. Please contact support.");
        }
        window.location.href = checkoutUrl;
        return;
      }

      throw new Error(response.message || "Unable to resume checkout");
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 400) {
        clearCheckoutResumeToken();
        setPendingCheckoutAvailable(false);
      }
      const axiosMessage = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setResumeError(
        axiosMessage ||
          (err instanceof Error ? err.message : "Unable to resume checkout. Please place the order again.")
      );
    } finally {
      setIsResumingCheckout(false);
    }
  };

  const handleQuantityChange = (
    productId: string,
    newQuantity: number,
    size?: string,
    packageSelections?: { label: string; quantity: number; groupLabel?: string; groupId?: string; type?: "fixed" | "selection" }[]
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size, packageSelections);
    } else {
      updateQuantity(productId, newQuantity, size, packageSelections);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="editorial-shell min-h-screen pb-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-6 h-24 w-24 text-[#bd6325]" />
              <h2 className="font-editorial mb-4 text-3xl tracking-[-0.03em] text-[#222222] sm:text-4xl">
                Your basket&apos;s feeling lonely. Add some treats!
              </h2>
              <p className="mb-8 max-w-md text-sm text-[#5d6043] sm:text-base">
                Browse our delicious selection of fresh-baked banana bread and pastries
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="editorial-button px-8 py-3"
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
      <main className="editorial-shell min-h-screen pb-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial mb-8 text-3xl tracking-[-0.03em] text-[#222222] sm:text-4xl">
            Shopping Cart
          </h1>

          {pendingCheckoutAvailable && (
            <div className="mb-6 rounded-[24px] border border-[#bd6325]/30 bg-orange-50 p-4 shadow-[0_12px_40px_rgba(34,34,34,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#222222]">Continue your pending payment</p>
                  <p className="mt-1 text-sm text-[#5d6043]">
                    We found an unfinished checkout on this device.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResumeCheckout}
                    disabled={isResumingCheckout}
                    className="rounded-full bg-[#222222] px-4 py-2 text-sm font-semibold text-[#faf9f5] transition-colors hover:bg-[#5d6043] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResumingCheckout ? "Opening..." : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearCheckoutResumeToken();
                      setPendingCheckoutAvailable(false);
                      setResumeError(null);
                    }}
                    className="rounded-full border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043] transition-colors hover:bg-[#faf9f5]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              {resumeError && (
                <p className="mt-3 text-sm text-red-700">{resumeError}</p>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const itemPrice = parseFloat(item.price.replace("GHS ", ""));
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.id}-${item.selectedSize}-${JSON.stringify(item.packageSelections || [])}`}
                    className="rounded-[30px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/82 p-4 shadow-[0_12px_40px_rgba(34,34,34,0.10)] transition-shadow hover:shadow-[0_26px_80px_rgba(34,34,34,0.16)] md:p-6"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[22px] bg-[#b9aca2] md:h-32 md:w-32">
                        <Image
                          src={item.image || ""}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="mb-1 text-lg font-black text-[#222222]">
                              {item.name}
                            </h3>
                            {item.selectedSize && (
                              <p className="text-sm text-[#5d6043]">
                                Size: {item.selectedSize}
                              </p>
                            )}
                            {item.packageSelections && item.packageSelections.length > 0 && (
                              <div className="mt-2 text-sm text-[#5d6043]">
                                <p className="font-black text-[#5d6043]">Package selections:</p>
                                <ul className="mt-1 space-y-0.5">
                                  {item.packageSelections.map((selection) => (
                                    <li key={`${selection.groupId || selection.groupLabel || "package"}-${selection.label}`}>
                                      {selection.groupLabel ? `${selection.groupLabel}: ` : ""}
                                      {selection.label} x {selection.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.packageSelections)}
                            className="rounded-full bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-100"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <span className="mr-2 text-sm text-[#5d6043]">Qty:</span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1, item.selectedSize, item.packageSelections)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(34,34,34,0.12)] bg-[#faf9f5] transition-colors hover:bg-[#b9aca2]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1, item.selectedSize, item.packageSelections)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(34,34,34,0.12)] bg-[#faf9f5] transition-colors hover:bg-[#b9aca2]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-[#5d6043]">
                              GHS {itemPrice.toFixed(2)} each
                            </p>
                            <p className="text-lg font-black text-[#bd6325]">
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
              <div className="sticky top-24 rounded-[30px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/86 p-6 shadow-[0_12px_40px_rgba(34,34,34,0.10)]">
                <h2 className="font-editorial mb-6 text-2xl tracking-[-0.03em] text-[#222222]">
                  Order Summary
                </h2>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-[#5d6043]">
                    <span>Subtotal</span>
                    <span>GHS {subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs leading-5 text-[#5d6043]">
                    Delivery from GHS 30, paid on delivery.
                  </p>
                  <div className="flex justify-between border-t border-[rgba(34,34,34,0.12)] pt-3 text-lg font-semibold text-[#222222]">
                    <span>Total</span>
                    <span className="text-[#bd6325]">GHS {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="editorial-button mb-3 w-full px-6 py-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push("/shop")}
                  className="editorial-button-outline w-full px-6 py-3"
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
