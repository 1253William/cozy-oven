"use client";

import { useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductQuickView from "./ProductQuickView";
import type { Product } from "../context/CartContext";
import useCustomerProducts from "../hooks/useCustomerProducts";
import 'react-loading-skeleton/dist/skeleton.css'


export default function Categories() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Fetch products from backend
  const { products: allProducts, loading } = useCustomerProducts({ limit: 100 });

  // Get unique categories dynamically from products
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    allProducts.forEach(product => {
      if (product.productCategory) {
        categoriesSet.add(product.productCategory);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [allProducts]);

  const [activeCategory, setActiveCategory] = useState<string>("");

  // Use first available category if active category is empty
  const effectiveActiveCategory = activeCategory || (availableCategories.length > 0 ? availableCategories[0] : "");

  // Filter products by category
  const getProductsByCategory = (category: string) => {
    return allProducts.filter(product => product.productCategory === category);
  };

  const currentProducts = effectiveActiveCategory ? getProductsByCategory(effectiveActiveCategory) : [];

  const handleQuickView = (product: typeof allProducts[0]) => {
    const productData: Product = {
      id: product._id,
      name: product.productName,
      price: `GHS ${product.price}`,
      image: product.productThumbnail,
      description: product.productDetails,
      sizes: product.selectOptions?.map(opt => opt.label) || [],
    };
    setQuickViewProduct(productData);
    setIsQuickViewOpen(true);
  };

  const handleCardClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <div
        ref={sectionRef}
        className="flex flex-col items-center justify-center min-h-screen font-[Euclid-Circular-B] mt-12"
        style={{ display: availableCategories.length === 0 ? "none" : "block" }}
      >
        <motion.div 
          className="w-full max-w-7xl px-4 md:py-8 "
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {/* Only show category tabs if there are categories with products */}
          {availableCategories.length > 0 && (
            <div className="flex md:gap-8 gap-4 mb-8 overflow-x-auto pb-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`md:text-3xl text-xl font-bold transition-colors relative whitespace-nowrap ${
                    effectiveActiveCategory === category
                      ? "text-[#2A2C22]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {category}
                  {effectiveActiveCategory === category && (
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#2A2C22] rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}

                </button> 
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2A2C22] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardVariants}
                  className="relative overflow-hidden rounded-4xl text-white h-[400px] sm:h-[450px] md:h-[500px] group"
                  onClick={() => handleCardClick(product._id)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110 z-0"
                    style={{ backgroundImage: `url(${product.productThumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-black/30 z-10" />

                  <div className="relative z-20 p-8 h-full flex flex-col">
                    <div className="mb-auto">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                        {product.productName}
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base md:text-lg font-extralight line-clamp-3">
                        {product.productDetails}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Button that slides up */}
                      <div className="flex-1 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <button 
                          className="font-medium py-3 px-7 rounded-full bg-black shadow-sm w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(product._id);
                          }}
                        >
                          View Product
                        </button>
                      </div>
                      {/* Search icon that slides in from right */}
                      <div className="opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        <button 
                          className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          aria-label="Quick view"
                        >
                          <Search className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && currentProducts.length === 0 && availableCategories.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in this category.</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Product Quick View Drawer */}
      <ProductQuickView 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={quickViewProduct}
      />
    </>
  );
}
