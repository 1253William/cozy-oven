"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image?: string;
  sizes?: string[];
}

// Mock data - replace with API call
const mockWishlist: WishlistItem[] = [
  // {
  //   id: "1",
  //   name: "Classic Banana Bread",
  //   price: "GHS 45.00",
  //   sizes: ["Small", "Medium", "Large"],
  // },
];

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlist] = useState<WishlistItem[]>(mockWishlist);
  const hasItems = wishlist.length > 0;

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      selectedSize: item.sizes?.[0] || "",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">Save your favorite items for later</p>
      </div>

      {!hasItems ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <Heart className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Start adding items to your wishlist and they&apos;ll appear here!
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-full hover:bg-[#1a1c12] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        // Wishlist grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Product Image Placeholder */}
              <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-300" />
              </div>

              {/* Product Info */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-xl font-bold text-[#2A2C22] mb-4">
                {item.price}
              </p>

              {/* Sizes */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Available sizes:</p>
                  <div className="flex gap-2">
                    {item.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2C22] text-white font-semibold rounded-lg hover:bg-[#1a1c12] transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
