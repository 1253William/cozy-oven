import apiClient from "./apiClient";

// Reports interfaces
export interface FinanceSummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: string;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
  percentage: number;
}

export interface TopSellingProduct {
  _id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomer {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

export interface FinanceSummaryResponse {
  success: boolean;
  data: FinanceSummary;
}

export interface SalesByCategoryResponse {
  success: boolean;
  message: string;
  data: SalesByCategory[];
}

export interface TopSellingProductsResponse {
  success: boolean;
  message: string;
  data: TopSellingProduct[];
}

export interface TopCustomersResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TopCustomer[];
}

export const reportsService = {
  // GET /api/v1/dashboard/admin/reports/finance-summary - Get finance summary for a month
  getFinanceSummary: async (month: string, year: number): Promise<FinanceSummaryResponse> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/finance-summary?month=${month}&year=${year}`
    );
    return response.data;
  },

  // GET /api/v1/dashboard/admin/reports/sales-by-category - Get sales by category
  getSalesByCategory: async (): Promise<SalesByCategoryResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/admin/reports/sales-by-category");
    return response.data;
  },

  // GET /api/v1/dashboard/admin/reports/top-selling-products - Get top selling products
  getTopSellingProducts: async (): Promise<TopSellingProductsResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/admin/reports/top-selling-products");
    return response.data;
  },

  // GET /api/v1/dashboard/admin/reports/top-customers - Get top customers with pagination
  getTopCustomers: async (page: number = 1, limit: number = 5): Promise<TopCustomersResponse> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/top-customers?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};

export default reportsService;
