"use client";

import { usePathname } from "next/navigation";
import { Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function DeliveryBanner() {
  const pathname = usePathname();
  const settings = useSiteSettings();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const enabled = settings.deliveryBanner?.enabled !== false;
  const message = String(settings.deliveryBanner?.message || "").trim();
  if (!enabled || !message) return null;

  const duplicatedMessage = Array(3).fill(message).join(" • ");

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full overflow-hidden bg-[#bd6325] py-2 text-[#faf9f5]">
      <div className="flex items-center gap-7 whitespace-nowrap">
        <motion.div
          className="flex items-center gap-7"
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          <Truck className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{duplicatedMessage}</span>
        </motion.div>
      </div>
    </div>
  );
}
