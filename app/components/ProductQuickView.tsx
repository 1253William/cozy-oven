"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import type { Product } from "../context/CartContext";

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductQuickView({ isOpen, onClose, product }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Check if this is a minis/mini/flightbox product
  const isMiniCategory = (category?: string) => {
    if (!category) return false;
    const lower = category.toLowerCase();
    return lower === "minis" || lower === "mini" || lower === "flightbox";
  };
  const isMinisProduct = isMiniCategory(product?.category);
  const minQuantity = isMinisProduct ? 4 : 1;
  
  // Derive the initial size from the product
  const defaultSize = useMemo(() => {
    return product?.sizes?.[0] || "Regular";
  }, [product?.sizes]);
  
  const [selectedSize, setSelectedSize] = useState(defaultSize);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Update selected size when product changes
      if (product?.sizes?.[0]) {
        setSelectedSize(product.sizes[0]);
      }
      // Set minimum quantity for minis
      if (isMinisProduct) {
        setQuantity(prev => Math.max(prev, 4));
      } else {
        setQuantity(1);
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMinisProduct]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    // Reset quantity after adding to cart
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(minQuantity, prev - 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white z-50 shadow-2xl flex flex-col rounded-l-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Quick View</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close quick view"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Product Image */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100 mb-6">
                <Image
                  src={product.image || ""}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Name */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {product.name}
                </h3>
                {product.isAvailable === false && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-3xl font-bold text-[#2A2C22] mb-4">
                {product.price}
              </p>

              {/* Description */}
              {product.description && (
                <p className="text-gray-700 mb-6">{product.description}</p>
              )}

              {/* What's in the box */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">What&apos;s in the box</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>1x {product.name}</li>
                  <li>Premium packaging</li>
                  <li>Care instructions card</li>
                </ul>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                <p className="text-gray-700 text-sm">
                  Premium flour, organic eggs, butter, sugar, vanilla extract, 
                  baking powder, salt, and natural flavors.
                </p>
              </div>

              {/* Allergens */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Allergen Information</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Contains: Wheat
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Contains: Eggs
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Contains: Dairy
                  </span>
                </div>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Size
                  </label>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-full border-2 font-medium transition-colors ${
                          selectedSize === size
                            ? "border-[#2A2C22] bg-[#2A2C22] text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="border-t border-gray-200 p-6 bg-white">
              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-4">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-300 rounded-full">
                  <button
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-gray-100 transition rounded-full"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-gray-100 rounded-full transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.isAvailable === false}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-full transition-colors ${
                    product.isAvailable === false
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#bd6325] hover:bg-[#a8551f] text-white hover:cursor-pointer"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.isAvailable === false ? "Sold Out" : "Add to Cart"}
                </button>
              </div>

              {/* Minimum order note for minis */}
              {isMinisProduct && (
                <p className="text-sm text-orange-600 font-medium mb-4">
                  Minimum order: 4 pieces
                </p>
              )}

              {/* View Full Details Link */}
              <Link href={`/product/${product.id}`} onClick={onClose}>
                <button className="w-full border-2 border-[#bd6325] text-[#bd6325] font-semibold py-3 rounded-full hover:bg-[#bd6325] hover:text-white transition-colors hover:cursor-pointer">
                  View Full Details
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
