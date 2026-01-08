"use client";

import { Truck, ShieldCheck, CreditCard } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Bubble component for floating animations
const FloatingBubble = ({ 
  size, 
  color, 
  left, 
  top, 
  delay, 
  duration 
}: { 
  size: number; 
  color: string; 
  left: string; 
  top: string; 
  delay: number;
  duration: number;
}) => {
  return (
    <motion.div
      className="absolute rounded-full opacity-20"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        left,
        top,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export default function Qualities() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const qualities = [
    { 
      icon: Truck, 
      title: "Quick Delivery", 
      bgColor: "bg-[#bd6325]/10", 
      iconColor: "text-[#bd6325]",
      bubbles: [
        { size: 20, color: "#bd6325", left: "10%", top: "15%", delay: 0, duration: 3 },
        { size: 15, color: "#5d6043", left: "80%", top: "25%", delay: 0.5, duration: 4 },
        { size: 25, color: "#b9aca2", left: "20%", top: "70%", delay: 1, duration: 3.5 },
        { size: 18, color: "#bd6325", left: "75%", top: "65%", delay: 1.5, duration: 4.5 },
        { size: 12, color: "#5d6043", left: "50%", top: "10%", delay: 0.8, duration: 3.2 },
      ]
    },
    { 
      icon: ShieldCheck, 
      title: "Customer Satisfaction Guarantee", 
      bgColor: "bg-[#5d6043]/10", 
      iconColor: "text-[#5d6043]",
      bubbles: [
        { size: 22, color: "#5d6043", left: "15%", top: "20%", delay: 0, duration: 3.5 },
        { size: 16, color: "#bd6325", left: "85%", top: "30%", delay: 0.7, duration: 4 },
        { size: 20, color: "#b9aca2", left: "25%", top: "75%", delay: 1.2, duration: 3.8 },
        { size: 14, color: "#5d6043", left: "70%", top: "60%", delay: 0.3, duration: 4.2 },
        { size: 19, color: "#bd6325", left: "45%", top: "15%", delay: 1, duration: 3.3 },
      ]
    },
    { 
      icon: CreditCard, 
      title: "Secure Payments", 
      bgColor: "bg-[#b9aca2]/10", 
      iconColor: "text-[#b9aca2]",
      bubbles: [
        { size: 18, color: "#b9aca2", left: "12%", top: "18%", delay: 0, duration: 4 },
        { size: 24, color: "#5d6043", left: "82%", top: "28%", delay: 0.6, duration: 3.5 },
        { size: 16, color: "#bd6325", left: "22%", top: "72%", delay: 1.1, duration: 4.3 },
        { size: 20, color: "#b9aca2", left: "78%", top: "62%", delay: 0.4, duration: 3.7 },
        { size: 14, color: "#5d6043", left: "48%", top: "12%", delay: 0.9, duration: 4.1 },
      ]
    },
  ];

  return (
    <section ref={sectionRef} className="md:py-24 py-16 bg-[#faf9f5]">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {qualities.map((quality, index) => {
            const Icon = quality.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${quality.bgColor} rounded-2xl py-6 px-6 shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md relative overflow-hidden`}
              >
                {/* Floating Bubbles */}
                {quality.bubbles.map((bubble, bubbleIndex) => (
                  <FloatingBubble
                    key={bubbleIndex}
                    size={bubble.size}
                    color={bubble.color}
                    left={bubble.left}
                    top={bubble.top}
                    delay={bubble.delay}
                    duration={bubble.duration}
                  />
                ))}
                
                {/* Content */}
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div className={`bg-white p-4 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${quality.iconColor}`} />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#222222] mb-0">
                    {quality.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#5d6043] mb-2">
            1,300+
          </p>
          <p className="text-lg sm:text-xl text-[#222222] font-medium">
            Deliveries Made Successfully
          </p>
        </motion.div>
      </div>
    </section>
  );
}
