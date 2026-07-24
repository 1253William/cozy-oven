"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import WebsiteTabs from "../WebsiteTabs";
import CmsImageField from "../CmsImageField";
import CmsProductPicker from "../CmsProductPicker";
import CmsDraftPreviewModal from "../CmsDraftPreviewModal";
import cmsService, {
  CMS_PAGE_SECTION_TYPES,
  CmsPage,
  CmsPageInput,
  CmsPageSection,
  CmsPageSectionContent,
  CmsPageSectionType,
  CmsPageTemplate,
  CmsPageVersion,
  PAGE_SECTION_FIELD_MAP,
  PAGE_SECTION_LABELS,
  PAGE_TEMPLATE_LABELS,
  createBlankPageSection,
  presetPageSections,
} from "../../../services/cmsService";

const emptyForm = (): CmsPageInput => ({
  title: "",
  slug: "",
  template: "simple",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  content: {},
  sections: presetPageSections("simple"),
  publishAt: "",
  unpublishAt: "",
});

const FIELD_LABELS: Partial<Record<keyof CmsPageSectionContent, string>> = {
  eyebrow: "Eyebrow",
  headline: "Headline",
  body: "Text",
  ctaLabel: "Button / name",
  ctaHref: "Button link",
  secondaryCtaLabel: "Subtitle / 2nd label",
  secondaryCtaHref: "2nd link",
  imageUrl: "Image",
  productId: "Product ID",
  productIds: "Products",
  categoryFilter: "Category filter",
  message: "Promo text",
  startsAt: "Starts",
  endsAt: "Ends",
  items: "Items (one per line)",
  imagePosition: "Image side",
  showOnSaleProducts: "Show on-sale products",
};

const normalizeSlug = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const pagePublicPath = (slug: string) => `/pages/${slug}`;

export default function AdminWebsitePagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CmsPageInput>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [historyPage, setHistoryPage] = useState<CmsPage | null>(null);
  const [versions, setVersions] = useState<CmsPageVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<CmsPageSectionContent>({});
  const [draftPreview, setDraftPreview] = useState<
    null | { mode: "page" } | { mode: "section"; sectionId: string }
  >(null);

  const sorted = useMemo(
    () =>
      [...pages].sort((a, b) =>
        String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
      ),
    [pages]
  );

  const formSections = useMemo(
    () => [...(form.sections || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [form.sections]
  );

  const editingSection =
    formSections.find((section) => section.id === editingSectionId) || null;

  /** Current form sections with in-progress edit draft applied. */
  const sectionsForPreview = useMemo(() => {
    if (!editingSectionId) return formSections;
    return formSections.map((section) =>
      section.id === editingSectionId
        ? {
            ...section,
            content: {
              ...draftContent,
              items: Array.isArray(draftContent.items)
                ? draftContent.items.map((item) => String(item).trim()).filter(Boolean)
                : draftContent.items,
              productIds: Array.isArray(draftContent.productIds)
                ? draftContent.productIds.map((id) => String(id).trim()).filter(Boolean)
                : draftContent.productIds,
            },
          }
        : section
    );
  }, [formSections, editingSectionId, draftContent]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cmsService.listAdminPages();
      setPages(data);
    } catch (err) {
      console.error(err);
      setError("Could not load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setShowForm(true);
    setShowCatalog(false);
    setEditingSectionId(null);
    setError("");
    setSuccess("");
  };

  const openEdit = (page: CmsPage) => {
    setEditingId(page.id);
    setSlugTouched(true);
    setForm({
      title: page.title,
      slug: page.slug,
      template: page.template,
      status: page.status,
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      content: page.content || {},
      sections:
        Array.isArray(page.sections) && page.sections.length > 0
          ? page.sections
          : presetPageSections(page.template),
      publishAt: toDateInputValue(page.publishAt),
      unpublishAt: toDateInputValue(page.unpublishAt),
    });
    setShowForm(true);
    setShowCatalog(false);
    setEditingSectionId(null);
    setError("");
    setSuccess("");
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : normalizeSlug(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: normalizeSlug(slug) }));
  };

  const applyPreset = (template: CmsPageTemplate) => {
    setForm((prev) => ({
      ...prev,
      template,
      sections: presetPageSections(template),
    }));
    setEditingSectionId(null);
    setShowCatalog(false);
  };

  const renumber = (list: CmsPageSection[]) =>
    list.map((section, index) => ({ ...section, sortOrder: index }));

  const setSections = (list: CmsPageSection[]) => {
    setForm((prev) => ({ ...prev, sections: renumber(list) }));
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const list = [...formSections];
    const index = list.findIndex((section) => section.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    const swap = list[index];
    list[index] = list[next];
    list[next] = swap;
    setSections(list);
  };

  const toggleSection = (id: string) => {
    setSections(
      formSections.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const removeSection = (id: string) => {
    if (!window.confirm("Remove this section?")) return;
    setSections(formSections.filter((section) => section.id !== id));
    if (editingSectionId === id) {
      setEditingSectionId(null);
      setDraftContent({});
    }
  };

  const addSection = (type: CmsPageSectionType) => {
    const next = [...formSections, createBlankPageSection(type, formSections.length)];
    setSections(next);
    setShowCatalog(false);
    const added = next[next.length - 1];
    setEditingSectionId(added.id);
    setDraftContent({ ...(added.content || {}) });
  };

  const openSectionEdit = (section: CmsPageSection) => {
    setEditingSectionId(section.id);
    setDraftContent({ ...(section.content || {}) });
  };

  const saveSectionEdit = () => {
    if (!editingSectionId) return;
    setSections(
      formSections.map((section) =>
        section.id === editingSectionId
          ? { ...section, content: { ...draftContent } }
          : section
      )
    );
    setEditingSectionId(null);
    setDraftContent({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const withDraft = editingSectionId
        ? formSections.map((section) =>
            section.id === editingSectionId
              ? { ...section, content: { ...draftContent } }
              : section
          )
        : formSections;

      const sections = renumber(
        withDraft.map((section) => ({
          ...section,
          content: {
            ...section.content,
            productIds: Array.isArray(section.content.productIds)
              ? section.content.productIds.map((id) => String(id).trim()).filter(Boolean)
              : section.content.productIds,
            items: Array.isArray(section.content.items)
              ? section.content.items.map((item) => String(item).trim()).filter(Boolean)
              : section.content.items,
          },
        }))
      );

      const payload: CmsPageInput = {
        ...form,
        slug: form.slug || normalizeSlug(form.title) || undefined,
        publishAt: form.publishAt || null,
        unpublishAt: form.unpublishAt || null,
        content: form.content || {},
        sections,
      };

      if (editingId) {
        await cmsService.updateAdminPage(editingId, payload);
        setSuccess("Saved");
      } else {
        await cmsService.createAdminPage(payload);
        setSuccess("Created");
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: CmsPage) => {
    if (!window.confirm(`Delete “${page.title}”?`)) return;
    try {
      await cmsService.deleteAdminPage(page.id);
      setSuccess("Deleted");
      await load();
    } catch (err) {
      console.error(err);
      setError("Delete failed.");
    }
  };

  const copyLink = async (page: CmsPage) => {
    try {
      const url = `${window.location.origin}${pagePublicPath(page.slug)}`;
      await navigator.clipboard.writeText(url);
      setSuccess("Link copied");
    } catch {
      setError("Could not copy link.");
    }
  };

  const openPreview = (page: CmsPage) => {
    window.open(`/admin/website/pages/preview/${page.id}`, "_blank", "noopener,noreferrer");
  };

  const openHistory = async (page: CmsPage) => {
    setHistoryPage(page);
    setVersions([]);
    setError("");
    try {
      setHistoryLoading(true);
      const data = await cmsService.listAdminPageVersions(page.id);
      setVersions(data);
    } catch (err) {
      console.error(err);
      setError("Could not load history.");
      setHistoryPage(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestore = async (version: CmsPageVersion) => {
    if (!historyPage) return;
    const when = new Date(version.savedAt).toLocaleString();
    if (
      !window.confirm(
        `Restore this version from ${when}? Your current page will be saved in history first.`
      )
    ) {
      return;
    }
    try {
      setRestoringId(version.id);
      setError("");
      await cmsService.restoreAdminPageVersion(historyPage.id, version.id);
      setSuccess("Restored");
      setHistoryPage(null);
      await load();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Restore failed.");
    } finally {
      setRestoringId(null);
    }
  };

  const renderSectionField = (field: keyof CmsPageSectionContent) => {
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
    if (field === "showOnSaleProducts") {
      return (
        <label key={field} className="flex items-center gap-2 text-sm text-[#5d6043]">
          <input
            type="checkbox"
            checked={draftContent.showOnSaleProducts === true}
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
                imagePosition: e.target.value === "right" ? "right" : "left",
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
    if (field === "body") {
      return (
        <label key={field} className="block text-sm">
          <span className="mb-1 block font-semibold text-[#5d6043]">
            {FIELD_LABELS[field]}
          </span>
          <textarea
            rows={4}
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
                [field]: e.target.value || null,
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
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition hover:bg-[#222222]"
          >
            <Plus className="h-4 w-4" />
            New page
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9aca2] bg-[#faf9f5] px-6 py-12 text-center text-[#5d6043]">
            No pages yet
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((page) => (
              <div
                key={page.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#222222]">{page.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        page.status === "published"
                          ? "bg-[#5d6043] text-[#faf9f5]"
                          : "bg-[#eeeae0] text-[#5d6043]"
                      }`}
                    >
                      {page.status}
                    </span>
                    <span className="rounded-full bg-[#eeeae0] px-2 py-0.5 text-xs text-[#5d6043]">
                      {PAGE_TEMPLATE_LABELS[page.template]} ·{" "}
                      {(page.sections || []).length} sections
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5d6043]">{pagePublicPath(page.slug)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(page)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => openPreview(page)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => openHistory(page)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                  >
                    History
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(page)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(page)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#faf9f5] p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#222222]">
                {editingId ? "Edit page" : "New page"}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDraftPreview({ mode: "page" })}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                >
                  <Eye className="h-4 w-4" />
                  Preview page
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 hover:bg-[#eeeae0]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Slug</span>
                  <input
                    value={form.slug || ""}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="auto from title"
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                  <span className="mt-1 block text-xs text-[#5d6043]">
                    Link: {pagePublicPath(form.slug || normalizeSlug(form.title) || "...")}
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">
                    Starter preset
                  </span>
                  <select
                    value={form.template}
                    onChange={(e) => applyPreset(e.target.value as CmsPageTemplate)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  >
                    {(Object.keys(PAGE_TEMPLATE_LABELS) as CmsPageTemplate[]).map((key) => (
                      <option key={key} value={key}>
                        {PAGE_TEMPLATE_LABELS[key]}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-[#5d6043]">
                    Changing preset replaces the current sections.
                  </span>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value === "published" ? "published" : "draft",
                      })
                    }
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">SEO title</span>
                  <input
                    value={form.seoTitle || ""}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">
                    SEO description
                  </span>
                  <input
                    value={form.seoDescription || ""}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Publish at</span>
                  <input
                    type="datetime-local"
                    value={form.publishAt || ""}
                    onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">
                    Unpublish at
                  </span>
                  <input
                    type="datetime-local"
                    value={form.unpublishAt || ""}
                    onChange={(e) => setForm({ ...form, unpublishAt: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
              </div>

              <div className="space-y-3 border-t border-[#b9aca2]/50 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#222222]">Sections</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftPreview({ mode: "page" })}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                    >
                      <Eye className="h-4 w-4" />
                      Preview page
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCatalog((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5]"
                    >
                      <Plus className="h-4 w-4" />
                      Add section
                    </button>
                  </div>
                </div>

                {showCatalog ? (
                  <div className="grid gap-2 rounded-xl border border-[#b9aca2]/60 bg-white p-3 sm:grid-cols-2">
                    {CMS_PAGE_SECTION_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addSection(type)}
                        className="rounded-lg border border-[#b9aca2]/50 px-3 py-2 text-left text-sm text-[#5d6043] hover:bg-[#eeeae0]"
                      >
                        {PAGE_SECTION_LABELS[type]}
                      </button>
                    ))}
                  </div>
                ) : null}

                {formSections.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-8 text-center text-sm text-[#5d6043]">
                    No sections yet. Add one from the catalog.
                  </p>
                ) : (
                  formSections.map((section, index) => (
                    <article
                      key={section.id}
                      className="rounded-xl border border-[#b9aca2]/50 bg-white p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-semibold text-[#222222]">
                            {PAGE_SECTION_LABELS[section.type]}
                          </h4>
                          <p className="text-xs text-[#5d6043]">
                            {section.enabled ? "On" : "Off"} · {section.type}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection(section.id, -1)}
                            disabled={index === 0}
                            className="rounded-lg border border-[#b9aca2] p-2 text-[#5d6043] disabled:opacity-40"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(section.id, 1)}
                            disabled={index === formSections.length - 1}
                            className="rounded-lg border border-[#b9aca2] p-2 text-[#5d6043] disabled:opacity-40"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDraftPreview({ mode: "section", sectionId: section.id })
                            }
                            className="rounded-lg border border-[#b9aca2] px-2 py-2 text-xs font-medium text-[#5d6043]"
                            aria-label="Preview section"
                            title="Preview section"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSection(section.id)}
                            className="rounded-lg border border-[#b9aca2] p-2 text-[#5d6043]"
                            aria-label="Toggle"
                            title={section.enabled ? "Hide on page" : "Show on page"}
                          >
                            {section.enabled ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openSectionEdit(section)}
                            className="rounded-lg border border-[#b9aca2] p-2 text-[#5d6043]"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            className="rounded-lg border border-red-200 p-2 text-red-700"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {editingSection?.id === section.id ? (
                        <div className="mt-4 space-y-3 border-t border-[#b9aca2]/40 pt-4">
                          {PAGE_SECTION_FIELD_MAP[section.type].map((field) =>
                            renderSectionField(field)
                          )}
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSectionId(null);
                                setDraftContent({});
                              }}
                              className="rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
                            >
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
                              className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={saveSectionEdit}
                              className="rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5]"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setDraftPreview({ mode: "page" })}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043]"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {draftPreview && (
        <CmsDraftPreviewModal
          title={form.title.trim() || (editingId ? "Page preview" : "New page preview")}
          subtitle={
            editingId
              ? "Live draft preview (includes unsaved edits)"
              : "New page preview — save when you’re happy with it"
          }
          sections={sectionsForPreview}
          sectionId={
            draftPreview.mode === "section" ? draftPreview.sectionId : null
          }
          onClose={() => setDraftPreview(null)}
        />
      )}

      {historyPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#faf9f5] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#222222]">History</h2>
                <p className="mt-1 text-sm text-[#5d6043]">
                  {historyPage.title} · last 10 saves
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryPage(null)}
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
                No older versions yet. History starts after the next save.
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
                        {version.snapshot.title} · {version.snapshot.status}
                        {version.label ? ` · ${version.label}` : ""}
                        {Array.isArray(version.snapshot.sections)
                          ? ` · ${version.snapshot.sections.length} sections`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(version)}
                      disabled={restoringId === version.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5] disabled:opacity-60"
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
      )}
    </AdminLayout>
  );
}
