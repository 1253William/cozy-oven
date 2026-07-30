"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import purchaseToastService, { PurchaseData } from "../services/purchaseToastService";

interface PurchaseNotification {
  name: string;
  productName: string;
  productImage: string;
  timeAgo: string;
}

// Format time ago from ISO date string
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const purchaseDate = new Date(dateString);
  const diffInMs = now.getTime() - purchaseDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
};

export default function PurchaseToast() {
  const pathname = usePathname();
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Don't show toast on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Fetch purchases from API
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseToastService.getRecentPurchases();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const now = Date.now();
        // Only keep purchases from the last 24 hours
        setPurchases(
          data.filter((purchase) => {
            const purchasedAt = new Date(purchase.purchasedAt).getTime();
            return Number.isFinite(purchasedAt) && now - purchasedAt <= oneDayMs;
          })
        );
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
    // Don't show notifications on admin pages, while loading, or with no real data
    if (isAdminPage || isLoading || purchases.length === 0) {
      // #region agent log
      if (!isAdminPage && !isLoading && purchases.length === 0) {
        fetch('http://127.0.0.1:7682/ingest/510e7aaa-5fe9-4bfe-b44b-f784e1fadb5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'464b52'},body:JSON.stringify({sessionId:'464b52',runId:'post-fix',hypothesisId:'B',location:'PurchaseToast.tsx:empty',message:'no toast — no real purchases',data:{source:'none',purchaseCount:0},timestamp:Date.now()})}).catch(()=>{});
      }
      // #endregion
      return;
    }

    const showNotification = () => {
      const randomPurchase = purchases[Math.floor(Math.random() * purchases.length)];
      const firstName = randomPurchase.customerName.split(" ")[0];

      const notification: PurchaseNotification = {
        name: firstName,
        productName: randomPurchase.productName,
        productImage: randomPurchase.thumbnail,
        timeAgo: formatTimeAgo(randomPurchase.purchasedAt),
      };

      // #region agent log
      fetch('http://127.0.0.1:7682/ingest/510e7aaa-5fe9-4bfe-b44b-f784e1fadb5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'464b52'},body:JSON.stringify({sessionId:'464b52',runId:'post-fix',hypothesisId:'B',location:'PurchaseToast.tsx:real',message:'showing real purchase toast',data:{source:'api',purchaseCount:purchases.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      setCurrentNotification(notification);
    };

    // Show first notification after 2 seconds
    const initialTimeout = setTimeout(showNotification, 2000);

    // Then show every 40 seconds
    const interval = setInterval(showNotification, 40000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [purchases, isAdminPage, isLoading]);

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
          className="fixed bottom-6 left-4 z-50 max-w-sm overflow-hidden rounded-[26px] border border-[rgba(34,34,34,0.1)] bg-[#faf9f5]/95 text-[#222222] shadow-[0_26px_80px_rgba(34,34,34,0.16)] backdrop-blur-xl sm:left-6"
          style={{ minWidth: "320px" }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Product Image */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#b9aca2]">
              <Image
                src={currentNotification.productImage || "/placeholder.svg"}
                alt={currentNotification.productName}
                fill
                className="object-cover"
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight text-[#5d6043]">
                <span className="font-black text-[#222222]">{currentNotification.name}</span> just purchased{" "}
                <span className="font-black text-[#222222]">{currentNotification.productName}</span>
              </p>
              <p className="mt-1 text-xs text-[#5d6043]">
                {currentNotification.timeAgo}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="shrink-0 rounded-full bg-[#b9aca2] p-1 text-[#222222] transition-colors hover:bg-[#b9aca2]"
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
