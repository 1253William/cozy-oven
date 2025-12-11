"use client";

import { useState, useEffect } from "react";
import customerProductService from "../services/customerProductService";
import { Product } from "../services/productService";

export default function useCustomerProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
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
