"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from "@/public/cozy3.png"
import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { customerProductService } from '../services/customerProductService';
import { Product } from '../services/productService';


export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search with abort controller to prevent race conditions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await customerProductService.searchProducts(searchQuery);
        if (response.success && !abortController.signal.aborted) {
          setSearchResults(response.data);
          setShowResults(true);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults?.length > 0) {
      // Navigate to first result or search results page
      router.push(`/product/${searchResults[0]._id}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  const handleSearchResultClick = (productId: string) => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/product/${productId}`);
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
        <div ref={searchRef} className="mb-6 relative">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for banana bread, chocolate chip, walnut..."
              className="w-full px-6 py-4 pr-12 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#2A2C22] border border-white bg-white/20 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2A2C22] rounded-full hover:bg-[#1a1c12] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden z-50"
            >
              {searchLoading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Searching...
                </div>
              )}

              {!searchLoading && searchQuery && searchResults?.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No products found
                </div>
              )}

              {!searchLoading && searchResults?.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSearchResultClick(product._id)}
                      className="w-full p-3 hover:bg-gray-50 text-left flex items-center gap-3 border-b last:border-b-0"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                        {product.productThumbnail && (
                          <Image
                            src={product.productThumbnail}
                            alt={product.productName}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.productName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          GHS {product.price.toFixed(2)} • {product.productCategory}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
      
    </section>
  );
}
