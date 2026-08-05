"use client";

import {
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useMemo, useState } from "react";

export type PublishChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
};

type PublishChecklistModalProps = {
  title?: string;
  items: PublishChecklistItem[];
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function PublishChecklistModal({
  title = "Before you publish",
  items,
  confirmLabel = "Publish",
  busy = false,
  onCancel,
  onConfirm,
}: PublishChecklistModalProps) {
  const [previewed, setPreviewed] = useState(false);
  const blockers = useMemo(() => items.filter((item) => !item.ok), [items]);
  const canPublish = blockers.length === 0 && previewed;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#faf9f5] p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">{title}</h2>
            <p className="mt-1 text-sm text-[#5d6043]">
              Quick check so the live page looks right.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 hover:bg-[#eeeae0]"
            aria-label="Close"
          >
            <AdminIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border px-3 py-3 text-sm ${
                item.ok
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <div className="font-medium">
                {item.ok ? "✓" : "!"} {item.label}
              </div>
              {item.hint ? (
                <p className="mt-1 text-xs opacity-90">{item.hint}</p>
              ) : null}
            </li>
          ))}
        </ul>

        <label className="mt-4 flex min-h-11 items-start gap-3 rounded-xl border border-[#b9aca2]/60 bg-white px-3 py-3 text-sm text-[#5d6043]">
          <input
            type="checkbox"
            checked={previewed}
            onChange={(e) => setPreviewed(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span>I previewed this and it looks good</span>
        </label>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canPublish || busy}
            onClick={onConfirm}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-[#faf9f5] disabled:opacity-50"
          >
            {busy ? <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
