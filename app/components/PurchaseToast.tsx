"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useCustomerProducts from "../hooks/useCustomerProducts";

interface PurchaseNotification {
  name: string;
  productName: string;
  productImage: string;
  timeAgo: string;
}

// Fake user names for purchase notifications
const fakeUsers = [
  "Elton", "Sarah", "Michael", "Ama", "Kwame", "Grace", "David", "Akosua",
  "James", "Efua", "John", "Adjoa", "Paul", "Mariama", "Peter", "Fatima"
];

export default function PurchaseToast() {
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const { products } = useCustomerProducts({ limit: 20 });

  useEffect(() => {
    if (products.length === 0) return;

    const showNotification = () => {
      // Pick a random user
      const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
      
      // Pick a random product
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      // Generate random time ago (5 minutes to 2 hours)
      const minutesAgo = Math.floor(Math.random() * 115) + 5;
      let timeAgo = "";
      if (minutesAgo < 60) {
        timeAgo = `${minutesAgo} minutes ago`;
      } else {
        const hours = Math.floor(minutesAgo / 60);
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }

      setCurrentNotification({
        name: randomUser,
        productName: randomProduct.productName,
        productImage: randomProduct.productThumbnail,
        timeAgo,
      });
    };

    // Show first notification after 2 seconds
    const initialTimeout = setTimeout(showNotification, 2000);

    // Then show every 40 seconds
    const interval = setInterval(showNotification, 40000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  const handleClose = () => {
    setCurrentNotification(null);
  };

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-50 bg-[#bd6325] text-white rounded-lg shadow-2xl overflow-hidden max-w-sm"
          style={{ minWidth: "320px" }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Product Image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
              <Image
                src={currentNotification.productImage || "/placeholder.svg"}
                alt={currentNotification.productName}
                fill
                className="object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">
                <span className="font-semibold">{currentNotification.name}</span> just purchased{" "}
                <span className="font-semibold">{currentNotification.productName}</span>
              </p>
              <p className="text-xs text-white/80 mt-1">
                {currentNotification.timeAgo}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

