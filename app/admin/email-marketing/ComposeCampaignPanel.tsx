"use client";

import { Loading03Icon, Mail01Icon, SentIcon } from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { CampaignTemplate } from "../../services/marketingService";
import { field } from "./emailMarketingUtils";

type ComposeCampaignPanelProps = {
  selectedTemplate: CampaignTemplate | null;
  subject: string;
  message: string;
  previewHtml: string;
  previewSubject: string;
  previewLoading: boolean;
  selectedCount: number;
  sending: boolean;
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
};

export default function ComposeCampaignPanel({
  selectedTemplate,
  subject,
  message,
  previewHtml,
  previewSubject,
  previewLoading,
  selectedCount,
  sending,
  onSubjectChange,
  onMessageChange,
  onSend,
}: ComposeCampaignPanelProps) {
  return (
    <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
          <AdminIcon icon={Mail01Icon} size={20} />
          Compose &amp; send
        </h2>
        <p className="text-sm text-[#5d6043]">
          Using template{" "}
          <span className="font-semibold text-[#222222]">
            {selectedTemplate?.name || "—"}
          </span>
          . Adjust subject or body for this send, preview, then send to {selectedCount} recipient
          {selectedCount === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5d6043]">Subject</label>
            <input
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
              placeholder="Fresh treats from Cozy Oven"
              className={field}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#5d6043]">
              Body override (optional)
            </label>
            <textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              rows={12}
              placeholder="Leave as template body, or override for this send..."
              className={`${field} resize-y`}
            />
            <p className="mt-1 text-xs text-[#5d6043]">
              Use {"{{customerName}}"} for personalization.
            </p>
          </div>
          <div className="rounded-lg border border-[#b9aca2]/40 bg-white p-4 text-sm text-[#5d6043]">
            Sending to <span className="font-bold text-[#222222]">{selectedCount}</span> recipient
            {selectedCount === 1 ? "" : "s"} with template{" "}
            <span className="font-semibold text-[#222222]">
              {selectedTemplate?.name || "none"}
            </span>
            .
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={
              sending || selectedCount === 0 || !selectedTemplate || !subject.trim()
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-3 font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
          >
            {sending ? (
              <AdminIcon icon={Loading03Icon} size={20} className="animate-spin" />
            ) : (
              <AdminIcon icon={SentIcon} size={20} />
            )}
            {sending ? "Sending..." : "Send campaign"}
          </button>
        </div>

        <div className="rounded-lg border border-[#b9aca2]/60 bg-white p-3 lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#222222]">Preview</p>
            {previewLoading ? (
              <AdminIcon icon={Loading03Icon} size={16} className="animate-spin text-[#5d6043]" />
            ) : null}
          </div>
          {previewSubject ? (
            <p className="mb-2 text-xs text-[#5d6043]">Subject: {previewSubject}</p>
          ) : null}
          {previewHtml ? (
            <iframe
              title="Campaign preview"
              srcDoc={previewHtml}
              className="h-[min(640px,70vh)] w-full rounded border border-[#b9aca2]/40 bg-white"
            />
          ) : (
            <p className="p-6 text-sm text-[#5d6043]">Preview will appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
}
