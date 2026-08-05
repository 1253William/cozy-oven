"use client";

import Image from "next/image";
import {
  Delete02Icon,
  Loading03Icon,
  MailSend01Icon,
  PaintBoardIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { CampaignTemplate } from "../../services/marketingService";

type TemplateLibraryPanelProps = {
  templates: CampaignTemplate[];
  loading: boolean;
  onEdit: (template: CampaignTemplate) => void;
  onArchive: (id: string) => void;
  onUseInCompose: (template: CampaignTemplate) => void;
  onCreateNew: () => void;
};

export default function TemplateLibraryPanel({
  templates,
  loading,
  onEdit,
  onArchive,
  onUseInCompose,
  onCreateNew,
}: TemplateLibraryPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
            <AdminIcon icon={PaintBoardIcon} size={20} />
            Campaign templates
          </h2>
          <p className="text-sm text-[#5d6043]">
            Create and edit designs here. Use a template when you are ready to send.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#5d6043]">
          <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#b9aca2] bg-[#faf9f5] p-8 text-center">
          <p className="text-sm text-[#5d6043]">
            No templates yet. Create one with a hero image and headline before sending.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 inline-flex rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222]"
          >
            Create template
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template._id}
              className="overflow-hidden rounded-lg border border-[#b9aca2]/60 bg-white"
            >
              <button
                type="button"
                onClick={() => onEdit(template)}
                className="block w-full text-left"
              >
                <div className="relative h-32 bg-[#b9aca2]/30">
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
                <div className="p-3">
                  <p className="font-semibold text-[#222222]">{template.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#5d6043]">{template.headline}</p>
                </div>
              </button>
              <div className="flex border-t border-[#b9aca2]/40">
                <button
                  type="button"
                  title="Edit"
                  onClick={() => onEdit(template)}
                  className="flex flex-1 items-center justify-center gap-1 p-2 text-sm text-[#5d6043] hover:bg-[#faf9f5]"
                >
                  <AdminIcon icon={PencilEdit02Icon} size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  title="Use in compose"
                  onClick={() => onUseInCompose(template)}
                  className="flex flex-1 items-center justify-center gap-1 border-l border-[#b9aca2]/40 p-2 text-sm text-[#5d6043] hover:bg-[#faf9f5]"
                >
                  <AdminIcon icon={MailSend01Icon} size={16} />
                  Use
                </button>
                <button
                  type="button"
                  title="Archive"
                  onClick={() => onArchive(template._id)}
                  className="flex flex-1 items-center justify-center gap-1 border-l border-[#b9aca2]/40 p-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <AdminIcon icon={Delete02Icon} size={16} />
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
