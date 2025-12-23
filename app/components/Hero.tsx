"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from "@/public/cozy3.png"

export default function Hero() {
  return(
    <section className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] flex items-center justify-center text-center mt-0 md:mt-5">
      <Image
        src={logo}
        alt="Cozy Oven"
        fill
        className="object-contain"
        priority
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-black/40"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="relative z-10 text-white px-4 max-w-3xl mx-auto"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Welcome to Cozy Oven! What&apos;s your banana bread craving for today?</h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6">Discover the best banana bread in Ghana</p>
      </motion.div>
    </section>
  );
}
