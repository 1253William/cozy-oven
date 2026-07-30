import { apiClient } from "./apiClient";

export const operationsService = {
  stock: async () => (await apiClient.get("/api/v1/dashboard/admin/operations/stock")).data,
  movements: async () => (await apiClient.get("/api/v1/dashboard/admin/operations/movements")).data,
  openingBalance: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/operations/opening-balance", data)).data,
  production: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/operations/production", data)).data,
  adjustment: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/operations/adjustments", data)).data,
  count: async (data: Record<string, unknown>) => (await apiClient.post("/api/v1/dashboard/admin/operations/counts", data)).data,
  reviews: async (limit = 20) => (await apiClient.get("/api/v1/dashboard/admin/operations/counts", { params: { limit } })).data,
};
