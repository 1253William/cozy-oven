"use client";

import { Plus, Trash2 } from "lucide-react";
import CmsImageField from "./CmsImageField";
import type { CmsSectionCard } from "../../services/cmsService";

const MAX_CARDS = 6;

export type CmsCardsVariant =
  | "steps"
  | "occasions"
  | "stats"
  | "dualCta"
  | "icons"
  | "priceList"
  | "faq";

type CmsCardsFieldProps = {
  label?: string;
  value?: CmsSectionCard[];
  onChange: (cards: CmsSectionCard[]) => void;
  variant?: CmsCardsVariant;
};

const VARIANT_META: Record<
  CmsCardsVariant,
  {
    itemLabel: string;
    titleLabel: string;
    bodyLabel: string;
    showImage: boolean;
    showHref: boolean;
    imageLabel: string;
    defaultCard: CmsSectionCard;
  }
> = {
  steps: {
    itemLabel: "step",
    titleLabel: "Title",
    bodyLabel: "Text",
    showImage: false,
    showHref: false,
    imageLabel: "Image",
    defaultCard: { title: "New step", body: "" },
  },
  occasions: {
    itemLabel: "occasion",
    titleLabel: "Title",
    bodyLabel: "Text",
    showImage: true,
    showHref: true,
    imageLabel: "Image",
    defaultCard: { title: "New occasion", body: "", href: "/shop", imageUrl: "" },
  },
  stats: {
    itemLabel: "stat",
    titleLabel: "Number / stat",
    bodyLabel: "Label",
    showImage: false,
    showHref: false,
    imageLabel: "Image",
    defaultCard: { title: "100+", body: "Label" },
  },
  dualCta: {
    itemLabel: "card",
    titleLabel: "Title",
    bodyLabel: "Text",
    showImage: true,
    showHref: true,
    imageLabel: "Image (optional)",
    defaultCard: { title: "New card", body: "", href: "/shop", imageUrl: "" },
  },
  icons: {
    itemLabel: "feature",
    titleLabel: "Title",
    bodyLabel: "Text",
    showImage: true,
    showHref: false,
    imageLabel: "Icon / image",
    defaultCard: { title: "New feature", body: "", imageUrl: "" },
  },
  priceList: {
    itemLabel: "item",
    titleLabel: "Item name",
    bodyLabel: "Price (e.g. GHS 55)",
    showImage: false,
    showHref: false,
    imageLabel: "Image",
    defaultCard: { title: "New item", body: "GHS 0" },
  },
  faq: {
    itemLabel: "question",
    titleLabel: "Question",
    bodyLabel: "Answer",
    showImage: false,
    showHref: false,
    imageLabel: "Image",
    defaultCard: { title: "New question?", body: "" },
  },
};

export function cardsVariantForSectionType(type?: string): CmsCardsVariant {
  switch (type) {
    case "occasionCards":
      return "occasions";
    case "statsRow":
      return "stats";
    case "dualCta":
      return "dualCta";
    case "iconFeatureCards":
      return "icons";
    case "priceList":
      return "priceList";
    case "customFaq":
      return "faq";
    case "steps":
    default:
      return "steps";
  }
}

export default function CmsCardsField({
  label = "Cards",
  value = [],
  onChange,
  variant = "steps",
}: CmsCardsFieldProps) {
  const cards = Array.isArray(value) ? value : [];
  const meta = VARIANT_META[variant];

  const updateCard = (index: number, patch: Partial<CmsSectionCard>) => {
    onChange(cards.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const addCard = () => {
    if (cards.length >= MAX_CARDS) return;
    onChange([...cards, { ...meta.defaultCard }]);
  };

  const moveCard = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= cards.length) return;
    const list = [...cards];
    const swap = list[index];
    list[index] = list[next];
    list[next] = swap;
    onChange(list);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-sm font-semibold text-[#5d6043]">{label}</span>
        <button
          type="button"
          onClick={addCard}
          disabled={cards.length >= MAX_CARDS}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add {meta.itemLabel}
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#b9aca2] px-3 py-6 text-center text-sm text-[#5d6043]">
          No items yet. Add one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div
              key={`card-${index}`}
              className="space-y-2 rounded-xl border border-[#b9aca2]/60 bg-white p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#5d6043]">
                  {meta.itemLabel} {index + 1}
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => moveCard(index, -1)}
                    disabled={index === 0}
                    className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] text-[#5d6043] disabled:opacity-40"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard(index, 1)}
                    disabled={index === cards.length - 1}
                    className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] text-[#5d6043] disabled:opacity-40"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="min-h-10 min-w-10 rounded-lg border border-red-200 p-2 text-red-700"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <label className="block text-sm text-[#5d6043]">
                {meta.titleLabel}
                <input
                  value={card.title || ""}
                  onChange={(e) => updateCard(index, { title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                />
              </label>
              <label className="block text-sm text-[#5d6043]">
                {meta.bodyLabel}
                <textarea
                  rows={variant === "faq" ? 3 : 2}
                  value={card.body || ""}
                  onChange={(e) => updateCard(index, { body: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                />
              </label>

              {meta.showImage ? (
                <CmsImageField
                  label={meta.imageLabel}
                  value={card.imageUrl || ""}
                  onChange={(url) => updateCard(index, { imageUrl: url })}
                />
              ) : null}

              {meta.showHref ? (
                <label className="block text-sm text-[#5d6043]">
                  Link
                  <input
                    value={card.href || ""}
                    onChange={(e) => updateCard(index, { href: e.target.value })}
                    placeholder="/shop"
                    className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                  />
                </label>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[#5d6043]">Up to {MAX_CARDS} items.</p>
    </div>
  );
}
