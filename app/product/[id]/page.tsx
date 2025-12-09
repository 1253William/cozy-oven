"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuantitySelector from "../../components/QuantitySelector";
import SizeSelector from "../../components/SizeSelector";
import ProductTabs from "../../components/ProductTabs";
import { useCart } from "../../context/CartContext";
import useCustomerProduct from "../../hooks/useProductDetails";

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");

  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const tabsRef = useRef(null);
  const isImageInView = useInView(imageRef, { once: true, amount: 0.3 });
  const isDetailsInView = useInView(detailsRef, { once: true, amount: 0.3 });
  const isTabsInView = useInView(tabsRef, { once: true, amount: 0.3 });

  const productId = params.id as string;
  const { product, loading } = useCustomerProduct(productId);

  // Constants for fallback values
  const DEFAULT_RATING = 4.5;
  const DEFAULT_REVIEWS_COUNT = 0;
  const DEFAULT_SIZES = ["Regular"];

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A2C22]"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Product not found
  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Product not found</h1>
                <button
                  onClick={() => router.push("/")}
                  className="text-orange-500 hover:text-orange-600"
                >
                  Return to home
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const handleAddToCart = () => {
    // Map backend product to cart item format
    const cartItem = {
      id: product._id,
      name: product.productName,
      price: `GHS ${product.price.toFixed(2)}`,
      image: product.productThumbnail,
      description: product.productDetails || "",
      rating: product.rating || DEFAULT_RATING,
      reviews: DEFAULT_REVIEWS_COUNT,
      sizes: product.selectOptions?.map((opt: { label: string }) => opt.label) || DEFAULT_SIZES,
      details: product.productDetails || "",
    };
    addToCart(cartItem, quantity, selectedSize);
  };

  // Extract sizes from selectOptions
  const sizes = product.selectOptions?.map((opt: { label: string }) => opt.label) || DEFAULT_SIZES;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
        
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              ref={imageRef}
  

              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <Image src={product.productThumbnail} alt={product.productName} fill className="object-cover" priority />
            </motion.div>

            <motion.div
              ref={detailsRef}
 
              className="flex flex-col"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.productName}</h1>

              <div className="mb-4">{renderStars(product.rating || DEFAULT_RATING)}</div>

              <p className="text-3xl font-bold text-orange-500 mb-6">GHS {product.price.toFixed(2)}</p>

              <p className="text-gray-700 mb-6">{product.productDetails}</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Size</label>
                <SizeSelector sizes={sizes} selectedSize={selectedSize} onSizeChange={setSelectedSize} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </div>

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold text-lg py-4 px-8 rounded-full transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
            </motion.div>
          </div>

          <motion.div
            ref={tabsRef}

            className="mt-16"
          >
            <ProductTabs details={product.productDetails || ""} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

