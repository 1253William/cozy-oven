"use client";

import { useState, useEffect } from "react";
import customerProductService from "../services/customerProductService";

export default function useCustomerProduct(productId: string | undefined) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const data = await customerProductService.getProductById(productId);
        setProduct(data.data); // depends on your response shape
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading };
}
