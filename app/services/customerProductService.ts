import apiClient from "./apiClient";
import { Product, PaginationInfo } from "./productService";

export interface CustomerProductListResponse {
  success: boolean;
  cached?: boolean;
  message: string;
  pagination: PaginationInfo;
  data: Product[];
}

export interface CustomerProductResponse {
  success: boolean;
  message: string;
  cached?: boolean;
  data: Product;
}

export interface SearchProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export const customerProductService = {
  // GET /api/v1/store/customer/products - Get all products for customers
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CustomerProductListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/api/v1/store/customer/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // GET /api/v1/store/customer/products/{productId} - Get single product by ID
  getProductById: async (productId: string): Promise<CustomerProductResponse> => {
    const response = await apiClient.get(`/api/v1/store/customer/products/${productId}`);
    return response.data;
  },

  // GET /api/v1/search/products - Search products by keyword
  searchProducts: async (query: string): Promise<SearchProductsResponse> => {
    const response = await apiClient.get(`/api/v1/search/products?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default customerProductService;
