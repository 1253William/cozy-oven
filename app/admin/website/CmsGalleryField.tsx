"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import CmsImageField from "./CmsImageField";

const MAX_GALLERY = 6;

type CmsGalleryFieldProps = {
  label?: string;
  value?: string[];
  onChange: (urls: string[]) => void;
};

export default function CmsGalleryField({
  label = "Gallery images",
  value = [],
  onChange,
}: CmsGalleryFieldProps) {
  const urls = Array.isArray(value) ? value.filter(Boolean) : [];

  const setAt = (index: number, url: string) => {
    const next = [...urls];
    if (!url) {
      next.splice(index, 1);
    } else {
      next[index] = url;
    }
    onChange(next.slice(0, MAX_GALLERY));
  };

  const addSlot = () => {
    if (urls.length >= MAX_GALLERY) return;
    onChange([...urls, ""]);
  };

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-sm font-semibold text-[#5d6043]">{label}</span>
        <button
          type="button"
          onClick={addSlot}
          disabled={urls.length >= MAX_GALLERY}
          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add image
        </button>
      </div>

      {urls.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#b9aca2] px-3 py-6 text-center text-sm text-[#5d6043]">
          No photos yet. Add an image slot, then upload or pick from the library.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {urls.map((url, index) => (
            <div
              key={`gallery-${index}`}
              className="space-y-2 rounded-xl border border-[#b9aca2]/60 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#5d6043]">
                  Photo {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="min-h-10 min-w-10 rounded-lg border border-red-200 p-2 text-red-700"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {url ? (
                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eeeae0]">
                  <Image src={url} alt="" fill className="object-cover" sizes="240px" />
                </div>
              ) : null}
              <CmsImageField
                label={url ? "Replace" : "Choose image"}
                value={url || ""}
                onChange={(nextUrl) => setAt(index, nextUrl)}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[#5d6043]">Up to {MAX_GALLERY} photos.</p>
    </div>
  );
}
