import apiClient from "./apiClient";

// Inventory interfaces
export interface InventoryItem {
  _id: string;
  itemName: string;
  itemSKU: string;
  quantityPurchased: number;
  quantityRemaining: number;
  costPrice: number;
  sellingPrice?: number;
  totalCost: number;
  vendorName: string;
  vendorContact?: string;
  purchasePurpose?: string;
  itemCategory: string;
  itemStatus: "in stock" | "low stock" | "out of stock" | "damaged" | "missing" | "other";
  inventoryMonth?: string;
  inventoryYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryRequest {
  itemName: string;
  quantityPurchased: number;
  costPrice: number;
  vendorName: string;
  vendorContact: string;
  purchasePurpose: string;
  itemCategory: string;
}

export interface UpdateInventoryRequest {
  itemName?: string;
  itemQuantity?: number;
  itemPrice?: number;
  itemStatus?: "in stock" | "low stock" | "out of stock" | "damaged" | "missing" | "other";
  itemCategory?: string;
}

export interface GetInventoryResponse {
  success: boolean;
  message: string;
  total: number;
  page: number;
  data: InventoryItem[];
}

export interface GetInventoryItemResponse {
  success: boolean;
  data: InventoryItem;
}

export interface CreateInventoryResponse {
  success: boolean;
  message: string;
  data: InventoryItem;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: InventoryItem;
}

export const inventoryService = {
  // POST /api/v1/dashboard/admin/inventory - Create new inventory item
  createInventory: async (data: CreateInventoryRequest): Promise<CreateInventoryResponse> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/inventory", data);
    return response.data;
  },

  // GET /api/v1/dashboard/admin/inventory - Get all inventory items with filters
  getAllInventory: async (params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<GetInventoryResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  // GET /api/v1/dashboard/admin/inventory/{id} - Get inventory item details
  getInventoryItem: async (id: string): Promise<GetInventoryItemResponse> => {
    const response = await apiClient.get(`/api/v1/dashboard/admin/inventory/${id}`);
    return response.data;
  },

  // PUT /api/v1/dashboard/admin/inventory/{id} - Update inventory item
  updateInventory: async (id: string, data: UpdateInventoryRequest): Promise<ApiResponse> => {
    const response = await apiClient.put(`/api/v1/dashboard/admin/inventory/${id}`, data);
    return response.data;
  },

  // DELETE /api/v1/dashboard/admin/inventory/{id} - Delete inventory item
  deleteInventory: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/inventory/${id}`);
    return response.data;
  },
};

export default inventoryService;
