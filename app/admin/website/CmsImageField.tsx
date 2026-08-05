"use client";

import {
  Cancel01Icon,
  Loading03Icon,
  Search01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import cmsService, { type CmsMediaItem } from "../../services/cmsService";

type CmsImageFieldProps = {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
};

export default function CmsImageField({
  label = "Image",
  value,
  onChange,
}: CmsImageFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryItems, setLibraryItems] = useState<CmsMediaItem[]>([]);

  useEffect(() => {
    if (!showLibrary) return;
    let active = true;
    (async () => {
      try {
        setLibraryLoading(true);
        setError("");
        const data = await cmsService.listAdminMedia({ limit: 24 });
        if (active) setLibraryItems(data.items || []);
      } catch (err) {
        console.error(err);
        if (active) setError("Could not load media library.");
      } finally {
        if (active) setLibraryLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showLibrary]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const uploaded = await cmsService.uploadImage(file);
      onChange(uploaded.url);
      setShowLibrary(false);
    } catch (err) {
      console.error(err);
      setError("Upload01Icon failed. Try a JPEG, PNG, or WebP under 5MB.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-[#5d6043]">{label}</span>

      {value ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#b9aca2] bg-[#eeeae0]">
          <Image src={value} alt="" fill className="object-cover" sizes="400px" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 min-h-10 min-w-10 rounded-full bg-red-600 p-1.5 text-[#faf9f5] shadow"
            aria-label="Remove image"
          >
            <AdminIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-[#b9aca2] bg-[#faf9f5] text-sm text-[#5d6043]">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]">
          {uploading ? (
            <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
          ) : (
            <AdminIcon icon={Upload01Icon} size={16} />
          )}
          {value ? "Replace image" : "Upload01Icon image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
        >
          <AdminIcon icon={Search01Icon} size={16} />
          Choose from library
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {showLibrary ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#faf9f5] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#222222]">Media library</h3>
                <p className="text-sm text-[#5d6043]">
                  Recent CMS uploads — tap one to use it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="rounded-lg p-2 hover:bg-[#eeeae0]"
                aria-label="Close"
              >
                <AdminIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            {libraryLoading ? (
              <div className="flex justify-center py-12">
                <AdminIcon icon={Loading03Icon} size={28} className="animate-spin text-[#5d6043]" />
              </div>
            ) : libraryItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#b9aca2] px-4 py-10 text-center text-sm text-[#5d6043]">
                No library images yet. Upload01Icon one and it will show up here next time.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {libraryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setShowLibrary(false);
                    }}
                    className="group overflow-hidden rounded-xl border border-[#b9aca2]/60 bg-white text-left hover:border-[#5d6043]"
                  >
                    <div className="relative aspect-square w-full bg-[#eeeae0]">
                      <Image
                        src={item.url}
                        alt={item.label || "Library image"}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="200px"
                      />
                    </div>
                    <span className="block truncate px-2 py-2 text-xs text-[#5d6043]">
                      {item.label || "CMS image"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-[#faf9f5]">
                {uploading ? (
                  <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
                ) : (
                  <AdminIcon icon={Upload01Icon} size={16} />
                )}
                Upload01Icon new
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="min-h-10 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
