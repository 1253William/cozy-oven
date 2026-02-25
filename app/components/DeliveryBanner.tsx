"use client";

import { usePathname } from "next/navigation";
import { Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function DeliveryBanner() {
  const pathname = usePathname();
  
  // Don't show on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const message = "Freshly baked banana bread is delivered on Tuesdays and Thursdays";

  const duplicatedMessage = Array(3).fill(message).join(" • ");

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#bd6325] text-white py-2 overflow-hidden z-50 w-full">
      <div className="flex items-center gap-7 whitespace-nowrap">
        <motion.div
          className="flex items-center gap-7"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{duplicatedMessage}</span>
        </motion.div>
      </div>
    </div>
  );
}

