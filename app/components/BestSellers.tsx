"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import useCustomerProducts from "../hooks/useCustomerProducts";

export default function BestSellers() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { products, loading } = useCustomerProducts({ limit: 6 });

  return (
    <section ref={sectionRef} className="py-20 bg-[#2A2C22]/10">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-600 mb-2">
              What&apos;s Popular Now
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Best Sellers
            </h2>
            <p className="text-lg text-gray-700">
              Shop our most loved products.
            </p>
          </div>

          <div className="lg:w-2/3 w-full">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A2C22]"></div>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={`/product/${product._id}`}
                      className="relative flex-shrink-0 w-72 h-80 rounded-3xl overflow-hidden cursor-pointer group snap-start transition-transform duration-300 hover:scale-105 block"
                    >
                      {/* Product Image */}
                      <Image
                        src={product.productThumbnail || "/placeholder.svg"}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="text-white text-2xl font-bold mb-2">
                              {product.productName}
                            </h3>
                            <p className="text-white/80 text-sm font-medium">
                              GHS {product.price.toFixed(2)}
                            </p>
                          </div>
                          {/* Arrow icon */}
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
