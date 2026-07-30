"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCart } from "./CartContext";
import promotionService, {
  type PromotionQuote,
} from "../services/promotionService";
import type { OrderItem } from "../services/orderService";

const STORAGE_KEY = "cozy-oven-promotion";

interface PromotionContextValue {
  quote: PromotionQuote | null;
  isValidating: boolean;
  error: string | null;
  applyCode: (code: string) => Promise<boolean>;
  removeCode: () => void;
  revalidate: () => Promise<boolean>;
}

const PromotionContext = createContext<PromotionContextValue | undefined>(undefined);

const cartItemsForQuote = (
  cart: ReturnType<typeof useCart>["cart"]
): OrderItem[] =>
  cart.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    unitPrice: Number(item.price.replace("GHS ", "")),
    ...(item.selectedSize ? { size: item.selectedSize } : {}),
    ...(item.packageSelections?.length
      ? { packageSelections: item.packageSelections }
      : {}),
  }));

export function PromotionProvider({ children }: { children: ReactNode }) {
  const { cart } = useCart();
  const [quote, setQuote] = useState<PromotionQuote | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restored = useRef(false);

  const validateCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code.trim() || cart.length === 0) return false;
      setIsValidating(true);
      setError(null);
      try {
        const nextQuote = await promotionService.validate(
          code.trim(),
          cartItemsForQuote(cart)
        );
        setQuote(nextQuote);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ code: nextQuote.promotion.code })
        );
        return true;
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "This promotion code could not be applied";
        setQuote(null);
        setError(message);
        localStorage.removeItem(STORAGE_KEY);
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [cart]
  );

  const removeCode = useCallback(() => {
    setQuote(null);
    setError(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (restored.current || typeof window === "undefined" || cart.length === 0) {
      return;
    }
    restored.current = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.code) void validateCode(saved.code);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cart.length, validateCode]);

  const cartSignature = useMemo(
    () =>
      JSON.stringify(
        cart.map((item) => [
          item.id,
          item.quantity,
          item.selectedSize,
          item.packageSelections,
        ])
      ),
    [cart]
  );

  useEffect(() => {
    if (cart.length === 0) {
      removeCode();
      return;
    }
    if (!quote?.promotion.code) return;

    const timer = window.setTimeout(() => {
      void validateCode(quote.promotion.code);
    }, 400);
    return () => window.clearTimeout(timer);
    // cartSignature intentionally captures product/quantity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature]);

  const value = useMemo(
    () => ({
      quote,
      isValidating,
      error,
      applyCode: validateCode,
      removeCode,
      revalidate: () =>
        quote?.promotion.code
          ? validateCode(quote.promotion.code)
          : Promise.resolve(true),
    }),
    [error, isValidating, quote, removeCode, validateCode]
  );

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotion() {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error("usePromotion must be used within a PromotionProvider");
  }
  return context;
}
