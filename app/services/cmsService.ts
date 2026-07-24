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

export const CMS_PAGE_SECTION_TYPES = [
  "hero",
  "giftCta",
  "productStrip",
  "faq",
  "newsletter",
  "promoBanner",
  "signature",
  "textIntro",
  "storySplit",
  "featureGrid",
  "valuesRow",
  "closingCta",
] as const;

export type CmsPageSectionType = (typeof CMS_PAGE_SECTION_TYPES)[number];

export interface CmsPageSectionContent {
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  productId?: string;
  productIds?: string[];
  categoryFilter?: string;
  message?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  items?: string[];
  imagePosition?: "left" | "right";
  showOnSaleProducts?: boolean;
}

export interface CmsPageSection {
  id: string;
  type: CmsPageSectionType;
  enabled: boolean;
  sortOrder: number;
  content: CmsPageSectionContent;
}

/** @deprecated Prefer sections. */
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
  sections: CmsPageSection[];
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
  content?: CmsPageContent;
  sections: CmsPageSection[];
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
    sections?: CmsPageSection[];
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

export const PAGE_SECTION_LABELS: Record<CmsPageSectionType, string> = {
  promoBanner: "Promo bar",
  hero: "Hero",
  signature: "Featured product",
  giftCta: "Gift box",
  productStrip: "Product strip",
  faq: "FAQs",
  newsletter: "Newsletter",
  textIntro: "Text intro",
  storySplit: "Story + image",
  featureGrid: "Feature grid",
  valuesRow: "Values chips",
  closingCta: "Closing note",
};

export const PAGE_TEMPLATE_LABELS: Record<CmsPageTemplate, string> = {
  simple: "Simple",
  seasonal: "Seasonal",
  promo: "Promo",
};

export const PAGE_SECTION_FIELD_MAP: Record<
  CmsPageSectionType,
  Array<keyof CmsPageSectionContent>
> = {
  promoBanner: ["message", "ctaLabel", "ctaHref", "startsAt", "endsAt"],
  hero: [
    "eyebrow",
    "headline",
    "body",
    "ctaLabel",
    "ctaHref",
    "secondaryCtaLabel",
    "secondaryCtaHref",
    "imageUrl",
  ],
  signature: ["eyebrow", "headline", "body", "ctaLabel", "ctaHref", "imageUrl", "productId"],
  giftCta: ["headline", "body", "ctaLabel", "ctaHref", "imageUrl"],
  productStrip: [
    "headline",
    "body",
    "ctaLabel",
    "ctaHref",
    "categoryFilter",
    "productIds",
    "showOnSaleProducts",
  ],
  faq: ["headline", "body"],
  newsletter: ["headline", "body", "ctaLabel"],
  textIntro: ["headline", "body"],
  storySplit: ["headline", "body", "imageUrl", "imagePosition", "ctaLabel", "ctaHref"],
  featureGrid: ["headline", "body", "items"],
  valuesRow: ["items"],
  closingCta: ["headline", "body", "ctaLabel", "secondaryCtaLabel", "ctaHref"],
};

const newSectionId = (type: CmsPageSectionType, index = 0) =>
  `${type}-${Date.now().toString(36)}-${index}`;

export const createBlankPageSection = (
  type: CmsPageSectionType,
  sortOrder = 0
): CmsPageSection => {
  const id = newSectionId(type, sortOrder);
  const base: CmsPageSection = { id, type, enabled: true, sortOrder, content: {} };

  switch (type) {
    case "promoBanner":
      return {
        ...base,
        content: { message: "Limited-time offer", ctaLabel: "Shop", ctaHref: "/shop" },
      };
    case "hero":
      return {
        ...base,
        content: {
          eyebrow: "Cozy Oven",
          headline: "Your headline",
          body: "Add a short supporting line.",
          ctaLabel: "Shop now",
          ctaHref: "/shop",
        },
      };
    case "signature":
      return {
        ...base,
        content: {
          eyebrow: "Featured",
          headline: "Featured product",
          body: "A short product note.",
          ctaLabel: "Shop now",
          ctaHref: "/shop",
        },
      };
    case "giftCta":
      return {
        ...base,
        content: {
          headline: "Send a gift box",
          body: "Build a warm gift for someone special.",
          ctaLabel: "Build a gift box",
          ctaHref: "/shop#package",
          imageUrl: "/gift.png",
        },
      };
    case "productStrip":
      return {
        ...base,
        content: {
          headline: "Shop the picks",
          ctaLabel: "Shop all",
          ctaHref: "/shop",
          productIds: [],
          showOnSaleProducts: false,
        },
      };
    case "faq":
      return { ...base, content: { headline: "Questions" } };
    case "newsletter":
      return {
        ...base,
        content: {
          headline: "Stay in the loop",
          body: "New flavours and gift ideas—no spam.",
          ctaLabel: "Subscribe",
        },
      };
    case "textIntro":
      return {
        ...base,
        content: {
          headline: "We're so glad you're here.",
          body: "Add your intro paragraphs here.",
        },
      };
    case "storySplit":
      return {
        ...base,
        content: {
          headline: "How it started",
          body: "Tell the story.",
          imagePosition: "left",
        },
      };
    case "featureGrid":
      return {
        ...base,
        content: {
          headline: "Because comfort is powerful.",
          body: "Every loaf is a small piece of comfort.",
          items: ["Warmth after a long day", "A sweet treat that lifts your mood"],
        },
      };
    case "valuesRow":
      return {
        ...base,
        content: { items: ["Excellence", "Simplicity", "Thoughtfulness"] },
      };
    case "closingCta":
      return {
        ...base,
        content: {
          headline: "From the Baker",
          body: "Thank you for being here.",
          ctaLabel: "Anita",
          secondaryCtaLabel: "Creator of Cozy Oven",
        },
      };
    default:
      return base;
  }
};

export const presetPageSections = (template: CmsPageTemplate): CmsPageSection[] => {
  if (template === "seasonal") {
    return [createBlankPageSection("hero", 0), createBlankPageSection("productStrip", 1)];
  }
  if (template === "promo") {
    return [
      createBlankPageSection("promoBanner", 0),
      createBlankPageSection("hero", 1),
      createBlankPageSection("productStrip", 2),
      createBlankPageSection("closingCta", 3),
    ];
  }
  return [createBlankPageSection("textIntro", 0), createBlankPageSection("productStrip", 1)];
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
