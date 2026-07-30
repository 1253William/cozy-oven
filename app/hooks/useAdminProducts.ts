import { useState, useEffect, useCallback } from "react";
import productService, { Product, ProductsQueryParams } from "../services/productService";

export const useAdminProducts = (params?: ProductsQueryParams) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalDocuments: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(params);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params?.category, params?.search, params?.sortBy, params?.order]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
};

export default useAdminProducts;
