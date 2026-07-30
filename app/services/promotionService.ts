import apiClient from "./apiClient";
import type { OrderItem } from "./orderService";

export type PromotionKind = "general" | "influencer";
export type PromotionDiscountType = "percentage" | "fixed";
export type PromotionStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired"
  | "archived";

export interface PromotionStats {
  paidUses: number;
  pendingApplications: number;
  uniqueCustomers: number;
  grossMerchandiseValue: number;
  discountGiven: number;
  netRevenue: number;
  averageOrderValue: number;
}

export interface Promotion {
  _id: string;
  code: string;
  name: string;
  kind: PromotionKind;
  influencerName?: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  maximumDiscountAmount?: number | null;
  minimumSubtotal: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  archivedAt?: string | null;
  status: PromotionStatus;
  stats: PromotionStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionInput {
  code: string;
  name: string;
  kind: PromotionKind;
  influencerName?: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  maximumDiscountAmount?: number | null;
  minimumSubtotal?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface PromotionQuote {
  promotion: {
    code: string;
    name: string;
    kind: PromotionKind;
    influencerName?: string;
  };
  pricing: {
    subtotal: number;
    codeDiscountAmount: number;
    totalAfterCode: number;
  };
}

export interface PromotionApplicationOrder {
  orderId: string;
  customer: string;
  contact: string;
  paymentStatus: string;
  date: string;
  subtotal: number;
  codeDiscountAmount: number;
  totalAmount: number;
  channel: string;
}

export const promotionService = {
  validate: async (discountCode: string, items: OrderItem[]): Promise<PromotionQuote> => {
    const response = await apiClient.post("/api/v1/store/promotions/validate", {
      discountCode,
      items,
    });
    return response.data.data;
  },

  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    kind?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    data: Promotion[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.kind) query.set("kind", params.kind);
    if (params?.status) query.set("status", params.status);
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/promotions${query.size ? `?${query}` : ""}`
    );
    return response.data;
  },

  create: async (input: PromotionInput): Promise<Promotion> => {
    const response = await apiClient.post("/api/v1/dashboard/admin/promotions", input);
    return response.data.data;
  },

  update: async (id: string, input: Partial<PromotionInput>): Promise<Promotion> => {
    const response = await apiClient.patch(
      `/api/v1/dashboard/admin/promotions/${id}`,
      input
    );
    return response.data.data;
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/dashboard/admin/promotions/${id}`);
  },

  getStats: async (id: string): Promise<{
    promotion: Promotion;
    recentOrders: PromotionApplicationOrder[];
  }> => {
    const response = await apiClient.get(
      `/api/v1/dashboard/admin/promotions/${id}/stats`
    );
    return response.data.data;
  },
};

export default promotionService;
