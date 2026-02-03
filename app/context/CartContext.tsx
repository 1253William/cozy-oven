"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  sizes?: string[];
  details?: string;
  isAvailable?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  moveAllToWishlist: () => CartItem[];
  getCartCount: () => number;
  getCartTotal: () => number;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load from localStorage initially
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Clear toast message after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addToCart = (product: Product, quantity: number = 1, size?: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        setToastMessage("Item quantity updated in cart!");
        return updatedCart;
      }

      setToastMessage("Item added to cart!");
      return [...prevCart, { ...product, quantity, selectedSize: size }];
    });
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCart((prevCart) => 
      prevCart.filter((item) => !(item.id === productId && (!size || item.selectedSize === size)))
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && (!size || item.selectedSize === size) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const moveAllToWishlist = (): CartItem[] => {
    const currentCart = [...cart];
    setCart([]);
    return currentCart;
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace("GHS ", ""));
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        moveAllToWishlist,
        getCartCount,
        getCartTotal,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
