"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import WebsiteTabs from "../WebsiteTabs";
import cmsService, {
  CmsPage,
  CmsPageInput,
  CmsPageTemplate,
  PAGE_TEMPLATE_LABELS,
} from "../../../services/cmsService";

const emptyForm = (): CmsPageInput => ({
  title: "",
  slug: "",
  template: "simple",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  content: {
    headline: "",
    body: "",
    imageUrl: "",
    ctaLabel: "",
    ctaHref: "",
    productIds: [],
    showOnSaleProducts: false,
  },
  publishAt: "",
  unpublishAt: "",
});

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export default function AdminWebsitePagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CmsPageInput>(emptyForm());

  const sorted = useMemo(
    () => [...pages].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))),
    [pages]
  );

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
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (page: CmsPage) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      template: page.template,
      status: page.status,
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      content: {
        headline: page.content?.headline || "",
        body: page.content?.body || "",
        imageUrl: page.content?.imageUrl || "",
        ctaLabel: page.content?.ctaLabel || "",
        ctaHref: page.content?.ctaHref || "",
        productIds: page.content?.productIds || [],
        showOnSaleProducts: page.content?.showOnSaleProducts === true,
      },
      publishAt: toDateInputValue(page.publishAt),
      unpublishAt: toDateInputValue(page.unpublishAt),
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const productIdsRaw = (form.content as { productIds?: string[] | string }).productIds;
      const productIds = Array.isArray(productIdsRaw)
        ? productIdsRaw.map((id) => String(id).trim()).filter(Boolean)
        : String(productIdsRaw || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

      const payload: CmsPageInput = {
        ...form,
        slug: form.slug || undefined,
        publishAt: form.publishAt || null,
        unpublishAt: form.unpublishAt || null,
        content: {
          ...form.content,
          productIds,
        },
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

  const setContent = (key: keyof CmsPage["content"], value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }));
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
                      {PAGE_TEMPLATE_LABELS[page.template]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5d6043]">/pages/{page.slug}</p>
                </div>
                <div className="flex gap-2">
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#faf9f5] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#222222]">
                {editingId ? "Edit page" : "New page"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 hover:bg-[#eeeae0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Slug</span>
                  <input
                    value={form.slug || ""}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto from title"
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Template</span>
                  <select
                    value={form.template}
                    onChange={(e) =>
                      setForm({ ...form, template: e.target.value as CmsPageTemplate })
                    }
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  >
                    {(Object.keys(PAGE_TEMPLATE_LABELS) as CmsPageTemplate[]).map((key) => (
                      <option key={key} value={key}>
                        {PAGE_TEMPLATE_LABELS[key]}
                      </option>
                    ))}
                  </select>
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
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#5d6043]">Headline</span>
                <input
                  value={form.content.headline || ""}
                  onChange={(e) => setContent("headline", e.target.value)}
                  className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#5d6043]">Body</span>
                <textarea
                  rows={5}
                  value={form.content.body || ""}
                  onChange={(e) => setContent("body", e.target.value)}
                  className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Image URL</span>
                  <input
                    value={form.content.imageUrl || ""}
                    onChange={(e) => setContent("imageUrl", e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Product IDs</span>
                  <input
                    value={(form.content.productIds || []).join(", ")}
                    onChange={(e) => setContent("productIds", e.target.value as any)}
                    placeholder="id1, id2"
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Button</span>
                  <input
                    value={form.content.ctaLabel || ""}
                    onChange={(e) => setContent("ctaLabel", e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold text-[#5d6043]">Button link</span>
                  <input
                    value={form.content.ctaHref || ""}
                    onChange={(e) => setContent("ctaHref", e.target.value)}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
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
                  <span className="mb-1 block font-semibold text-[#5d6043]">SEO description</span>
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
                  <span className="mb-1 block font-semibold text-[#5d6043]">Unpublish at</span>
                  <input
                    type="datetime-local"
                    value={form.unpublishAt || ""}
                    onChange={(e) => setForm({ ...form, unpublishAt: e.target.value })}
                    className="w-full rounded-lg border border-[#b9aca2] px-3 py-2"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#5d6043]">
                <input
                  type="checkbox"
                  checked={form.content.showOnSaleProducts === true}
                  onChange={(e) => setContent("showOnSaleProducts", e.target.checked)}
                />
                Show on-sale products
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043]"
                >
                  Cancel
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
    </AdminLayout>
  );
}
