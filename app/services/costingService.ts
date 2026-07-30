import { apiClient } from "./apiClient";

export type CostCategory = { _id: string; name: string; costClass: "directProductCost" | "operatingExpense"; subtype: string };
export type CostItem = {
  _id: string;
  name: string;
  categoryId: CostCategory | string;
  unitType: "weight" | "volume" | "count" | "time" | "batch";
  unit: "kg" | "g" | "L" | "ml" | "piece" | "hour" | "minute" | "batch";
  costPerUnit: number;
  purchaseBatch: { quantity: number; cost: number };
  supplier?: string;
  tracksStock?: boolean;
  openingStock?: number;
  lastUpdated: string;
};

export const costingService = {
  categories: async (costClass?: string) => (await apiClient.get("/api/v1/dashboard/admin/cost-categories", { params: costClass ? { costClass } : undefined })).data,
  createCategory: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/cost-categories", data)).data,
  items: async (params?: Record<string, unknown>) => (await apiClient.get("/api/v1/dashboard/admin/cost-items", { params })).data,
  createItem: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/cost-items", data)).data,
  updateItem: async (id: string, data: Record<string, unknown>) => (await apiClient.patch(`/api/v1/dashboard/admin/cost-items/${id}`, data)).data,
  archiveItem: async (id: string) => (await apiClient.delete(`/api/v1/dashboard/admin/cost-items/${id}`)).data,
  itemHistory: async (id: string) => (await apiClient.get(`/api/v1/dashboard/admin/cost-items/${id}/history`)).data,
  recipes: async () => (await apiClient.get("/api/v1/dashboard/admin/recipes")).data,
  createRecipe: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/recipes", data)).data,
  updateRecipe: async (id: string, data: Record<string, unknown>) => (await apiClient.patch(`/api/v1/dashboard/admin/recipes/${id}`, data)).data,
  archiveRecipe: async (id: string) => (await apiClient.delete(`/api/v1/dashboard/admin/recipes/${id}`)).data,
};
