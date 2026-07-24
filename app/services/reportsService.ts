import apiClient from "./apiClient";

export interface FinanceComparison {
  previousMonth: string;
  previousYear: number;
  previousRevenue: number;
  previousExpenses: number;
  previousProfit: number;
  previousOrderCount: number;
  revenueChangePercent: number | null;
  expensesChangePercent: number | null;
  profitChangePercent: number | null;
  ordersChangePercent: number | null;
}

export interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

export interface WeeklySale {
  week: number;
  label: string;
  revenue: number;
  orders: number;
}

export interface FulfillmentStats {
  delivery: { orders: number; revenue: number };
  pickup: { orders: number; revenue: number };
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: string;
  orders: number;
  revenue: number;
}

export interface ChannelBreakdown {
  channel: string;
  orders: number;
  revenue: number;
}

export interface ReviewsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  public: number;
  order: number;
  averageApprovedRating: number | null;
}

export interface PnLBlock {
  grossSales: number;
  transactionFees: number;
  refundedAmount: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  inventoryPurchases: number;
  operatingExpenses: number;
  totalOpex: number;
  netProfit: number;
  netMarginPercent: number;
  netMargin: string;
  promoDiscounts?: number;
  cogsCoverage?: {
    totalLines: number;
    linesWithCost: number;
    coveragePercent: number;
  };
  opexBreakdown?: Array<{ category: string; amount: number }>;
}

export interface FinanceSummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: string;
  profitMarginPercent?: number;
  profitMarginExplanation?: string;
  orderCount?: number;
  averageOrderValue?: number;
  comparison?: FinanceComparison;
  dailySales?: DailySale[];
  weeklySales?: WeeklySale[];
  byPaymentMethod?: PaymentMethodBreakdown[];
  byChannel?: ChannelBreakdown[];
  fees?: {
    transactionFees: number;
    grossSales: number;
    netAfterFees: number;
  };
  pnl?: PnLBlock;
  reviews?: ReviewsSummary;
  fulfillment?: FulfillmentStats;
  statusBreakdown?: StatusBreakdownItem[];
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

const periodQuery = (month: string, year: number) =>
  `month=${encodeURIComponent(month)}&year=${encodeURIComponent(String(year))}`;

export const reportsService = {
  getFinanceSummary: async (month: string, year: number): Promise<FinanceSummaryResponse> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/finance-summary?${periodQuery(month, year)}`
    );
    return response.data;
  },

  getSalesByCategory: async (month: string, year: number): Promise<SalesByCategoryResponse> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/sales-by-category?${periodQuery(month, year)}`
    );
    return response.data;
  },

  getTopSellingProducts: async (
    month: string,
    year: number
  ): Promise<TopSellingProductsResponse> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/top-selling-products?${periodQuery(month, year)}`
    );
    return response.data;
  },

  getTopCustomers: async (
    page: number = 1,
    limit: number = 5,
    month?: string,
    year?: number
  ): Promise<TopCustomersResponse> => {
    const period = month && year ? `&${periodQuery(month, year)}` : "";
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/top-customers?page=${page}&limit=${limit}${period}`
    );
    return response.data;
  },

  exportMonthlyReport: async (month: string, year: number): Promise<Blob> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/export?${periodQuery(month, year)}`,
      { responseType: "blob" }
    );
    return response.data;
  },

  exportMonthlyReportPdf: async (month: string, year: number): Promise<Blob> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/reports/export.pdf?${periodQuery(month, year)}`,
      { responseType: "blob" }
    );
    return response.data;
  },
};

export default reportsService;
