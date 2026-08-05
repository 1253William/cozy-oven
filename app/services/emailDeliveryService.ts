import apiClient from "./apiClient";

export type EmailDeliveryCategory = "campaign" | "transactional";

export type EmailDeliveryStatusFacet =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "failed"
  | "delayed";

export interface EmailDelivery {
  _id: string;
  providerId: string;
  to: string;
  subject: string;
  category: EmailDeliveryCategory;
  messageKey?: string;
  campaignId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  complainedAt?: string;
  failedAt?: string;
  delayedAt?: string;
  openCount: number;
  clickCount: number;
  lastEvent?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDeliverySummary {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  messageKeys: string[];
}

export type EmailDeliveryListParams = {
  category?: "" | EmailDeliveryCategory;
  messageKey?: string;
  search?: string;
  status?: "" | EmailDeliveryStatusFacet;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

function toQuery(params?: EmailDeliveryListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.messageKey) q.set("messageKey", params.messageKey);
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const emailDeliveryService = {
  getSummary: async (params?: EmailDeliveryListParams) => {
    const response = await apiClient.get(
      `/api/v1/dashboard/email-deliveries/summary${toQuery(params)}`
    );
    return response.data as {
      success: boolean;
      message?: string;
      data?: EmailDeliverySummary;
    };
  },

  list: async (params?: EmailDeliveryListParams) => {
    const response = await apiClient.get(
      `/api/v1/dashboard/email-deliveries${toQuery(params)}`
    );
    return response.data as {
      success: boolean;
      message?: string;
      data?: {
        items: EmailDelivery[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    };
  },
};

export default emailDeliveryService;
