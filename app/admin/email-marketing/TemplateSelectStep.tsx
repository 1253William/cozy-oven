"use client";

import Image from "next/image";
import Link from "next/link";
import { Loading03Icon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { CampaignTemplate } from "../../services/marketingService";

type TemplateSelectStepProps = {
  templates: CampaignTemplate[];
  loadingTemplates: boolean;
  templateId: string;
  onSelect: (id: string) => void;
};

export default function TemplateSelectStep({
  templates,
  loadingTemplates,
  templateId,
  onSelect,
}: TemplateSelectStepProps) {
  return (
    <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
          <AdminIcon icon={PaintBoardIcon} size={20} />
          Choose a template
        </h2>
        <p className="text-sm text-[#5d6043]">
          Pick the design for this send. Manage or create templates on the Templates tab.
        </p>
      </div>

      {loadingTemplates ? (
        <div className="flex items-center gap-2 text-sm text-[#5d6043]">
          <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#b9aca2] bg-white p-8 text-center">
          <p className="text-sm text-[#5d6043]">
            No templates yet. Create one with a hero image and headline first.
          </p>
          <Link
            href="/admin/email-marketing?tab=templates"
            className="mt-4 inline-flex rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222]"
          >
            Go to Templates
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const active = template._id === templateId;
            return (
              <button
                key={template._id}
                type="button"
                onClick={() => onSelect(template._id)}
                className={`overflow-hidden rounded-lg border bg-white text-left transition ${
                  active
                    ? "border-[#5d6043] ring-2 ring-[#5d6043]/25"
                    : "border-[#b9aca2]/60 hover:border-[#5d6043]/50"
                }`}
              >
                <div className="relative h-36 bg-[#b9aca2]/30">
                  {template.heroImageUrl ? (
                    <Image
                      src={template.heroImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#222222]">{template.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#5d6043]">{template.headline}</p>
                  {active ? (
                    <p className="mt-2 text-xs font-semibold text-[#5d6043]">Selected</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
