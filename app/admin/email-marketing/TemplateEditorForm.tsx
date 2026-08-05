"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import CmsImageField from "../website/CmsImageField";
import marketingService, {
  type CampaignTemplateInput,
} from "../../services/marketingService";
import { field } from "./emailMarketingUtils";

type TemplateEditorFormProps = {
  form: CampaignTemplateInput;
  editingTemplateId: string | null;
  saving: boolean;
  onChange: (next: CampaignTemplateInput) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function TemplateEditorForm({
  form,
  editingTemplateId,
  saving,
  onChange,
  onSave,
  onCancel,
}: TemplateEditorFormProps) {
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.headline.trim() || !form.body.trim()) {
      setPreviewHtml("");
      setPreviewSubject("");
      setPreviewError(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
        const response = await marketingService.previewTemplate({
          name: form.name || "Draft",
          headline: form.headline,
          body: form.body,
          heroImageUrl: form.heroImageUrl || undefined,
          secondaryImageUrl: form.secondaryImageUrl || undefined,
          ctaLabel: form.ctaLabel || undefined,
          ctaUrl: form.ctaUrl || undefined,
          footerNote: form.footerNote || undefined,
          subject: form.headline,
          customerName: "Anita",
          skinId: "oven_classic",
        });
        if (!active) return;
        if (response.success) {
          setPreviewHtml(response.data.html);
          setPreviewSubject(response.data.subject);
        } else {
          setPreviewError(response.message || "Preview failed");
        }
      } catch (err: unknown) {
        if (!active) return;
        const status =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { status?: number; data?: { message?: string } } }).response
                ?.status
            : undefined;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        if (status === 404 || message === "Route not found") {
          setPreviewError(
            "Preview API is unavailable on this backend. Redeploy the bakery backend with marketing template routes, then try again."
          );
        } else {
          setPreviewError(message || "Preview failed");
        }
      } finally {
        if (active) setPreviewLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form]);

  return (
    <div className="rounded-lg border border-[#b9aca2]/60 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-[#222222]">
          {editingTemplateId ? "Edit template" : "Create template"}
        </h3>
        <button type="button" onClick={onCancel} className="p-1 text-[#5d6043]" aria-label="Close">
          <AdminIcon icon={Cancel01Icon} size={20} />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className="text-sm font-semibold text-[#5d6043]">
              Template name
              <input
                className={`${field} mt-1`}
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder="Weekend special"
              />
            </label>
            <label className="text-sm font-semibold text-[#5d6043]">
              Headline
              <input
                className={`${field} mt-1`}
                value={form.headline}
                onChange={(e) => onChange({ ...form, headline: e.target.value })}
                placeholder="Fresh from the oven this weekend"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#5d6043]">
            Body
            <textarea
              className={`${field} mt-1 resize-y`}
              rows={5}
              value={form.body}
              onChange={(e) => onChange({ ...form, body: e.target.value })}
              placeholder={"Hello {{customerName}},\n\nThis weekend we're baking..."}
            />
            <span className="mt-1 block text-xs font-normal">
              Use {"{{customerName}}"} for personalization.
            </span>
          </label>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <CmsImageField
              label="Hero image"
              value={form.heroImageUrl}
              onChange={(url) => onChange({ ...form, heroImageUrl: url })}
            />
            <CmsImageField
              label="Secondary image (optional)"
              value={form.secondaryImageUrl}
              onChange={(url) => onChange({ ...form, secondaryImageUrl: url })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label className="text-sm font-semibold text-[#5d6043]">
              CTA label
              <input
                className={`${field} mt-1`}
                value={form.ctaLabel}
                onChange={(e) => onChange({ ...form, ctaLabel: e.target.value })}
                placeholder="Order now"
              />
            </label>
            <label className="text-sm font-semibold text-[#5d6043]">
              CTA URL
              <input
                className={`${field} mt-1`}
                value={form.ctaUrl}
                onChange={(e) => onChange({ ...form, ctaUrl: e.target.value })}
                placeholder="https://cozyoven.store"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-[#5d6043]">
            Footer note (optional)
            <input
              className={`${field} mt-1`}
              value={form.footerNote}
              onChange={(e) => onChange({ ...form, footerNote: e.target.value })}
              placeholder="Reply to this email with questions."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] disabled:opacity-50"
            >
              {saving ? (
                <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
              ) : null}
              {editingTemplateId ? "Save template" : "Create template"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043]"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[#b9aca2]/60 bg-[#faf9f5] p-3 lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#222222]">Live preview</p>
            {previewLoading ? (
              <AdminIcon icon={Loading03Icon} size={16} className="animate-spin text-[#5d6043]" />
            ) : null}
          </div>
          {previewError ? (
            <p className="text-sm text-red-600">{previewError}</p>
          ) : previewSubject ? (
            <p className="mb-2 text-xs text-[#5d6043]">Subject: {previewSubject}</p>
          ) : null}
          {previewHtml ? (
            <iframe
              title="Template preview"
              srcDoc={previewHtml}
              className="h-[min(560px,65vh)] w-full rounded border border-[#b9aca2]/40 bg-white"
            />
          ) : (
            <p className="p-4 text-sm text-[#5d6043]">
              Add a headline and body to see a live preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
