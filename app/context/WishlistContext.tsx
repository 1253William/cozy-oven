"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CartItem } from "./CartContext";

interface WishlistContextType {
  wishlist: CartItem[];
  addToWishlist: (item: CartItem) => void;
  removeFromWishlist: (productId: string, size?: string) => void;
  clearWishlist: () => void;
  moveToCart: (productId: string, size?: string) => CartItem | null;
  isInWishlist: (productId: string, size?: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<CartItem[]>(() => {
    // Load from localStorage initially
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Error parsing wishlist from localStorage:", error);
          // Clear corrupted data
          localStorage.removeItem("wishlist");
          return [];
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const addToWishlist = (item: CartItem) => {
    setWishlist((prevWishlist) => {
      const existingItemIndex = prevWishlist.findIndex(
        (i) => i.id === item.id && i.selectedSize === item.selectedSize
      );

      if (existingItemIndex > -1) {
        // Item already in wishlist, don't add duplicate
        return prevWishlist;
      }

      return [...prevWishlist, item];
    });
  };

  const removeFromWishlist = (productId: string, size?: string) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter(
        (item) => !(item.id === productId && (!size || item.selectedSize === size))
      )
    );
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const moveToCart = (productId: string, size?: string): CartItem | null => {
    const item = wishlist.find(
      (i) => i.id === productId && (!size || i.selectedSize === size)
    );
    
    if (item) {
      removeFromWishlist(productId, size);
      return item;
    }
    
    return null;
  };

  const isInWishlist = (productId: string, size?: string): boolean => {
    return wishlist.some(
      (item) => item.id === productId && (!size || item.selectedSize === size)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        moveToCart,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
