// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Check } from "lucide-react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import AuthModal from "../components/AuthModal";
// import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";
// import { orderService, type OrderItem } from "../services/orderService";

// type DeliveryMethod = "delivery" | "pickup";
// type CheckoutStep = "info" | "delivery" | "payment" | "review";

// export default function CheckoutPage() {
//   const router = useRouter();
//   const { cart, getCartTotal } = useCart();
//   const { isAuthenticated, user } = useAuth();
//   const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
//   const [authModalOpen, setAuthModalOpen] = useState(false);
//   const [deliveryFee] = useState(10);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const taxRate = 0.125;

//   // Form state - pre-fill with user data if authenticated
//   const [customerInfo, setCustomerInfo] = useState(() => ({
//     name: user?.fullName || "",
//     email: user?.email || "",
//     phone: "",
//   }));
//   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
//   const [deliveryDetails, setDeliveryDetails] = useState({
//     address: "",
//     city: "",
//     date: "",
//     time: "",
//     notes: "",
//   });
//   const [paymentMethod, setPaymentMethod] = useState("hubtel");

//   const subtotal = getCartTotal();
//   const total = subtotal;

// useEffect(() => {
//     // Redirect if cart is empty
//   if (cart.length === 0) {
//     router.push("/cart");
//   }
// }, [cart, router]);

//  if (cart.length === 0) {
//     return null;
//   }


//   const steps = [
//     { id: "info", label: "Customer Info", completed: false },
//     { id: "delivery", label: "Delivery/Pickup", completed: false },
//     { id: "payment", label: "Payment", completed: false },
//     { id: "review", label: "Review", completed: false },
//   ];

//   const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

//   const handleNext = () => {
//     const stepOrder: CheckoutStep[] = ["info", "delivery", "payment", "review"];
//     const currentIndex = stepOrder.indexOf(currentStep);
//     if (currentIndex < stepOrder.length - 1) {
//       setCurrentStep(stepOrder[currentIndex + 1]);
//     }
//   };

//   const handleBack = () => {
//     const stepOrder: CheckoutStep[] = ["info", "delivery", "payment", "review"];
//     const currentIndex = stepOrder.indexOf(currentStep);
//     if (currentIndex > 0) {
//       setCurrentStep(stepOrder[currentIndex - 1]);
//     } else {
//       router.push("/cart");
//     }
//   };

//   const handlePlaceOrder = async () => {
//     // Check if user is authenticated before placing order
//     if (!isAuthenticated) {
//       setAuthModalOpen(true);
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);

//     try {
//       // Prepare order items from cart
//       const items: OrderItem[] = cart.map((item) => ({
//         productId: item.id,
//         quantity: item.quantity,
//         unitPrice: parseFloat(item.price.replace("GHS ", "")),
//       }));

//       // Create the order
//       const checkoutResponse = await orderService.checkout({
//         items,
//         deliveryFee: deliveryMethod === "delivery" ? deliveryFee : 0,
//         deliveryAddress: deliveryMethod === "delivery" 
//           ? `${deliveryDetails.address}, ${deliveryDetails.city}`
//           : "Pickup from store",
//         contactNumber: customerInfo.phone,
//         paymentMethod: paymentMethod,
//       });

//       if (checkoutResponse.success && checkoutResponse.data) {
//         const orderId = checkoutResponse.data._id;

//         // Initiate payment with Hubtel
//         const paymentResponse = await orderService.initiatePayment(orderId);
//         console.log("Payment initiation response:", orderId, paymentResponse);

//         if (paymentResponse.success && paymentResponse.data.authorizationUrl) {
//           // Redirect to Hubtel checkout page
//           window.location.href = paymentResponse.data.authorizationUrl;
//         } else {
//           throw new Error("Failed to initiate payment");
//         }
//       } else {
//         throw new Error(checkoutResponse.message || "Failed to create order");
//       }
//     } catch (err) {
//       console.error("Order creation error:", err);
//       setError(
//         err instanceof Error ? err.message : "Failed to place order. Please try again."
//       );
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen pt-24 pb-16 bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
//             Checkout
//           </h1>

//           {/* Auth requirement notice */}
//           {!isAuthenticated && (
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-sm text-blue-800">
//                 ℹ️ You&apos;ll need to sign in before placing your order. Don&apos;t worry, we&apos;ll save your
//                 progress!
//               </p>
//             </div>
//           )}

//           {/* Progress Indicator */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               {steps.map((step, index) => (
//                 <div key={step.id} className="flex-1 flex items-center">
//                   <div className="flex flex-col items-center flex-1">
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
//                         index <= currentStepIndex
//                           ? "bg-[#2A2C22] text-white"
//                           : "bg-gray-200 text-gray-600"
//                       }`}
//                     >
//                       {index < currentStepIndex ? (
//                         <Check className="w-5 h-5" />
//                       ) : (
//                         index + 1
//                       )}
//                     </div>
//                     <span className="text-xs mt-2 text-center hidden sm:block">
//                       {step.label}
//                     </span>
//                   </div>
//                   {index < steps.length - 1 && (
//                     <div
//                       className={`flex-1 h-1 mx-2 ${
//                         index < currentStepIndex ? "bg-[#2A2C22]" : "bg-gray-200"
//                       }`}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Form Content */}
//           <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
//             {/* Customer Information */}
//             {currentStep === "info" && (
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                   Customer Information
//                 </h2>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Full Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={customerInfo.name}
//                       onChange={(e) =>
//                         setCustomerInfo({ ...customerInfo, name: e.target.value })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                       placeholder="John Doe"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       value={customerInfo.email}
//                       onChange={(e) =>
//                         setCustomerInfo({ ...customerInfo, email: e.target.value })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                       placeholder="john@example.com"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Phone Number *
//                     </label>
//                     <input
//                       type="tel"
//                       value={customerInfo.phone}
//                       onChange={(e) =>
//                         setCustomerInfo({ ...customerInfo, phone: e.target.value })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                       placeholder="+233 123 456 789"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Delivery/Pickup Details */}
//             {currentStep === "delivery" && (
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                   Delivery Details
//                 </h2>

//                 {/* Delivery/Pickup Toggle */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Delivery Method *
//                   </label>
//                   <div className="flex gap-4">
//                     <button
//                       onClick={() => setDeliveryMethod("delivery")}
//                       className={`flex-1 py-3 px-4 rounded-full border-2 font-semibold transition-colors ${
//                         deliveryMethod === "delivery"
//                           ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
//                           : "border-gray-300 text-gray-700 hover:border-gray-400"
//                       }`}
//                     >
//                       Delivery
//                     </button>
//                     <button
//                       onClick={() => setDeliveryMethod("pickup")}
//                       className={`flex-1 py-3 px-4 rounded-full border-2 font-semibold transition-colors ${
//                         deliveryMethod === "pickup"
//                           ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
//                           : "border-gray-300 text-gray-700 hover:border-gray-400"
//                       }`}
//                     >
//                       Pickup
//                     </button>
//                   </div>
//                 </div>

//                 {deliveryMethod === "delivery" && (
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Delivery Address *
//                       </label>
//                       <input
//                         type="text"
//                         value={deliveryDetails.address}
//                         onChange={(e) =>
//                           setDeliveryDetails({
//                             ...deliveryDetails,
//                             address: e.target.value,
//                           })
//                         }
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                         placeholder="123 Main Street"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         City *
//                       </label>
//                       <input
//                         type="text"
//                         value={deliveryDetails.city}
//                         onChange={(e) =>
//                           setDeliveryDetails({
//                             ...deliveryDetails,
//                             city: e.target.value,
//                           })
//                         }
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                         placeholder="Accra"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-2 gap-4 mt-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       {deliveryMethod === "delivery" ? "Delivery" : "Pickup"} Date *
//                     </label>
//                     <input
//                       type="date"
//                       value={deliveryDetails.date}
//                       onChange={(e) =>
//                         setDeliveryDetails({
//                           ...deliveryDetails,
//                           date: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Preferred Time *
//                     </label>
//                     <input
//                       type="time"
//                       value={deliveryDetails.time}
//                       onChange={(e) =>
//                         setDeliveryDetails({
//                           ...deliveryDetails,
//                           time: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Special Instructions (Optional)
//                   </label>
//                   <textarea
//                     value={deliveryDetails.notes}
//                     onChange={(e) =>
//                       setDeliveryDetails({
//                         ...deliveryDetails,
//                         notes: e.target.value,
//                       })
//                     }
//                     rows={3}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//                     placeholder="Please ring bell once, no nuts..."
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Payment Details */}
//             {currentStep === "payment" && (
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                   Payment Method
//                 </h2>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       Select Payment Method *
//                     </label>
//                     <div className="space-y-3">
//                       <button
//                         onClick={() => setPaymentMethod("hubtel")}
//                         className="w-full py-3 px-4 rounded-lg border-2 text-left font-semibold transition-colors border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
//                       >
//                         Hubtel Payment (Mobile Money, Cards, & More)
//                       </button>
//                     </div>
//                   </div>

//                   <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <p className="text-sm text-blue-800">
//                       🔒 <span className="font-semibold">Secure Payment:</span> You&apos;ll be redirected to Hubtel&apos;s secure checkout page to complete your payment. Hubtel supports Mobile Money, credit/debit cards, and other payment methods.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Review & Confirm */}
//             {currentStep === "review" && (
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                   Review Your Order
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Order Items */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                       Order Items
//                     </h3>
//                     <div className="space-y-2">
//                       {cart.map((item) => {
//                         const itemPrice = parseFloat(item.price.replace("GHS ", ""));
//                         const itemTotal = itemPrice * item.quantity;
//                         return (
//                           <div
//                             key={`${item.id}-${item.selectedSize}`}
//                             className="flex justify-between text-gray-700"
//                           >
//                             <span>
//                               {item.name} {item.selectedSize && `(${item.selectedSize})`} x{" "}
//                               {item.quantity}
//                             </span>
//                             <span>GHS {itemTotal.toFixed(2)}</span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* Customer Info */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                       Customer Information
//                     </h3>
//                     <div className="text-gray-700 space-y-1">
//                       <p>{customerInfo.name}</p>
//                       <p>{customerInfo.email}</p>
//                       <p>{customerInfo.phone}</p>
//                     </div>
//                   </div>

//                   {/* Delivery Details */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                       {deliveryMethod === "delivery" ? "Delivery" : "Pickup"} Details
//                     </h3>
//                     <div className="text-gray-700 space-y-1">
//                       {deliveryMethod === "delivery" && (
//                         <>
//                           <p>{deliveryDetails.address}</p>
//                           <p>{deliveryDetails.city}</p>
//                         </>
//                       )}
//                       <p>
//                         Date: {deliveryDetails.date} at {deliveryDetails.time}
//                       </p>
//                       {deliveryDetails.notes && <p>Notes: {deliveryDetails.notes}</p>}
//                     </div>
//                   </div>

//                   {/* Payment Method */}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                       Payment Method
//                     </h3>
//                     <p className="text-gray-700 capitalize">
//                       {paymentMethod.replace("-", " ")}
//                     </p>
//                   </div>

//                   {/* Order Summary */}
//                   <div className="border-t pt-4">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">
//                       Order Total
//                     </h3>
//                     <div className="space-y-2 text-gray-700">
//                       <div className="flex justify-between">
//                         <span>Subtotal</span>
//                         <span>GHS {subtotal.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
//                         <span>Total</span>
//                         <span className="text-[#2A2C22]">
//                           GHS {total.toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
//                     By placing this order, you agree to our{" "}
//                     <a href="#" className="text-[#2A2C22] hover:underline">
//                       Terms and Conditions
//                     </a>{" "}
//                     and{" "}
//                     <a href="#" className="text-[#2A2C22] hover:underline">
//                       Privacy Policy
//                     </a>
//                     .
//                   </div>

//                   {/* Error Message */}
//                   {error && (
//                     <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                       <p className="text-sm text-red-800">{error}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Navigation Buttons */}
//           <div className="flex gap-4">
//             <button
//               onClick={handleBack}
//               disabled={isProcessing}
//               className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-full transition-colors hover:cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Back
//             </button>
//             {currentStep === "review" ? (
//               <button
//                 onClick={handlePlaceOrder}
//                 disabled={isProcessing}
//                 className="flex-1 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-full transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isProcessing ? "Processing..." : "Place Order & Pay"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleNext}
//                 className="flex-1 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-full transition-colors hover:cursor-pointer"
//               >
//                 Continue
//               </button>
//             )}
//           </div>
//         </div>
//       </main>
//       <Footer />
      
//       {/* Auth Modal */}
//       <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
//     </>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService, type OrderItem } from "../services/orderService";

type DeliveryMethod = "delivery" | "pickup";
type CheckoutStep = "info" | "delivery" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
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
  const [paymentMethod, setPaymentMethod] = useState("hubtel");

  const subtotal = getCartTotal();
  // Fixed delivery fee (capped at 40 cedis maximum)
  const deliveryFee = 10;
  const total = subtotal + (deliveryMethod === "delivery" ? deliveryFee : 0);

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  if (cart.length === 0) return null;

  const steps = [
    { id: "info", label: "Customer Info" },
    { id: "delivery", label: "Delivery/Pickup" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
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

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const items: OrderItem[] = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price.replace("GHS ", "")),
      }));

      const checkoutResponse = await orderService.checkout({
        items,
        deliveryFee: deliveryMethod === "delivery" ? deliveryFee : 0,
        deliveryAddress:
          deliveryMethod === "delivery"
            ? `${deliveryDetails.address}, ${deliveryDetails.city}`
            : "Pickup from store",
        contactNumber: customerInfo.phone,
        paymentMethod,
      });

      if (!checkoutResponse.success || !checkoutResponse.order) {
        throw new Error(checkoutResponse.message || "Failed to create order");
      }

      // Use the orderId field (e.g., "CZ-850560") instead of _id for payment initiation
      const orderId = checkoutResponse.order.orderId || checkoutResponse.order._id;

      if (!orderId) {
        throw new Error("Order ID not found in response");
      }

      // Initiate payment
      const paymentResponse = await orderService.initiatePayment(orderId);
      console.log("Payment initiation response:", paymentResponse);

      // Handle different response structures - authorizationUrl can be at top level or in data
      const authUrl = paymentResponse.authorizationUrl || paymentResponse.data?.authorizationUrl;
      
      if (paymentResponse.success && authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (err) {
      console.error("Order creation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to place order. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ You&apos;ll need to sign in before placing your order.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-between">
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
                    {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center hidden sm:block">{step.label}</span>
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
                      className={`flex-1 py-3 px-4 rounded-full border-2 font-semibold transition-colors ${
                        deliveryMethod === "delivery"
                          ? "border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`flex-1 py-3 px-4 rounded-full border-2 font-semibold transition-colors ${
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
                      <button
                        onClick={() => setPaymentMethod("hubtel")}
                        className="w-full py-3 px-4 rounded-lg border-2 text-left font-semibold transition-colors border-[#2A2C22] bg-orange-50 text-[#2A2C22]"
                      >
                        Hubtel Payment (Mobile Money, Cards, & More)
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      🔒 <span className="font-semibold">Secure Payment:</span> You&apos;ll be redirected to Hubtel&apos;s secure checkout page to complete your payment. Hubtel supports Mobile Money, credit/debit cards, and other payment methods.
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

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep === "review" ? (
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="flex-1 bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Place Order & Pay"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#2A2C22] text-white font-bold py-3 px-6 rounded-full"
              >
                Continue
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
