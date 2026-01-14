"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useCustomerProducts from "../hooks/useCustomerProducts";
import purchaseToastService, { PurchaseData } from "../services/purchaseToastService";

interface PurchaseNotification {
  name: string;
  productName: string;
  productImage: string;
  timeAgo: string;
}

// Fallback fake user names and products for when API returns empty array
const fakeUsers = [
  "Elton", "Sarah", "Michael", "Ama", "Kwame", "Grace", "David", "Akosua",
  "James", "Efua", "John", "Adjoa", "Paul", "Mariama", "Peter", "Fatima"
];

// Format time ago from ISO date string
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const purchaseDate = new Date(dateString);
  const diffInMs = now.getTime() - purchaseDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  
  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
};

export default function PurchaseToast() {
  const pathname = usePathname();
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products } = useCustomerProducts({ limit: 20 });

  // Don't show toast on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Fetch purchases from API
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseToastService.getRecentPurchases();
        console.log("Data",data)
        setPurchases(data);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAdminPage) {
      fetchPurchases();
      // Refresh purchases every 5 minutes
      const refreshInterval = setInterval(fetchPurchases, 5 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [isAdminPage]);

  useEffect(() => {
    // Don't show notifications on admin pages
    if (isAdminPage || isLoading) return;

    const showNotification = () => {
      let notification: PurchaseNotification | null = null;

      // Use API data if available, otherwise fall back to fake data
      if (purchases.length > 0) {
        // Pick a random purchase from API data
        const randomPurchase = purchases[Math.floor(Math.random() * purchases.length)];
        const firstName = randomPurchase.customerName.split(' ')[0]; // Get first name
        
        notification = {
          name: firstName,
          productName: randomPurchase.productName,
          productImage: randomPurchase.thumbnail,
          timeAgo: formatTimeAgo(randomPurchase.purchasedAt),
        };
      } else if (products.length > 0) {
        // Fallback to fake data
        const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        
        // Generate random time ago (5 minutes to 2 hours)
        const minutesAgo = Math.floor(Math.random() * 115) + 5;
        let timeAgo = "";
        if (minutesAgo < 60) {
          timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        } else {
          const hours = Math.floor(minutesAgo / 60);
          timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        notification = {
          name: randomUser,
          productName: randomProduct.productName,
          productImage: randomProduct.productThumbnail,
          timeAgo,
        };
      }

      if (notification) {
        setCurrentNotification(notification);
      }
    };

    // Show first notification after 2 seconds
    const initialTimeout = setTimeout(showNotification, 2000);

    // Then show every 40 seconds
    const interval = setInterval(showNotification, 40000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [purchases, products, isAdminPage, isLoading]);

  const handleClose = () => {
    setCurrentNotification(null);
  };

  // Don't render anything on admin pages
  if (isAdminPage) return null;

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-50 bg-[#bd6325] text-white rounded-lg shadow-2xl overflow-hidden max-w-sm border-2 border-white/20"
          style={{ minWidth: "320px" }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Product Image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white">
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
              className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
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

