import apiClient from "./apiClient";

export const HOMEPAGE_SECTION_TYPES = [
  "promoBanner",
  "hero",
  "signature",
  "giftCta",
  "productStrip",
  "faq",
  "newsletter",
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

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
  tone?: "sale" | "seasonal" | "announcement" | string;
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
  draftSections?: HomepageSection[];
  hasUnpublishedChanges?: boolean;
  updatedAt?: string;
}

export interface HomepageVersion {
  id: string;
  savedAt: string;
  label?: string;
  snapshot: { sections: HomepageSection[] };
}

export interface CmsMediaItem {
  id: string;
  url: string;
  publicId: string;
  label?: string;
  createdAt?: string;
}

export interface CmsMediaListResult {
  items: CmsMediaItem[];
  page: number;
  limit: number;
  total: number;
}

const newHomepageSectionId = (type: HomepageSectionType, index = 0) =>
  `${type}-${Date.now().toString(36)}-${index}`;

export const createBlankHomepageSection = (
  type: HomepageSectionType,
  sortOrder = 0
): HomepageSection => {
  const id = newHomepageSectionId(type, sortOrder);
  const base: HomepageSection = { id, type, enabled: true, sortOrder, content: {} };
  switch (type) {
    case "promoBanner":
      return {
        ...base,
        content: {
          message: "Limited-time offer — don’t miss it",
          body: "A short line under the promo, if you want one.",
          tone: "sale",
          ctaLabel: "Shop now",
          ctaHref: "/shop",
        },
      };
    case "hero":
      return {
        ...base,
        content: {
          eyebrow: "Tema-baked · Ghana-loved · Gift-ready",
          headline: "Your headline",
          body: "Add a short supporting line.",
          ctaLabel: "Shop now",
          ctaHref: "/shop",
          secondaryCtaLabel: "Send a gift box",
          secondaryCtaHref: "/shop#package",
        },
      };
    case "signature":
      return {
        ...base,
        content: {
          eyebrow: "Best seller",
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
          headline: "Customer favourites",
          body: "Shop our most loved loaves and treats.",
          ctaLabel: "View all",
          ctaHref: "/shop",
          categoryFilter: "",
        },
      };
    case "faq":
      return {
        ...base,
        content: {
          headline: "Delivery, freshness and gifting.",
          body: "",
        },
      };
    case "newsletter":
      return {
        ...base,
        content: {
          headline: "Fresh bakes in your inbox",
          body: "New flavours, gift ideas, and bakery notes—no spam.",
          ctaLabel: "Subscribe",
        },
      };
    default:
      return base;
  }
};

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

/** About admin catalog — story-friendly section types. */
export const ABOUT_SECTION_TYPES = [
  "textIntro",
  "storySplit",
  "featureGrid",
  "valuesRow",
  "closingCta",
  "promoBanner",
  "hero",
  "giftCta",
] as const satisfies readonly CmsPageSectionType[];

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
  tone?: "sale" | "seasonal" | "announcement" | string;
}

export interface CmsPageSection {
  id: string;
  type: CmsPageSectionType;
  enabled: boolean;
  sortOrder: number;
  content: CmsPageSectionContent;
}

export interface AboutConfig {
  key: string;
  sections: CmsPageSection[];
  updatedAt?: string;
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
  promoBanner: "Promo section",
  hero: "Hero",
  signature: "Featured product",
  giftCta: "Gift box",
  productStrip: "Favourites",
  faq: "FAQs",
  newsletter: "Newsletter",
};

export const PAGE_SECTION_LABELS: Record<CmsPageSectionType, string> = {
  promoBanner: "Promo section",
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
  promoBanner: [
    "message",
    "body",
    "tone",
    "ctaLabel",
    "ctaHref",
    "imageUrl",
    "productId",
    "startsAt",
    "endsAt",
  ],
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
        content: {
          message: "Limited-time offer — don’t miss it",
          body: "A short line under the promo, if you want one.",
          tone: "sale",
          ctaLabel: "Shop now",
          ctaHref: "/shop",
        },
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

export interface SiteExploreLink {
  label: string;
  href: string;
}

export interface SiteCampaignNavLink {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface SiteSettings {
  deliveryBanner: {
    enabled: boolean;
    message: string;
  };
  footer: {
    tagline: string;
    blurb: string;
    email: string;
    phone: string;
    address: string;
    exploreLinks: SiteExploreLink[];
  };
  social: {
    whatsappUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
  };
  campaignNavLinks: SiteCampaignNavLink[];
}

export const FALLBACK_SITE_SETTINGS: SiteSettings = {
  deliveryBanner: {
    enabled: true,
    message: "Freshly baked banana bread is delivered on Tuesdays and Thursdays",
  },
  footer: {
    tagline: "Fresh banana bread & gift boxes",
    blurb:
      "Handcrafted banana bread, yoghurt, and gift-ready packages made fresh with care in Tema.",
    email: "info@cozyoven.store",
    phone: "0249612035",
    address: "Tema Community 22, Nhmf Estates",
    exploreLinks: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Our Story", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  social: {
    whatsappUrl: "https://api.whatsapp.com/message/QAOMJAY7KI7WP1",
    instagramUrl: "https://www.instagram.com/cozyoven.gh?igsh=NWd0bXcxczk5aGsy",
    tiktokUrl: "https://www.tiktok.com/@cozyovengh?_r=1&_t=ZM-933sQOzBXiK",
  },
  campaignNavLinks: [],
};

const cmsService = {
  async getPublicHomepage(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/v1/cms/homepage");
    return response.data.data;
  },

  async getPublicSiteSettings(): Promise<SiteSettings> {
    const response = await apiClient.get("/api/v1/cms/site-settings");
    return response.data.data || FALLBACK_SITE_SETTINGS;
  },

  async getAdminSiteSettings(): Promise<SiteSettings> {
    const response = await apiClient.get("/api/v1/dashboard/cms/site-settings");
    return response.data.data || FALLBACK_SITE_SETTINGS;
  },

  async saveAdminSiteSettings(payload: SiteSettings): Promise<SiteSettings> {
    const response = await apiClient.put("/api/v1/dashboard/cms/site-settings", payload);
    return response.data.data;
  },

  async getAdminHomepage(): Promise<HomepageConfig> {
    const response = await apiClient.get("/api/v1/dashboard/cms/homepage");
    return response.data.data;
  },

  /** Save draft only — does not change the live homepage. */
  async saveAdminHomepageDraft(draftSections: HomepageSection[]): Promise<HomepageConfig> {
    const response = await apiClient.put("/api/v1/dashboard/cms/homepage", {
      draftSections,
    });
    return response.data.data;
  },

  /** @deprecated Prefer saveAdminHomepageDraft — still saves as draft. */
  async saveAdminHomepage(sections: HomepageSection[]): Promise<HomepageConfig> {
    return this.saveAdminHomepageDraft(sections);
  },

  async publishAdminHomepage(draftSections?: HomepageSection[]): Promise<HomepageConfig> {
    const response = await apiClient.post("/api/v1/dashboard/cms/homepage/publish", {
      draftSections,
    });
    return response.data.data;
  },

  async listAdminHomepageVersions(): Promise<HomepageVersion[]> {
    const response = await apiClient.get("/api/v1/dashboard/cms/homepage/versions");
    return response.data.data || [];
  },

  async restoreAdminHomepageVersion(versionId: string): Promise<HomepageConfig> {
    const response = await apiClient.post(
      `/api/v1/dashboard/cms/homepage/versions/${versionId}/restore`
    );
    return response.data.data;
  },

  async getPublicAbout(): Promise<AboutConfig> {
    const response = await apiClient.get("/api/v1/cms/about");
    return response.data.data;
  },

  async getAdminAbout(): Promise<AboutConfig> {
    const response = await apiClient.get("/api/v1/dashboard/cms/about");
    return response.data.data;
  },

  async saveAdminAbout(sections: CmsPageSection[]): Promise<AboutConfig> {
    const response = await apiClient.put("/api/v1/dashboard/cms/about", { sections });
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

  async listAdminMedia(params?: {
    page?: number;
    limit?: number;
  }): Promise<CmsMediaListResult> {
    const response = await apiClient.get("/api/v1/dashboard/cms/media", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 24,
      },
    });
    return (
      response.data.data || {
        items: [],
        page: 1,
        limit: 24,
        total: 0,
      }
    );
  },
};

export default cmsService;
