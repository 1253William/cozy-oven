import { useState, useEffect, useCallback } from "react";
import customerProductService from "../services/customerProductService";
import { Product } from "../services/productService";

interface UseCustomerProductsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useCustomerProducts = (options: UseCustomerProductsOptions = {}) => {
  const { page = 1, limit = 20, autoFetch = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalDocuments: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerProductService.getAllProducts({ page, limit });
      setProducts(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error("Error fetching customer products:", err);
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
};

export default useCustomerProducts;
