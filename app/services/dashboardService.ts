import apiClient from "./apiClient";

// Dashboard overview interfaces
export interface DailyStats {
  sales: number;
  orders: number;
}

export interface MonthlyStats {
  sales: number;
  orders: number;
}

export interface PopularProduct {
  name: string;
  productId: string;
  quantitySold: number;
  revenue: number;
  productThumbnail: string;
}

export interface DashboardOverview {
  dailyStats: DailyStats;
  monthlyStats: MonthlyStats;
  popularProductThisWeek: PopularProduct;
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

// Popular products interfaces
export interface PopularProductItem {
  _id: string;
  productName: string;
  productThumbnail: string;
  price: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface PopularProductsResponse {
  success: boolean;
  message: string;
  data: PopularProductItem[];
}

// Sales overview interfaces
export interface SalesDataPoint {
  date?: string;
  month?: string;
  sales: number;
  orders: number;
}

export interface SalesOverviewResponse {
  success: boolean;
  message: string;
  data: SalesDataPoint[];
}

export const dashboardService = {
  // GET /api/v1/dashboard/overview - Get dashboard statistics
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/overview");
    return response.data;
  },

  // GET /api/v1/dashboard/admin/products?popular=true - Get popular products
  getPopularProducts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PopularProductsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("popular", "true");
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/api/v1/dashboard/admin/products?${queryParams.toString()}`
    );
    return response.data;
  },

  // GET /api/v1/dashboard/overview/sales - Get sales overview
  getSalesOverview: async (params?: {
    daily?: boolean;
    monthly?: boolean;
  }): Promise<SalesOverviewResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.daily) queryParams.append("daily", "true");
    if (params?.monthly) queryParams.append("monthly", "true");

    const queryString = queryParams.toString();
    const response = await apiClient.get(
      `/api/v1/dashboard/overview/sales${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default dashboardService;
