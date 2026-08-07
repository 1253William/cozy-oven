"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { orderService } from "../services/orderService";
import { clearCheckoutResumeToken } from "../utils/checkoutRecovery";

function PaymentVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage("Payment reference not found");
        return;
      }

      try {
        const response = await orderService.verifyPayment(reference);

        if (response.success) {
          clearCheckoutResumeToken();
          setStatus("success");
          setMessage(response.message || "Payment verified successfully!");
          setOrderNumber(response.data.orderId);

          // Redirect to order success page after 2 seconds
          setTimeout(() => {
            router.push(`/order-success?orderNumber=${response.data.orderId}`);
          }, 2000);
        } else {
          setStatus("failed");
          setMessage(response.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage("Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-[#faf9f5] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-[#faf9f5] rounded-lg shadow-sm p-8 text-center">
            {status === "verifying" && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2 className="w-16 h-16 text-[#5d6043] animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-[#222222] mb-4">
                  Verifying Payment
                </h1>
                <p className="text-[#5d6043]">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-[#222222] mb-4">
                  Payment Successful!
                </h1>
                <p className="text-[#5d6043] mb-4">{message}</p>
                {orderNumber && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-[#5d6043] mb-1">Order Number</p>
                    <p className="text-lg font-bold text-orange-500">{orderNumber}</p>
                  </div>
                )}
                <p className="mt-4 text-sm leading-6 text-[#5d6043]">
                  After you try your treats, leave a review on the product pages — it helps other
                  customers.
                </p>
                <p className="text-sm text-[#5d6043] mt-4">
                  Redirecting to order confirmation...
                </p>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-[#222222] mb-4">
                  Payment Failed
                </h1>
                <p className="text-[#5d6043] mb-6">{message}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full bg-[#5d6043] text-[#faf9f5] font-semibold py-3 px-6 rounded-lg hover:bg-[#222222] transition-colors"
                  >
                    Return to Cart
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full border border-[#b9aca2] text-[#5d6043] font-semibold py-3 px-6 rounded-lg hover:bg-[#faf9f5] transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-24 pb-16 bg-[#faf9f5] flex items-center justify-center">
          <div className="text-[#5d6043]">Loading...</div>
        </main>
      }
    >
      <PaymentVerificationContent />
    </Suspense>
  );
}
