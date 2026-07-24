import apiClient from "./apiClient";

export type HomepageSectionType =
  | "promoBanner"
  | "hero"
  | "signature"
  | "giftCta"
  | "productStrip"
  | "faq"
  | "newsletter";

export interface HomepageSectionContent {
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  productId?: string;
  categoryFilter?: string;
  message?: string;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  sortOrder: number;
  content: HomepageSectionContent;
}

export interface HomepageConfig {
  key: string;
  sections: HomepageSection[];
  updatedAt?: string;
}

export type CmsPageTemplate = "simple" | "seasonal" | "promo";
export type CmsPageStatus = "draft" | "published";

export interface CmsPageContent {
  headline?: string;
  body?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  productIds?: string[];
  showOnSaleProducts?: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  template: CmsPageTemplate;
  status: CmsPageStatus;
  seoTitle?: string;
  seoDescription?: string;
  content: CmsPageContent;
  publishAt?: string | null;
  unpublishAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CmsPageInput = {
  title: string;
  slug?: string;
  template: CmsPageTemplate;
  status: CmsPageStatus;
  seoTitle?: string;
  seoDescription?: string;
  content: CmsPageContent;
  publishAt?: string | null;
  unpublishAt?: string | null;
};

export interface CmsPageVersion {
  id: string;
  pageId: string;
  savedAt: string;
  label: string;
  snapshot: {
    title: string;
    slug: string;
    template: CmsPageTemplate;
    status: CmsPageStatus;
    seoTitle?: string;
    seoDescription?: string;
    content: CmsPageContent;
    publishAt?: string | null;
    unpublishAt?: string | null;
  };
}

export const SECTION_LABELS: Record<HomepageSectionType, string> = {
  promoBanner: "Promo bar",
  hero: "Hero",
  signature: "Featured product",
  giftCta: "Gift box",
  productStrip: "Favourites",
  faq: "FAQs",
  newsletter: "Newsletter",
};

export const PAGE_TEMPLATE_LABELS: Record<CmsPageTemplate, string> = {
  simple: "Simple",
  seasonal: "Seasonal",
  promo: "Promo",
};

const cmsService = {
  async getPublicHomepage(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/v1/cms/homepage");
    return response.data.data;
  },

  async getAdminHomepage(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/v1/dashboard/cms/homepage");
    return response.data.data;
  },

  async saveAdminHomepage(sections: HomepageSection[]): Promise<HomepageConfig> {
    const response = await apiClient.put("/api/v1/dashboard/cms/homepage", { sections });
    return response.data.data;
  },

  async getPublicPage(slug: string): Promise<CmsPage> {
    const response = await apiClient.get(`/api/v1/cms/pages/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async listAdminPages(): Promise<CmsPage[]> {
    const response = await apiClient.get("/api/v1/dashboard/cms/pages");
    return response.data.data || [];
  },

  async getAdminPage(id: string): Promise<CmsPage> {
    const response = await apiClient.get(`/api/v1/dashboard/cms/pages/${id}`);
    return response.data.data;
  },

  async createAdminPage(payload: CmsPageInput): Promise<CmsPage> {
    const response = await apiClient.post("/api/v1/dashboard/cms/pages", payload);
    return response.data.data;
  },

  async updateAdminPage(id: string, payload: CmsPageInput): Promise<CmsPage> {
    const response = await apiClient.put(`/api/v1/dashboard/cms/pages/${id}`, payload);
    return response.data.data;
  },

  async deleteAdminPage(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/dashboard/cms/pages/${id}`);
  },

  async listAdminPageVersions(id: string): Promise<CmsPageVersion[]> {
    const response = await apiClient.get(`/api/v1/dashboard/cms/pages/${id}/versions`);
    return response.data.data || [];
  },

  async restoreAdminPageVersion(id: string, versionId: string): Promise<CmsPage> {
    const response = await apiClient.post(
      `/api/v1/dashboard/cms/pages/${id}/versions/${versionId}/restore`
    );
    return response.data.data;
  },

  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/api/v1/dashboard/cms/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};

export default cmsService;
