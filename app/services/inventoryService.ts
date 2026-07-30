import apiClient from "./apiClient";

export interface InventoryItem {
  _id: string;
  itemName: string;
  itemSKU: string;
  quantityPurchased: number;
  costPrice: number;
  totalCost: number;
  vendorName: string;
  vendorContact?: string;
  purchasePurpose?: string;
  itemCategory: string;
  purchasedAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  costItemId?: string;
  createdAt?: string;
}

export interface PurchaseInput {
  itemName: string;
  quantityPurchased: number;
  costPrice: number;
  vendorName: string;
  vendorContact?: string;
  purchasePurpose: string;
  itemCategory: string;
  purchasedAt: string;
  paymentMethod?: string;
  paymentReference?: string;
  costItemId?: string;
}

export const inventoryService = {
  createInventory: async (data: PurchaseInput) =>
    (await apiClient.post("/api/v1/dashboard/admin/inventory", data)).data,
  getAllInventory: async (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    (await apiClient.get("/api/v1/dashboard/admin/inventory", { params })).data,
  getInventoryItem: async (id: string) =>
    (await apiClient.get(`/api/v1/dashboard/admin/inventory/${id}`)).data,
  updateInventory: async (id: string, data: Partial<PurchaseInput>) =>
    (await apiClient.put(`/api/v1/dashboard/admin/inventory/${id}`, data)).data,
  deleteInventory: async (id: string) =>
    (await apiClient.delete(`/api/v1/dashboard/admin/inventory/${id}`)).data,
};

export default inventoryService;
