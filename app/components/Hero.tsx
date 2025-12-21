"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import logo from "@/public/cozy3.png"

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Searching for:", searchQuery);
    }
  };

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
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banana bread flavors..."
              className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 rounded-full text-sm sm:text-base text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2A2C22] rounded-full hover:bg-[#1a1c12] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>

        <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 rounded-full text-white text-sm sm:text-base font-semibold hover:bg-gray-800 transition">
          View Products
        </button>
      </motion.div>
    </section>
  );
}
