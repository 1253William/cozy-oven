import apiClient from "./apiClient";

export interface SelectOption {
  variantId?: string;
  label: string;
  additionalPrice: number;
  isAvailable?: boolean;
  /** When false, size is for packages/production only — hidden on the storefront. */
  soldIndividually?: boolean;
}

export interface PackageOption {
  optionId?: string;
  componentType?: "product" | "supply";
  childProductId?: string;
  childVariantId?: string;
  supplyCostItemId?: string;
  label: string;
  description?: string;
  isAvailable?: boolean;
  sortOrder?: number;
  quantity?: number;
}

export interface PackageGroup {
  id?: string;
  label: string;
  type: "fixed" | "selection";
  requiredSelectionCount: number;
  allowRepeats?: boolean;
  options: PackageOption[];
  sortOrder?: number;
}

export interface PackageConfig {
  selectionLabel?: string;
  requiredSelectionCount: number;
  options: PackageOption[];
  groups?: PackageGroup[];
}

export interface Product {
  id: string;
  productName: string;
  price: number;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  productCategory: string;
  thumbnail: string;
  productDetails: string;
  selectOptions: SelectOption[];
  sku?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  productStatus?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  imageCount?: number;
  pagination?: number;
  productType?: "standard" | "package";
  packageConfig?: PackageConfig;
}

export interface CreateProductData {
  productName: string;
  price: number;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  productCategory: string;
  productThumbnail: string;
  productDetails: string;
  selectOptions: SelectOption[];
  productType?: "standard" | "package";
  packageConfig?: PackageConfig;
}

export interface UpdateProductData {
  productName?: string;
  productCategory?: string;
  productDetails?: string;
  price?: number;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  selectOptions?: SelectOption[];
  isAvailable?: boolean;
  productStatus?: string;
  productType?: "standard" | "package";
  packageConfig?: PackageConfig;
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

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "createdAt" | "price" | "rating" | "productName" | "stockQuantity";
  order?: "asc" | "desc";
}

// Normalizes product data from either API format to a consistent Product shape
// Admin API returns: id, thumbnail, images
// Customer API returns: _id, productThumbnail, productImages
export function normalizeProduct(raw: any): Product {
  return {
    ...raw,
    id: raw.id || raw._id,
    thumbnail: raw.thumbnail || raw.productThumbnail,
    images: raw.images || raw.productImages || [],
    imageCount: raw.imageCount ?? (raw.images || raw.productImages || []).length,
    selectOptions: (raw.selectOptions || []).map((option: SelectOption) => ({
      ...option,
      variantId: option.variantId || option.label,
      soldIndividually: option.soldIndividually !== false,
    })),
    productType: raw.productType || "standard",
    packageConfig: raw.packageConfig,
  };
}

export function normalizeProductList(rawList: any[]): Product[] {
  return rawList.map(normalizeProduct);
}

export const productService = {
  // GET /api/v1/dashboard/admin/products - Get all products with filtering, sorting, pagination
  getProducts: async (params?: ProductsQueryParams): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.order) queryParams.append("order", params.order);

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    const data = response.data;
    return {
      ...data,
      data: normalizeProductList(data.data),
    };
  },

  // GET /api/v1/dashboard/admin/products/{productId} - Get product by ID
  getProductById: async (productId: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/products/${productId}`);
    return response.data;
  },

  // POST /api/v1/dashboard/admin/products - Create new product
  createProduct: async (productData: CreateProductData): Promise<ProductResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/products", productData);
    return response.data;
  },

  // POST /api/v1/dashboard/admin/products with file upload - Create new product with image
  createProductWithImage: async (formData: FormData): Promise<ProductResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/products", formData);
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/products/{productId} - Update product
  updateProduct: async (
    productId: string,
    productData: UpdateProductData
  ): Promise<ProductResponse> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/products/${productId}`,
      productData
    );
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/products/{productId} with file upload - Update product with image
  updateProductWithImage: async (productId: string, formData: FormData): Promise<ProductResponse> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/products/${productId}`,
      formData
    );
    return response.data;
  },

  // DELETE /api/v1/dashboard/admin/products/{productId} - Delete product
  deleteProduct: async (productId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/products/${productId}`);
    return response.data;
  },
};

export default productService;
