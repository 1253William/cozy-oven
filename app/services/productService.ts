import apiClient from "./apiClient";

export interface SelectOption {
  label: string;
  additionalPrice: number;
}

export interface Product {
  _id: string;
  productName: string;
  price: number;
  productCategory: string;
  productThumbnail: string;
  productDetails: string;
  selectOptions: SelectOption[];
  sku?: string;
  stockQuantity?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  productName: string;
  price: number;
  productCategory: string;
  productThumbnail: string;
  productDetails: string;
  selectOptions: SelectOption[];
}

export interface UpdateProductData {
  productName?: string;
  productCategory?: string;
  productDetails?: string;
  price?: number;
  selectOptions?: SelectOption[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalDocuments: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductListResponse {
  success: boolean;
  cached?: boolean;
  pagination: PaginationInfo;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  cached?: boolean;
  data: Product;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: "createdAt" | "price" | "rating" | "productName" | "stockQuantity";
  order?: "asc" | "desc";
}

export const productService = {
  // GET /api/v1/dashboard/admin/products - Get all products with filtering, sorting, pagination
  getProducts: async (params?: ProductsQueryParams): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.order) queryParams.append("order", params.order);

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // GET /api/v1/dashboard/admin/products/{productId} - Get product by ID
  getProductById: async (productId: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/products/${productId}`);
    return response.data;
  },

  // POST /api/v1/dashboard/admin/products - Create new product
  createProduct: async (productData: CreateProductData): Promise<ProductResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/products", productData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // POST /api/v1/dashboard/admin/products with file upload - Create new product with image
  createProductWithImage: async (formData: FormData): Promise<ProductResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/products/{productId} - Update product
  updateProduct: async (
    productId: string,
    productData: UpdateProductData
  ): Promise<ProductResponse> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/products/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/products/{productId} with file upload - Update product with image
  updateProductWithImage: async (productId: string, formData: FormData): Promise<ProductResponse> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default productService;