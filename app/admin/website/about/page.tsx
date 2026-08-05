"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  Loading03Icon,
  PencilEdit02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import WebsiteTabs from "../WebsiteTabs";
import CmsImageField from "../CmsImageField";
import CmsProductPicker from "../CmsProductPicker";
import CmsCardsField, { cardsVariantForSectionType } from "../CmsCardsField";
import CmsGalleryField from "../CmsGalleryField";
import CmsDraftPreviewModal from "../CmsDraftPreviewModal";
import CmsSectionCatalogPicker from "../CmsSectionCatalogPicker";
import cmsService, {
  ABOUT_SECTION_TYPES,
  CmsPageSection,
  CmsPageSectionContent,
  CmsPageSectionType,
  PAGE_SECTION_FIELD_MAP,
  PAGE_SECTION_LABELS,
  createBlankPageSection,
} from "../../../services/cmsService";

const FIELD_LABELS: Partial<Record<keyof CmsPageSectionContent, string>> = {
  eyebrow: "Eyebrow",
  headline: "Headline",
  body: "Text",
  ctaLabel: "Button / name",
  ctaHref: "Button link",
  secondaryCtaLabel: "2nd line / role",
  secondaryCtaHref: "2nd link",
  imageUrl: "Image",
  productId: "Product thumbnail",
  productIds: "Products",
  categoryFilter: "Category",
  message: "Promo text",
  tone: "Style",
  startsAt: "Starts",
  endsAt: "Ends",
  items: "List items (one per line)",
  imagePosition: "Image side",
  showOnSaleProducts: "Show on-sale products",
  cards: "Cards",
  galleryUrls: "Gallery images",
  address: "Address",
  phone: "Phone",
  hours: "Hours",
  videoUrl: "Video link (YouTube, Vimeo, or Cloudinary)",
};

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function AdminWebsiteAboutPage() {
  const [sections, setSections] = useState<CmsPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<CmsPageSectionContent>({});
  const [showCatalog, setShowCatalog] = useState(false);
  const [draftPreview, setDraftPreview] = useState<
    null | { mode: "page" } | { mode: "section"; sectionId: string }
  >(null);

  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [sections]
  );

  const editing = sorted.find((section) => section.id === editingId) || null;

  const sectionsForPreview = useMemo(() => {
    if (!editingId) return sorted;
    return sorted.map((section) =>
      section.id === editingId
        ? { ...section, content: { ...draftContent } }
        : section
    );
  }, [sorted, editingId, draftContent]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cmsService.getAdminAbout();
      setSections(data.sections || []);
    } catch (err) {
      console.error(err);
      setError("Could not load About page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renumber = (list: CmsPageSection[]) =>
    list.map((section, index) => ({ ...section, sortOrder: index }));

  const applySections = (list: CmsPageSection[]) => {
    setSections(renumber(list));
    setSuccess("");
  };

  const move = (id: string, direction: -1 | 1) => {
    const list = [...sorted];
    const index = list.findIndex((section) => section.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    const swap = list[index];
    list[index] = list[next];
    list[next] = swap;
    applySections(list);
  };

  const toggleEnabled = (id: string) => {
    applySections(
      sorted.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const removeSection = (id: string) => {
    if (!window.confirm("Remove this section?")) return;
    applySections(sorted.filter((section) => section.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraftContent({});
    }
  };

  const addSection = (type: CmsPageSectionType) => {
    const next = [...sorted, createBlankPageSection(type, sorted.length)];
    applySections(next);
    setShowCatalog(false);
    const added = next[next.length - 1];
    setEditingId(added.id);
    setDraftContent({ ...(added.content || {}) });
  };

  const openEdit = (section: CmsPageSection) => {
    setEditingId(section.id);
    setDraftContent({ ...(section.content || {}) });
    setError("");
    setSuccess("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    applySections(
      sorted.map((section) =>
        section.id === editingId
          ? { ...section, content: { ...draftContent } }
          : section
      )
    );
    setEditingId(null);
    setDraftContent({});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const withDraft = editingId
        ? sorted.map((section) =>
            section.id === editingId
              ? { ...section, content: { ...draftContent } }
              : section
          )
        : sorted;
      const payload = renumber(
        withDraft.map((section) => ({
          ...section,
          content: {
            ...section.content,
            items: Array.isArray(section.content.items)
              ? section.content.items.map((item) => String(item).trim()).filter(Boolean)
              : section.content.items,
            productIds: Array.isArray(section.content.productIds)
              ? section.content.productIds.map((id) => String(id).trim()).filter(Boolean)
              : section.content.productIds,
          },
        }))
      );
      const saved = await cmsService.saveAdminAbout(payload);
      setSections(saved.sections || []);
      setEditingId(null);
      setDraftContent({});
      setSuccess("Saved");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: keyof CmsPageSectionContent) => {
    if (field === "imageUrl") {
      return (
        <CmsImageField
          key={field}
          value={draftContent.imageUrl || ""}
          onChange={(url) => setDraftContent((prev) => ({ ...prev, imageUrl: url }))}
        />
      );
    }
    if (field === "productIds") {
      return (
        <CmsProductPicker
          key={field}
          selectedIds={draftContent.productIds || []}
          onChange={(ids) => setDraftContent((prev) => ({ ...prev, productIds: ids }))}
        />
      );
    }
    if (field === "productId") {
      return (
        <CmsProductPicker
          key={field}
          label="Product thumbnail (optional)"
          maxSelections={1}
          selectedIds={draftContent.productId ? [String(draftContent.productId)] : []}
          onChange={(ids) =>
            setDraftContent((prev) => ({ ...prev, productId: ids[0] || "" }))
          }
        />
      );
    }
    if (field === "tone") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <select
            value={draftContent.tone || "sale"}
            onChange={(e) =>
              setDraftContent((prev) => ({ ...prev, tone: e.target.value }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          >
            <option value="sale">Sale</option>
            <option value="seasonal">Seasonal</option>
            <option value="announcement">Announcement</option>
          </select>
        </label>
      );
    }
    if (field === "imagePosition") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <select
            value={draftContent.imagePosition || "left"}
            onChange={(e) =>
              setDraftContent((prev) => ({
                ...prev,
                imagePosition: e.target.value as "left" | "right",
              }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          >
            <option value="left">Image left</option>
            <option value="right">Image right</option>
          </select>
        </label>
      );
    }
    if (field === "items") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <textarea
            rows={5}
            value={(draftContent.items || []).join("\n")}
            onChange={(e) =>
              setDraftContent((prev) => ({
                ...prev,
                items: e.target.value.split("\n"),
              }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          />
        </label>
      );
    }
    if (field === "cards") {
      const variant = cardsVariantForSectionType(editing?.type);
      const labelByVariant: Record<string, string> = {
        steps: "Steps",
        stats: "Stats",
        icons: "Feature cards",
        faq: "Questions",
      };
      return (
        <CmsCardsField
          key={field}
          label={labelByVariant[variant] || "Cards"}
          variant={variant}
          value={draftContent.cards || []}
          onChange={(cards) => setDraftContent((prev) => ({ ...prev, cards }))}
        />
      );
    }
    if (field === "videoUrl") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <input
            value={draftContent.videoUrl || ""}
            onChange={(e) =>
              setDraftContent((prev) => ({ ...prev, videoUrl: e.target.value }))
            }
            placeholder="https://youtu.be/..."
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          />
        </label>
      );
    }
    if (field === "galleryUrls") {
      return (
        <CmsGalleryField
          key={field}
          value={draftContent.galleryUrls || []}
          onChange={(galleryUrls) =>
            setDraftContent((prev) => ({ ...prev, galleryUrls }))
          }
        />
      );
    }
    if (field === "hours") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <textarea
            rows={4}
            value={draftContent.hours || ""}
            onChange={(e) =>
              setDraftContent((prev) => ({ ...prev, hours: e.target.value }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          />
        </label>
      );
    }
    if (field === "showOnSaleProducts") {
      return (
        <label key={field} className="flex items-center gap-2 text-sm text-[#5d6043]">
          <input
            type="checkbox"
            checked={Boolean(draftContent.showOnSaleProducts)}
            onChange={(e) =>
              setDraftContent((prev) => ({
                ...prev,
                showOnSaleProducts: e.target.checked,
              }))
            }
          />
          {FIELD_LABELS[field]}
        </label>
      );
    }
    if (field === "body") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {editing?.type === "quote" ? "Quote" : FIELD_LABELS[field]}
          </span>
          <textarea
            rows={5}
            value={draftContent.body || ""}
            onChange={(e) =>
              setDraftContent((prev) => ({ ...prev, body: e.target.value }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          />
        </label>
      );
    }
    if (field === "startsAt" || field === "endsAt") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <input
            type="datetime-local"
            value={toDateInputValue(draftContent[field])}
            onChange={(e) =>
              setDraftContent((prev) => ({
                ...prev,
                [field]: e.target.value ? new Date(e.target.value).toISOString() : null,
              }))
            }
            className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
          />
        </label>
      );
    }
    return (
      <label key={field} className="block text-sm">
        <span className="mb-1 block font-semibold text-[#5d6043]">
          {FIELD_LABELS[field] || field}
        </span>
        <input
          value={String(draftContent[field] ?? "")}
          onChange={(e) =>
            setDraftContent((prev) => ({ ...prev, [field]: e.target.value }))
          }
          className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
        />
      </label>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Website</h1>
            <div className="mt-3">
              <WebsiteTabs />
            </div>
            <p className="mt-2 text-sm text-[#5d6043]">
              Edit the About / Our Story page. Changes go live when you save.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraftPreview({ mode: "page" })}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            >
              <AdminIcon icon={ViewIcon} size={16} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setShowCatalog((prev) => !prev)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            >
              <AdminIcon icon={Add01Icon} size={16} />
              Add section
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5] disabled:opacity-60"
            >
              {saving ? (
                <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
              ) : (
                <AdminIcon icon={FloppyDiskIcon} size={16} />
              )}
              Save
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {showCatalog ? (
          <CmsSectionCatalogPicker
            types={ABOUT_SECTION_TYPES}
            onSelect={addSection}
            onClose={() => setShowCatalog(false)}
          />
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <AdminIcon icon={Loading03Icon} size={32} className="animate-spin text-[#5d6043]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9aca2] bg-[#faf9f5] px-6 py-12 text-center text-[#5d6043]">
            No sections yet. Add one from the catalog.
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((section, index) => (
              <article
                key={section.id}
                className="rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#222222]">
                      {PAGE_SECTION_LABELS[section.type]}
                    </h2>
                    <p className="text-xs text-[#5d6043]">
                      {section.enabled ? "On" : "Off"} · {section.type}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => move(section.id, -1)}
                      disabled={index === 0}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] px-2 text-[#5d6043] disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(section.id, 1)}
                      disabled={index === sorted.length - 1}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] px-2 text-[#5d6043] disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPreview({ mode: "section", sectionId: section.id })
                      }
                      className="min-h-10 rounded-lg border border-[#b9aca2] px-3 text-xs font-medium text-[#5d6043]"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleEnabled(section.id)}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] p-2 text-[#5d6043]"
                      aria-label="Toggle"
                    >
                      {section.enabled ? (
                        <AdminIcon icon={ViewIcon} size={16} />
                      ) : (
                        <AdminIcon icon={ViewOffSlashIcon} size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(section)}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] p-2 text-[#5d6043]"
                      aria-label="Edit"
                    >
                      <AdminIcon icon={PencilEdit02Icon} size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="min-h-10 min-w-10 rounded-lg border border-red-200 p-2 text-red-700"
                      aria-label="Remove"
                    >
                      <AdminIcon icon={Delete02Icon} size={16} />
                    </button>
                  </div>
                </div>

                {editing?.id === section.id ? (
                  <div className="mt-4 space-y-3 border-t border-[#b9aca2]/40 pt-4">
                    {PAGE_SECTION_FIELD_MAP[section.type].map((field) =>
                      renderField(field)
                    )}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setDraftContent({});
                        }}
                        className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
                      >
                        <AdminIcon icon={Cancel01Icon} size={16} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftPreview({
                            mode: "section",
                            sectionId: section.id,
                          })
                        }
                        className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
                      >
                        <AdminIcon icon={ViewIcon} size={16} />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="min-h-10 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5]"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>

      {draftPreview ? (
        <CmsDraftPreviewModal
          title="About preview"
          subtitle="Live draft preview (includes unsaved edits)"
          sections={sectionsForPreview}
          sectionId={
            draftPreview.mode === "section" ? draftPreview.sectionId : null
          }
          onClose={() => setDraftPreview(null)}
        />
      ) : null}
    </AdminLayout>
  );
}
