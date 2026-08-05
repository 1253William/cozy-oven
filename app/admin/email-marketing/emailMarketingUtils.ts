import type { CampaignTemplateInput, MarketingRecipient } from "../../services/marketingService";

export type MarketingTab = "compose" | "templates" | "history";
export type ComposeStep = "audience" | "template" | "skin" | "compose";
export type RecipientSourceFilter = "all" | "customers" | "subscribers";

export const DEFAULT_SKIN_ID = "oven_classic";

export const field =
  "w-full rounded-lg border border-[#b9aca2] px-4 py-3 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20";

export const recipientKey = (recipient: MarketingRecipient) => recipient.email.toLowerCase();

export const emptyTemplateForm = (): CampaignTemplateInput => ({
  name: "",
  headline: "",
  body: "",
  heroImageUrl: "",
  secondaryImageUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  footerNote: "",
});

export const parseMarketingTab = (value: string | null | undefined): MarketingTab => {
  if (value === "templates" || value === "history" || value === "compose") return value;
  return "compose";
};

export const parseComposeStep = (value: string | null | undefined): ComposeStep => {
  if (value === "template" || value === "skin" || value === "compose" || value === "audience") {
    return value;
  }
  return "audience";
};

export const COMPOSE_STEPS: { id: ComposeStep; label: string; number: number }[] = [
  { id: "audience", label: "Audience", number: 1 },
  { id: "template", label: "Template", number: 2 },
  { id: "skin", label: "Skin", number: 3 },
  { id: "compose", label: "Compose", number: 4 },
];

export const validateCtaPair = (ctaLabel?: string, ctaUrl?: string): string | null => {
  const label = (ctaLabel || "").trim();
  const url = (ctaUrl || "").trim();
  if ((label && !url) || (!label && url)) {
    return "CTA label and CTA URL must both be set, or both left empty.";
  }
  return null;
};
