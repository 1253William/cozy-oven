"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

type DeliveryMethod = "delivery" | "pickup";
type CheckoutStep = "info" | "delivery" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
  const [deliveryFee] = useState(10);
  const taxRate = 0.125;

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    city: "",
    date: "",
    time: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = getCartTotal();
  const tax = subtotal * taxRate;
  const total = subtotal + tax + (deliveryMethod === "delivery" ? deliveryFee : 0);

useEffect(() => {
    // Redirect if cart is empty
  if (cart.length === 0) {
    router.push("/cart");
  }
}, [cart, router]);

 if (cart.length === 0) {
    return null;
  }


  const steps = [
    { id: "info", label: "Customer Info", completed: false },
    { id: "delivery", label: "Delivery/Pickup", completed: false },
    { id: "payment", label: "Payment", completed: false },
    { id: "review", label: "Review", completed: false },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    const stepOrder: CheckoutStep[] = ["info", "delivery", "payment", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: CheckoutStep[] = ["info", "delivery", "payment", "review"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    } else {
      router.push("/cart");
    }
  };

  const handlePlaceOrder = () => {
    router.push("/order-success");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Checkout
          </h1>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        index <= currentStepIndex
                          ? "bg-[#2A2C22] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStepIndex ? "bg-[#2A2C22]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            {/* Customer Information */}
            {currentStep === "info" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="+233 123 456 789"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery/Pickup Details */}
            {currentStep === "delivery" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Delivery Details
                </h2>

                {/* Delivery/Pickup Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Delivery Method *
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                        deliveryMethod === "delivery"
                          ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                        deliveryMethod === "pickup"
                          ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Pickup
                    </button>
                  </div>
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.address}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryDetails.city}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                        placeholder="Accra"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {deliveryMethod === "delivery" ? "Delivery" : "Pickup"} Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDetails.date}
                      onChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      value={deliveryDetails.time}
                      onChange={(e) =>
                        setDeliveryDetails({
                          ...deliveryDetails,
                          time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryDetails.notes}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="Please ring bell once, no nuts..."
                  />
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Delivery Fee:</span> GHS{" "}
                      {deliveryFee.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details */}
            {currentStep === "payment" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Payment Method *
                    </label>
                    <div className="space-y-3">
                      {["card", "mobile-money", "paypal"].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`w-full py-3 px-4 rounded-lg border-2 text-left font-semibold transition-colors ${
                            paymentMethod === method
                              ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {method === "card" && "Credit/Debit Card"}
                          {method === "mobile-money" && "Mobile Money"}
                          {method === "paypal" && "PayPal"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      🔒 <span className="font-semibold">Secure Payment:</span> Your
                      payment information is encrypted and secure. We never store your
                      card details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Review & Confirm */}
            {currentStep === "review" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {cart.map((item) => {
                        const itemPrice = parseFloat(item.price.replace("GHS ", ""));
                        const itemTotal = itemPrice * item.quantity;
                        return (
                          <div
                            key={`${item.id}-${item.selectedSize}`}
                            className="flex justify-between text-gray-700"
                          >
                            <span>
                              {item.name} {item.selectedSize && `(${item.selectedSize})`} x{" "}
                              {item.quantity}
                            </span>
                            <span>GHS {itemTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      <p>{customerInfo.name}</p>
                      <p>{customerInfo.email}</p>
                      <p>{customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {deliveryMethod === "delivery" ? "Delivery" : "Pickup"} Details
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      {deliveryMethod === "delivery" && (
                        <>
                          <p>{deliveryDetails.address}</p>
                          <p>{deliveryDetails.city}</p>
                        </>
                      )}
                      <p>
                        Date: {deliveryDetails.date} at {deliveryDetails.time}
                      </p>
                      {deliveryDetails.notes && <p>Notes: {deliveryDetails.notes}</p>}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <p className="text-gray-700 capitalize">
                      {paymentMethod.replace("-", " ")}
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Order Total
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>GHS {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (12.5%)</span>
                        <span>GHS {tax.toFixed(2)}</span>
                      </div>
                      {deliveryMethod === "delivery" && (
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>GHS {deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                        <span>Total</span>
                        <span className="text-[#2A2C22]">
                          GHS {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
                    By placing this order, you agree to our{" "}
                    <a href="#" className="text-[#2A2C22] hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#2A2C22] hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            {currentStep === "review" ? (
              <button
                onClick={handlePlaceOrder}
                className="flex-1 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Place Order
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
