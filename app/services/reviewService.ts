import apiClient from "./apiClient";

export type ReviewSource = "public" | "order";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  source: ReviewSource;
  status: ReviewStatus;
  rating: number;
  comment: string;
  displayName: string;
  productId?: string | null;
  productIds?: string[];
  orderId?: string | null;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EligibleOrderReview {
  orderId: string;
  displayName: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
  }>;
}

export interface PublicReviewInput {
  displayName: string;
  rating: number;
  comment: string;
  productId?: string;
  website?: string;
}

export interface OrderReviewInput {
  orderId: string;
  displayName: string;
  rating: number;
  comment: string;
  guestPhone?: string;
  guestEmail?: string;
}

const reviewService = {
  async getProductReviews(productId: string) {
    const response = await apiClient.get("/api/v1/reviews", {
      params: { productId, limit: 50 },
    });
    return (response.data?.data || []) as Review[];
  },

  async getRecentReviews(limit = 6) {
    const response = await apiClient.get("/api/v1/reviews/recent", {
      params: { limit },
    });
    return (response.data?.data || []) as Review[];
  },

  async submitPublicReview(data: PublicReviewInput) {
    const response = await apiClient.post("/api/v1/reviews", data);
    return response.data;
  },

  async getEligibleOrder(params?: {
    orderId?: string;
    phoneNumber?: string;
    email?: string;
  }) {
    const response = await apiClient.get("/api/v1/reviews/eligible-order", {
      params,
    });
    return (response.data?.data || null) as EligibleOrderReview | null;
  },

  async submitOrderReview(data: OrderReviewInput) {
    const response = await apiClient.post("/api/v1/reviews/order", data);
    return response.data;
  },

  async getAdminReviews(status: ReviewStatus | "all" = "pending") {
    const response = await apiClient.get("/api/v1/dashboard/reviews", {
      params: { status },
    });
    return response.data;
  },

  async updateAdminReviewStatus(id: string, status: "approved" | "rejected") {
    const response = await apiClient.patch(`/api/v1/dashboard/reviews/${id}`, {
      status,
    });
    return response.data;
  },

  async deleteAdminReview(id: string) {
    const response = await apiClient.delete(`/api/v1/dashboard/reviews/${id}`);
    return response.data;
  },
};

export default reviewService;
