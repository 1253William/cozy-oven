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
    <section className="relative h-[85vh] flex items-center justify-center text-center">
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Cozy Oven! What&apos;s your banana bread craving for today?</h1>
        <p className="text-lg md:text-2xl mb-6">Discover the best banana bread in Ghana</p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for banana bread, chocolate chip, walnut..."
              className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
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

        <button className="px-6 py-3 bg-gray-900 rounded-full text-white font-semibold hover:bg-gray-800 transition">
          View Products
        </button>
      </motion.div>
    </section>
  );
}
