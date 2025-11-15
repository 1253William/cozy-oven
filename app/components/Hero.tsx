"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from "../../public/Hero (2).png"

export default function Hero() {
  return(
    <section className="relative h-[80vh] flex items-center justify-center text-center">
      <Image
        src={logo}
        alt="Cozy Oven"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-black/40"></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="relative z-10 text-white"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Cozy Oven! What's your banana bread craving for today?</h1>
        <p className="text-lg md:text-2xl mb-6">Discover the best banana bread in Ghana</p>
        <button className="px-6 py-3 bg-gray-900 rounded-full text-white font-semibold hover:bg-gray-800 transition">
          View Products
        </button>
      </motion.div>
    </section>
  );
}
