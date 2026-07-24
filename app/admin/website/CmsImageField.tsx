"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import cmsService from "../../services/cmsService";

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

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const uploaded = await cmsService.uploadImage(file);
      onChange(uploaded.url);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try a JPEG, PNG, or WebP under 5MB.");
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
            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-[#faf9f5] shadow"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-[#b9aca2] bg-[#faf9f5] text-sm text-[#5d6043]">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] hover:bg-[#eeeae0]">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {value ? "Replace image" : "Upload image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
