import apiClient from "./apiClient";

export type MarketingRecipientSource = "customer" | "subscriber" | "manual";

export interface MarketingRecipient {
  id?: string;
  sourceId?: string;
  name: string;
  email: string;
  source: MarketingRecipientSource;
}

export interface CampaignRecipient extends MarketingRecipient {
  status?: "pending" | "sent" | "failed";
  error?: string;
  sentAt?: string;
}

export interface CampaignTemplate {
  _id: string;
  name: string;
  heroImageUrl?: string;
  heroImagePublicId?: string;
  headline: string;
  body: string;
  secondaryImageUrl?: string;
  secondaryImagePublicId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CampaignTemplateInput = {
  name: string;
  headline: string;
  body: string;
  heroImageUrl?: string;
  heroImagePublicId?: string;
  secondaryImageUrl?: string;
  secondaryImagePublicId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  isActive?: boolean;
};

export interface Campaign {
  _id: string;
  subject: string;
  message?: string;
  templateId?: string;
  skinId?: string;
  status: "draft" | "sending" | "sent" | "failed";
  recipientCount?: number;
  recipients?: CampaignRecipient[];
  sentCount: number;
  failedCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface CampaignSkin {
  id: string;
  name: string;
  blurb: string;
  themes: string[];
  swatch: string[];
}

export const marketingService = {
  getRecipients: async (params?: { source?: "all" | "customers" | "subscribers"; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.source) queryParams.set("source", params.source);
    if (params?.search) queryParams.set("search", params.search);

    const response = await apiClient.get(
      `/api/v1/dashboard/marketing/recipients${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data as { success: boolean; count: number; data: MarketingRecipient[]; message?: string };
  },

  getSkins: async () => {
    const response = await apiClient.get("/api/v1/dashboard/marketing/skins");
    return response.data as {
      success: boolean;
      data: CampaignSkin[];
      defaultSkinId?: string;
      message?: string;
    };
  },

  getTemplates: async (includeArchived = false) => {
    const query = includeArchived ? "?includeArchived=true" : "";
    const response = await apiClient.get(`/api/v1/dashboard/marketing/templates${query}`);
    return response.data as { success: boolean; data: CampaignTemplate[]; message?: string };
  },

  createTemplate: async (payload: CampaignTemplateInput) => {
    const response = await apiClient.post("/api/v1/dashboard/marketing/templates", payload);
    return response.data as { success: boolean; data: CampaignTemplate; message?: string };
  },

  updateTemplate: async (id: string, payload: Partial<CampaignTemplateInput>) => {
    const response = await apiClient.patch(`/api/v1/dashboard/marketing/templates/${id}`, payload);
    return response.data as { success: boolean; data: CampaignTemplate; message?: string };
  },

  archiveTemplate: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/dashboard/marketing/templates/${id}`);
    return response.data as { success: boolean; data: CampaignTemplate; message?: string };
  },

  previewTemplate: async (payload: {
    templateId?: string;
    subject?: string;
    message?: string;
    customerName?: string;
    skinId?: string;
    name?: string;
    headline?: string;
    body?: string;
    heroImageUrl?: string;
    secondaryImageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerNote?: string;
  }) => {
    const response = await apiClient.post("/api/v1/dashboard/marketing/templates/preview", payload);
    return response.data as {
      success: boolean;
      data: { subject: string; text: string; html: string; skinId?: string };
      message?: string;
    };
  },

  sendCampaign: async (payload: {
    templateId: string;
    subject: string;
    message?: string;
    skinId?: string;
    recipients: MarketingRecipient[];
  }) => {
    const response = await apiClient.post("/api/v1/dashboard/marketing/campaigns", payload);
    return response.data as { success: boolean; message: string; data: Campaign };
  },

  getCampaigns: async () => {
    const response = await apiClient.get("/api/v1/dashboard/marketing/campaigns");
    return response.data as { success: boolean; data: Campaign[]; message?: string };
  },
};

export default marketingService;
