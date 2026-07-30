import { apiClient } from "./apiClient";

export type CostCategory = { _id: string; name: string; costClass: "directProductCost" | "operatingExpense"; subtype: string };
export type CostItem = { _id: string; name: string; categoryId: CostCategory | string; unitType: string; unit: string; costPerUnit: number; purchaseBatch: { quantity: number; totalCost: number } };

export const costingService = {
  categories: async (costClass?: string) => (await apiClient.get("/api/v1/dashboard/admin/cost-categories", { params: costClass ? { costClass } : undefined })).data,
  createCategory: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/cost-categories", data)).data,
  items: async () => (await apiClient.get("/api/v1/dashboard/admin/cost-items")).data,
  createItem: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/cost-items", data)).data,
  recipes: async () => (await apiClient.get("/api/v1/dashboard/admin/recipes")).data,
  createRecipe: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/recipes", data)).data,
};
