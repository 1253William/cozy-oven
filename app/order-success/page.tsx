"use client";

import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { clearCheckoutResumeToken } from "../utils/checkoutRecovery";

function OrderSuccessContent() {
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "CO12345678";

  useEffect(() => {
    clearCart();
    clearCheckoutResumeToken();
  }, [clearCart]);

  const handleTrackOrder = () => {
    if (isAuthenticated) {
      router.push("/account/orders");
      return;
    }

    router.push("/signup?next=/account/orders&source=guest-order");
  };

  return (
    <>
      <main className="editorial-shell min-h-screen pb-16 pt-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/86 p-8 text-center shadow-[0_26px_80px_rgba(34,34,34,0.16)] md:p-12">
            <div className="mb-6 flex justify-center">
              <CheckCircle2 className="h-20 w-20 text-[#bd6325]" />
            </div>

            <h1 className="font-editorial mb-4 text-4xl tracking-[-0.055em] text-[#222222] md:text-5xl">
              Thanks, your treats are in the oven!
            </h1>

            <p className="mb-8 text-lg text-[#5d6043]">
              Your order has been received and we&apos;re baking up something delicious just for you!
            </p>

            <div className="mb-8 rounded-[26px] bg-[#b9aca2] p-6">
              <p className="mb-2 text-sm font-medium text-[#5d6043]">Order Number</p>
              <p className="text-2xl font-black text-[#bd6325]">{orderNumber}</p>
            </div>

            <div className="mb-8 rounded-[26px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] p-6 text-left">
              <h2 className="mb-4 text-lg font-black text-[#222222]">What&apos;s Next?</h2>
              <ul className="space-y-3 text-[#5d6043]">
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#bd6325]">1.</span>
                  <span>You&apos;ll receive a confirmation email shortly with your order details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#bd6325]">2.</span>
                  <span>We&apos;ll start preparing your fresh-baked goodies right away</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#bd6325]">3.</span>
                  <span>Your order will be ready for delivery/pickup at your scheduled time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-[#bd6325]">4.</span>
                  <span>
                    After you try them, we&apos;d love a review on the product pages — it helps
                    other customers (and makes our day)
                  </span>
                </li>
              </ul>
            </div>

            <div className="mb-8 rounded-[22px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] p-4">
              <p className="text-sm text-[#5d6043]">
                A confirmation email has been sent to your email address with tracking information.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button onClick={() => router.push("/shop")} className="editorial-button px-8 py-3">
                Browse products to review
              </button>
              <button onClick={handleTrackOrder} className="editorial-button-outline px-8 py-3">
                Track Order
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="editorial-shell flex min-h-screen items-center justify-center pb-16 pt-24">
            <div className="text-[#5d6043]">Loading...</div>
          </main>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </>
  );
}
