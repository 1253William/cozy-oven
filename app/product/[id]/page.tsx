"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuantitySelector from "../../components/QuantitySelector";
import SizeSelector from "../../components/SizeSelector";
import ProductTabs from "../../components/ProductTabs";
import { useCart } from "../../context/CartContext";

// Product data (in a real app, this would come from an API or database)
const products = [
  {
    id: "1",
    name: "Classic Banana Bread",
    price: "GHS 25",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.5,
    reviews: 120,
    description: "Moist and delicious banana bread made with ripe bananas and a hint of vanilla.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our classic banana bread is baked fresh daily using only the finest ingredients. Made with ripe bananas, premium flour, and a touch of cinnamon for that perfect flavor."
  },
  {
    id: "2",
    name: "Chocolate Chip Banana Bread",
    price: "GHS 30",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.8,
    reviews: 95,
    description: "Rich banana bread studded with premium chocolate chips.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Indulge in our chocolate chip banana bread, featuring generous amounts of Belgian chocolate chips mixed into our classic banana bread recipe."
  },
  {
    id: "3",
    name: "Walnut Banana Bread",
    price: "GHS 28",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.6,
    reviews: 78,
    description: "Banana bread with crunchy walnuts for added texture.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our walnut banana bread combines the moistness of banana bread with the crunch of fresh California walnuts, creating a perfect balance of texture and flavor."
  },
  {
    id: "4",
    name: "Blueberry Muffins",
    price: "GHS 20",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.7,
    reviews: 145,
    description: "Fluffy muffins bursting with fresh blueberries.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our blueberry muffins are made with fresh, plump blueberries and have a tender, moist crumb that melts in your mouth."
  },
  {
    id: "5",
    name: "Cinnamon Rolls",
    price: "GHS 35",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.9,
    reviews: 203,
    description: "Warm, gooey cinnamon rolls with cream cheese frosting.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our signature cinnamon rolls are hand-rolled and baked to perfection, topped with our house-made cream cheese frosting."
  },
  {
    id: "6",
    name: "Sourdough Loaf",
    price: "GHS 22",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.8,
    reviews: 167,
    description: "Artisan sourdough bread with a crispy crust and chewy interior.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our sourdough is made with a natural starter that's been cultivated for years, resulting in a complex flavor and perfect texture."
  },
];

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");

  const productId = params.id as string;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          {rating} ({product.reviews} reviews)
        </span>
      </div>
    );
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    // Optional: Show a success message or navigate
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Product details grid */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Right: Product info */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mb-4">{renderStars(product.rating)}</div>

              {/* Price */}
              <p className="text-3xl font-bold text-orange-500 mb-6">
                {product.price}
              </p>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Size selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Size
                </label>
                <SizeSelector
                  sizes={product.sizes || []}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                />
              </div>

              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantity
                </label>
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold text-lg py-4 px-8 rounded-lg transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Tabs section */}
          <div className="mt-16">
            <ProductTabs details={product.details || ""} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
