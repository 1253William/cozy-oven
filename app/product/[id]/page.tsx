"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuantitySelector from "../../components/QuantitySelector";
import SizeSelector from "../../components/SizeSelector";
import ProductTabs from "../../components/ProductTabs";

import { useCart } from "../../context/CartContext";
import useCustomerProduct from "../../hooks/useProductDetails";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const { product, loading } = useCustomerProduct(id as string);

  // Check if this is a minis/mini/flightbox product
  const isMiniCategory = (category?: string) => {
    if (!category) return false;
    const lower = category.toLowerCase();
    return lower === "minis" || lower === "mini" || lower === "flightbox";
  };
  const isMinisProduct = isMiniCategory(product?.productCategory);
  const minQuantity = isMinisProduct ? 4 : 1;
  
  // Filter to only show available options
  const availableOptions = product?.selectOptions?.filter(opt => opt.isAvailable !== false) ?? [];
  const sizes = availableOptions.map(opt => opt.label) ?? ["Regular"];

  // A product is "sold out" if it has variants and ALL variants are unavailable
  const hasVariants = (product?.selectOptions?.length ?? 0) > 0;
  const isSoldOut = hasVariants && availableOptions.length === 0;
  
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableOptions?.[0]?.label ?? null
  );

  // Update selectedSize and quantity when product loads
  useEffect(() => {
    if (product && availableOptions.length > 0) {
      const firstAvailable = availableOptions[0]?.label;
      if (firstAvailable && (!selectedSize || !availableOptions.find(opt => opt.label === selectedSize))) {
        setSelectedSize(firstAvailable);
      }
    }
    // Set minimum quantity for minis
    if (product && isMiniCategory(product.productCategory)) {
      setQuantity(prev => Math.max(prev, 4));
    }
  }, [product, availableOptions]);

  // ✅ FINAL PRICE = size price (not base + size)
  const currentPrice = (() => {
    if (!product) return 0;

    const option = availableOptions.find(
      opt => opt.label === selectedSize
    );

    return option?.additionalPrice ?? product.price;
  })();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bd6325]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <button
              onClick={() => router.push("/")}
              className="text-orange-500"
            >
              Return to home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  const handleAddToCart = () => {
    addToCart(
      {
        id: product._id,
        name: product.productName,
        price: `GHS ${currentPrice.toFixed(2)}`,
        image: product.productThumbnail,
        description: product.productDetails,
        rating: product.rating || 4.5,
        reviews: 0,
        sizes,
        details: product.productDetails
      },
      quantity,
      selectedSize ?? undefined
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-12">

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.productThumbnail}
                alt={product.productName}
                fill
                className="object-cover"
                priority
              />
              {/* Sold Out Badge */}
              {isSoldOut && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10">
                  Sold Out
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">
                  {product.productName}
                </h1>
                {isSoldOut && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sold Out
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-3xl font-bold text-orange-500 mb-6">
                GHS {currentPrice.toFixed(2)}
              </p>

              <p className="text-gray-700 mb-6">
                {product.productDetails}
              </p>

              {!isSoldOut && (
                <>
                  <div className="mb-6">
                    <label className="block font-semibold mb-2">Size</label>
                    <SizeSelector
                      sizes={sizes}
                      selectedSize={selectedSize}
                      onSizeChange={setSelectedSize}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block font-semibold mb-2">Quantity</label>
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      min={minQuantity}
                    />
                    {isMinisProduct && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        Minimum order: 4 pieces
                      </p>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-full w-full transition-all ${
                  isSoldOut
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#bd6325] text-white hover:bg-[#a8551f]"
                }`}
              >
                <ShoppingCart className="w-6 h-6" />
                {isSoldOut ? "Sold Out" : "Add to Cart"}
              </button>
            </div>
          </div>

          <div className="mt-16">
            <ProductTabs details={product.productDetails} />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
