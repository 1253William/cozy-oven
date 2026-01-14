"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles } from "lucide-react";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto"
            >
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#bd6325]/10 via-[#b9aca2]/5 to-[#5d6043]/10" />
              
              {/* Animated sparkles */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#bd6325]" />
                </motion.div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="relative p-8 md:p-10 text-center">
                {/* Gift Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    delay: 0.2,
                    damping: 15,
                    stiffness: 200,
                  }}
                  className="mb-6 flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#bd6325]/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-[#bd6325] to-[#a8551f] p-6 rounded-full">
                      <Gift className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-[#222222] mb-3"
                >
                  Thank You for Testing!
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed"
                >
                  We appreciate you taking the time to explore Cozy Oven. As a special thank you, enjoy a{" "}
                  <span className="font-semibold text-[#bd6325]">complimentary mini</span> with your order!
                </motion.p>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-[#bd6325] to-[#a8551f] text-white font-semibold py-4 px-8 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10">Start Shopping</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#a8551f] to-[#bd6325]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

              </div>

              {/* Decorative bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#bd6325] via-[#b9aca2] to-[#5d6043]" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

