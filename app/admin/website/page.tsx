"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import WebsiteTabs from "./WebsiteTabs";
import CmsImageField from "./CmsImageField";
import CmsProductPicker from "./CmsProductPicker";
import CmsDraftPreviewModal from "./CmsDraftPreviewModal";
import PublishChecklistModal, {
  type PublishChecklistItem,
} from "./PublishChecklistModal";
import cmsService, {
  HOMEPAGE_SECTION_TYPES,
  HomepageSection,
  HomepageSectionContent,
  HomepageSectionType,
  HomepageVersion,
  SECTION_LABELS,
  createBlankHomepageSection,
  type CmsPageSection,
} from "../../services/cmsService";

const FIELD_MAP: Record<HomepageSectionType, Array<keyof HomepageSectionContent>> = {
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
  productStrip: ["headline", "body", "ctaLabel", "ctaHref", "categoryFilter"],
  faq: ["headline", "body"],
  newsletter: ["headline", "body", "ctaLabel"],
};

const FIELD_LABELS: Partial<Record<keyof HomepageSectionContent, string>> = {
  eyebrow: "Eyebrow",
  headline: "Headline",
  body: "Text",
  ctaLabel: "Button",
  ctaHref: "Button link",
  secondaryCtaLabel: "2nd button",
  secondaryCtaHref: "2nd link",
  imageUrl: "Thumbnail / icon",
  productId: "Product thumbnail",
  categoryFilter: "Category",
  message: "Promo text (keep short)",
  tone: "Style",
  startsAt: "Starts",
  endsAt: "Ends",
};

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default function AdminWebsiteHomePage() {
  const [draftSections, setDraftSections] = useState<HomepageSection[]>([]);
  const [publishedSections, setPublishedSections] = useState<HomepageSection[]>([]);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<HomepageSectionContent>({});
  const [showCatalog, setShowCatalog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<HomepageVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [draftPreview, setDraftPreview] = useState<
    null | { mode: "page" } | { mode: "section"; sectionId: string }
  >(null);
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);

  const sorted = useMemo(
    () => [...draftSections].sort((a, b) => a.sortOrder - b.sortOrder),
    [draftSections]
  );

  const editing = sorted.find((section) => section.id === editingId) || null;

  const sectionsForPreview = useMemo(() => {
    const list = !editingId
      ? sorted
      : sorted.map((section) =>
          section.id === editingId
            ? { ...section, content: { ...draftContent } }
            : section
        );
    return list as unknown as CmsPageSection[];
  }, [sorted, editingId, draftContent]);

  const applyConfig = (data: {
    sections?: HomepageSection[];
    draftSections?: HomepageSection[];
    hasUnpublishedChanges?: boolean;
  }) => {
    const published = data.sections || [];
    const draft =
      data.draftSections?.length ? data.draftSections : published;
    setPublishedSections(published);
    setDraftSections(draft);
    setHasUnpublishedChanges(
      typeof data.hasUnpublishedChanges === "boolean"
        ? data.hasUnpublishedChanges
        : JSON.stringify(published) !== JSON.stringify(draft)
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cmsService.getAdminHomepage();
      applyConfig(data);
    } catch (err) {
      console.error(err);
      setError("Could not load homepage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renumber = (list: HomepageSection[]) =>
    list.map((section, index) => ({ ...section, sortOrder: index }));

  const applyDraft = (list: HomepageSection[]) => {
    setDraftSections(renumber(list));
    setHasUnpublishedChanges(true);
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
    applyDraft(list);
  };

  const toggleEnabled = (id: string) => {
    applyDraft(
      sorted.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const removeSection = (id: string) => {
    if (!window.confirm("Remove this section?")) return;
    applyDraft(sorted.filter((section) => section.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraftContent({});
    }
  };

  const addSection = (type: HomepageSectionType) => {
    const next = [...sorted, createBlankHomepageSection(type, sorted.length)];
    applyDraft(next);
    setShowCatalog(false);
    const added = next[next.length - 1];
    setEditingId(added.id);
    setDraftContent({ ...(added.content || {}) });
  };

  const openEdit = (section: HomepageSection) => {
    setEditingId(section.id);
    setDraftContent({ ...(section.content || {}) });
    setError("");
    setSuccess("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    applyDraft(
      sorted.map((section) =>
        section.id === editingId
          ? { ...section, content: { ...draftContent } }
          : section
      )
    );
    setEditingId(null);
    setDraftContent({});
  };

  const currentDraftPayload = () => {
    const withEdit = editingId
      ? sorted.map((section) =>
          section.id === editingId
            ? { ...section, content: { ...draftContent } }
            : section
        )
      : sorted;
    return renumber(withEdit);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError("");
      const data = await cmsService.saveAdminHomepageDraft(currentDraftPayload());
      applyConfig(data);
      setEditingId(null);
      setDraftContent({});
      setSuccess("Draft saved — not live yet");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const getPublishChecklistItems = (): PublishChecklistItem[] => {
    const payload = currentDraftPayload();
    const promo = payload.find((section) => section.type === "promoBanner");
    const promoOn = promo?.enabled !== false;
    const promoMessage = String(promo?.content?.message || "").trim();
    const promoNeedsCta = promoOn && Boolean(promoMessage);
    const promoHasCta = Boolean(
      String(promo?.content?.ctaLabel || "").trim() &&
        String(promo?.content?.ctaHref || "").trim()
    );
    const enabledCount = payload.filter((section) => section.enabled !== false).length;

    return [
      {
        id: "sections",
        label: "At least one section is on",
        ok: enabledCount > 0,
        hint: enabledCount ? undefined : "Turn on a section with the eye icon.",
      },
      {
        id: "promo-message",
        label: promoOn ? "Promo message is filled (or turn promo off)" : "Promo is off",
        ok: !promoOn || Boolean(promoMessage),
        hint: "Promo is on but empty — visitors won’t see it.",
      },
      {
        id: "promo-cta",
        label: promoNeedsCta
          ? "Promo has a button label + link"
          : "Promo button (optional)",
        ok: !promoNeedsCta || promoHasCta,
        hint: "Add a short button and link, e.g. Shop → /shop",
      },
    ];
  };

  const openPublishChecklist = () => {
    setShowPublishChecklist(true);
  };

  const confirmPublish = async () => {
    try {
      setPublishing(true);
      setError("");
      const data = await cmsService.publishAdminHomepage(currentDraftPayload());
      applyConfig(data);
      setEditingId(null);
      setDraftContent({});
      setShowPublishChecklist(false);
      setSuccess("Published");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  const openHistory = async () => {
    setShowHistory(true);
    setError("");
    try {
      setHistoryLoading(true);
      setVersions(await cmsService.listAdminHomepageVersions());
    } catch (err) {
      console.error(err);
      setError("Could not load history.");
      setShowHistory(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestore = async (version: HomepageVersion) => {
    const when = new Date(version.savedAt).toLocaleString();
    if (
      !window.confirm(
        `Restore the live homepage from ${when}? Current live content is saved in history first.`
      )
    ) {
      return;
    }
    try {
      setRestoringId(version.id);
      setError("");
      const data = await cmsService.restoreAdminHomepageVersion(version.id);
      applyConfig(data);
      setSuccess("Restored and published");
      setShowHistory(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Restore failed.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Website</h1>
            <div className="mt-3">
              <WebsiteTabs />
            </div>
            <p className="mt-2 text-sm text-[#5d6043]">
              Edit a draft, preview it, then publish when ready.
              {publishedSections.length ? (
                <>
                  {" "}
                  Live site has {publishedSections.length} section
                  {publishedSections.length === 1 ? "" : "s"}.
                </>
              ) : null}
            </p>
            {hasUnpublishedChanges ? (
              <p className="mt-2 inline-flex rounded-full bg-[#bd6325]/15 px-3 py-1 text-xs font-semibold text-[#bd6325]">
                Draft has unpublished changes
              </p>
            ) : (
              <p className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Draft matches live
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraftPreview({ mode: "page" })}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            >
              <Eye className="h-4 w-4" />
              Preview draft
            </button>
            <button
              type="button"
              onClick={openHistory}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => setShowCatalog((prev) => !prev)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            >
              <Plus className="h-4 w-4" />
              Add section
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || publishing || loading}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#5d6043] px-4 py-2 text-sm text-[#5d6043] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save draft
            </button>
            <button
              type="button"
              onClick={openPublishChecklist}
              disabled={saving || publishing || loading}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5] disabled:opacity-60"
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Publish
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
          <div className="grid max-h-[70vh] gap-2 overflow-y-auto rounded-xl border border-[#b9aca2]/60 bg-[#faf9f5] p-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOMEPAGE_SECTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="min-h-11 rounded-lg border border-[#b9aca2]/50 bg-white px-3 py-2 text-left text-sm text-[#5d6043] hover:bg-[#eeeae0]"
              >
                {SECTION_LABELS[type]}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9aca2] bg-[#faf9f5] px-6 py-12 text-center text-[#5d6043]">
            No sections yet. Add one from the catalog.
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((section, index) => (
              <article
                key={section.id}
                className="rounded-xl border border-[#b9aca2]/50 bg-[#faf9f5] p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#222222]">
                        {SECTION_LABELS[section.type] || section.type}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          section.enabled
                            ? "bg-green-50 text-green-700"
                            : "bg-[#b9aca2]/40 text-[#5d6043]"
                        }`}
                      >
                        {section.enabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[#5d6043]">
                      {section.content?.headline ||
                        section.content?.message ||
                        section.content?.body ||
                        "—"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => move(section.id, -1)}
                      disabled={index === 0}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(section.id, 1)}
                      disabled={index === sorted.length - 1}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPreview({ mode: "section", sectionId: section.id })
                      }
                      className="min-h-10 rounded-lg border border-[#b9aca2] px-3 py-2 text-xs font-medium text-[#5d6043] hover:bg-white"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleEnabled(section.id)}
                      className="min-h-10 min-w-10 rounded-lg border border-[#b9aca2] p-2 hover:bg-white"
                      aria-label={section.enabled ? "Hide" : "Show"}
                    >
                      {section.enabled ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(section)}
                      className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm hover:bg-white"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="min-h-10 min-w-10 rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf9f5] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#222222]">
                {SECTION_LABELS[editing.type]}
              </h3>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-full p-2 hover:bg-[#b9aca2]/30"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {FIELD_MAP[editing.type].map((field) => {
                const label = FIELD_LABELS[field] || field;
                const isLong = field === "body" || field === "message";
                const isDate = field === "startsAt" || field === "endsAt";
                const value = draftContent[field];

                if (isDate) {
                  return (
                    <label key={field} className="block text-sm text-[#5d6043]">
                      {label}
                      <input
                        type="datetime-local"
                        value={toDateInputValue(typeof value === "string" ? value : null)}
                        onChange={(e) =>
                          setDraftContent((prev) => ({
                            ...prev,
                            [field]: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                      />
                    </label>
                  );
                }

                if (field === "imageUrl") {
                  return (
                    <CmsImageField
                      key={field}
                      label={label}
                      value={typeof value === "string" ? value : ""}
                      onChange={(url) =>
                        setDraftContent((prev) => ({ ...prev, imageUrl: url }))
                      }
                    />
                  );
                }

                if (field === "productId") {
                  return (
                    <CmsProductPicker
                      key={field}
                      label="Product thumbnail (optional)"
                      maxSelections={1}
                      selectedIds={
                        draftContent.productId ? [String(draftContent.productId)] : []
                      }
                      onChange={(ids) =>
                        setDraftContent((prev) => ({
                          ...prev,
                          productId: ids[0] || "",
                        }))
                      }
                    />
                  );
                }

                if (field === "tone") {
                  return (
                    <label key={field} className="block text-sm text-[#5d6043]">
                      {label}
                      <select
                        value={String(value || "sale")}
                        onChange={(e) =>
                          setDraftContent((prev) => ({ ...prev, tone: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                      >
                        <option value="sale">Sale (terracotta)</option>
                        <option value="seasonal">Seasonal (olive)</option>
                        <option value="announcement">Announcement (cream)</option>
                      </select>
                    </label>
                  );
                }

                if (isLong) {
                  return (
                    <label key={field} className="block text-sm text-[#5d6043]">
                      {label}
                      <textarea
                        rows={4}
                        value={String(value || "")}
                        onChange={(e) =>
                          setDraftContent((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                      />
                    </label>
                  );
                }

                return (
                  <label key={field} className="block text-sm text-[#5d6043]">
                    {label}
                    <input
                      type="text"
                      value={String(value || "")}
                      onChange={(e) =>
                        setDraftContent((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-[#b9aca2] px-3 py-2 text-[#222222]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="min-h-10 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraftPreview({ mode: "section", sectionId: editing.id })
                }
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="min-h-10 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {draftPreview ? (
        <CmsDraftPreviewModal
          title="Homepage draft preview"
          subtitle="Preview uses the page renderer — layout may differ slightly from the live home."
          sections={sectionsForPreview}
          sectionId={
            draftPreview.mode === "section" ? draftPreview.sectionId : null
          }
          onClose={() => setDraftPreview(null)}
        />
      ) : null}

      {showPublishChecklist ? (
        <PublishChecklistModal
          title="Publish homepage?"
          items={getPublishChecklistItems()}
          busy={publishing}
          onCancel={() => setShowPublishChecklist(false)}
          onConfirm={confirmPublish}
        />
      ) : null}

      {showHistory ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf9f5] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#222222]">History</h2>
                <p className="mt-1 text-sm text-[#5d6043]">
                  Last {versions.length || 10} published versions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded-lg p-2 hover:bg-[#eeeae0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#5d6043]" />
              </div>
            ) : versions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-8 text-center text-sm text-[#5d6043]">
                No older versions yet. History starts after the next publish.
              </p>
            ) : (
              <ul className="space-y-2">
                {versions.map((version) => (
                  <li
                    key={version.id}
                    className="flex flex-col gap-2 rounded-xl border border-[#b9aca2]/60 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#222222]">
                        {new Date(version.savedAt).toLocaleString()}
                      </p>
                      <p className="truncate text-xs text-[#5d6043]">
                        {version.label || "Snapshot"}
                        {Array.isArray(version.snapshot?.sections)
                          ? ` · ${version.snapshot.sections.length} sections`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(version)}
                      disabled={restoringId === version.id}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5] disabled:opacity-60"
                    >
                      {restoringId === version.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
