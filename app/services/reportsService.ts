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

export interface DiscountBreakdown {
  productSale: number;
  promotionCode: number;
  manual: number;
  total: number;
}

export interface PromotionCodePerformance {
  promotionId?: string;
  code: string;
  name: string;
  kind: "general" | "influencer";
  influencerName?: string;
  paidUses: number;
  uniqueCustomers: number;
  grossMerchandiseValue: number;
  discountGiven: number;
  netRevenue: number;
  averageOrderValue: number;
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
  discounts?: DiscountBreakdown;
  cogsCoverage?: {
    totalLines: number;
    linesWithCost: number;
    coveragePercent: number;
  };
  opexBreakdown?: Array<{ category: string; amount: number }>;
}

export interface CustomerSummary {
  total: number;
  new: number;
  returning: number;
}

export interface PeriodComparisonMetrics {
  month: string;
  year: number;
  revenue: number | null;
  expenses: number | null;
  profit: number | null;
  orders: number | null;
  averageOrderValue: number | null;
}

export interface ReportComparisons {
  previousMonth: PeriodComparisonMetrics;
  sameMonthLastYear: PeriodComparisonMetrics;
}

export interface DataQuality {
  warnings: string[];
  cogsCoverage?: {
    totalLines: number;
    linesWithCost: number;
    coveragePercent: number;
  };
}

export interface TopProductByMargin {
  _id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  cogs: number;
  margin: number;
  marginPercent: number;
}

export interface MonthPace {
  elapsedDays: number;
  daysInMonth: number;
  projectedRevenue: number;
  projectedOrders: number;
}

export interface TopCustomer {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
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
  comparisons?: ReportComparisons;
  customerSummary?: CustomerSummary;
  customers?: CustomerSummary & { top?: TopCustomer[] };
  dataQuality?: DataQuality;
  topProductsByMargin?: TopProductByMargin[];
  pace?: MonthPace;
  dailySales?: DailySale[];
  weeklySales?: WeeklySale[];
  byPaymentMethod?: PaymentMethodBreakdown[];
  byChannel?: ChannelBreakdown[];
  discounts?: DiscountBreakdown;
  promotionCodes?: PromotionCodePerformance[];
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
