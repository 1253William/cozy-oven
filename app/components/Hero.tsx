"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
  return(
    <section className="relative h-[80vh] flex items-center justify-center text-center">
      <Image
        src="https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
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
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Cozy Oven! What banana bread are you craving today?</h1>
        <p className="text-lg md:text-2xl mb-6">Discover the best banana bread in Ghana</p>
        <button className="px-6 py-3 bg-gray-900 rounded-full text-white font-semibold hover:bg-gray-800 transition">
          View Products
        </button>
      </motion.div>
    </section>
  );
}
