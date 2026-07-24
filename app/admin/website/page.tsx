"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Edit2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import WebsiteTabs from "./WebsiteTabs";
import CmsImageField from "./CmsImageField";
import cmsService, {
  HomepageSection,
  HomepageSectionContent,
  HomepageSectionType,
  SECTION_LABELS,
} from "../../services/cmsService";

const FIELD_MAP: Record<HomepageSectionType, Array<keyof HomepageSectionContent>> = {
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
  imageUrl: "Image",
  productId: "Product ID",
  categoryFilter: "Category",
  message: "Message",
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
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState<HomepageSectionContent>({});

  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [sections]
  );

  const editing = sorted.find((section) => section.id === editingId) || null;

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cmsService.getAdminHomepage();
      setSections(data.sections || []);
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

  const move = (id: string, direction: -1 | 1) => {
    const list = [...sorted];
    const index = list.findIndex((section) => section.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    const swap = list[index];
    list[index] = list[next];
    list[next] = swap;
    setSections(renumber(list));
    setSuccess("");
  };

  const toggleEnabled = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
    setSuccess("");
  };

  const openEdit = (section: HomepageSection) => {
    setEditingId(section.id);
    setDraftContent({ ...(section.content || {}) });
    setError("");
    setSuccess("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    setSections((prev) =>
      prev.map((section) =>
        section.id === editingId ? { ...section, content: { ...draftContent } } : section
      )
    );
    setEditingId(null);
    setDraftContent({});
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError("");
      const data = await cmsService.saveAdminHomepage(renumber(sorted));
      setSections(data.sections || []);
      setSuccess("Saved");
    } catch (err) {
      console.error(err);
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
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
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition hover:bg-[#222222] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
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
        ) : (
          <div className="space-y-3">
            {sorted.map((section, index) => (
              <article
                key={section.id}
                className="flex flex-col gap-3 rounded-xl border border-[#b9aca2]/50 bg-[#faf9f5] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
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
                    className="rounded-lg border border-[#b9aca2] px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(section.id, 1)}
                    disabled={index === sorted.length - 1}
                    className="rounded-lg border border-[#b9aca2] px-3 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEnabled(section.id)}
                    className="rounded-lg border border-[#b9aca2] p-2 hover:bg-white"
                    aria-label={section.enabled ? "Hide" : "Show"}
                  >
                    {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(section)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm hover:bg-white"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
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

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
