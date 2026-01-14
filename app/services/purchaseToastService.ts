import apiClient from "./apiClient";

export interface PurchaseData {
  customerName: string;
  productName: string;
  thumbnail: string;
  purchasedAt: string;
}

export interface CustomersResponse {
  success: boolean;
  data: PurchaseData[];
}

export const purchaseToastService = {
  // GET /api/v1/dashboard/customers - Fetch all paid orders
  getRecentPurchases: async (): Promise<PurchaseData[]> => {
    try {
      const response = await apiClient.get<CustomersResponse>("/api/v1/dashboard/customers");
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching recent purchases:", error);
      return [];
    }
  },
};

export default purchaseToastService;

