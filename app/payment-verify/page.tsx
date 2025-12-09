"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { orderService } from "../services/orderService";

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
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {status === "verifying" && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2 className="w-16 h-16 text-[#2A2C22] animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Verifying Payment
                </h1>
                <p className="text-gray-600">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 mb-4">{message}</p>
                {orderNumber && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-orange-500">{orderNumber}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Redirecting to order confirmation...
                </p>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment Failed
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full bg-[#2A2C22] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1a1c12] transition-colors"
                  >
                    Return to Cart
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
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
        <main className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </main>
      }
    >
      <PaymentVerificationContent />
    </Suspense>
  );
}
