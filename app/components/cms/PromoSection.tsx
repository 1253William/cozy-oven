"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";

export type PromoTone = "sale" | "seasonal" | "announcement";

export type PromoSectionProps = {
  message: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  endsAt?: string | Date | null;
  tone?: PromoTone | string | null;
  /** Direct thumbnail / icon URL */
  imageUrl?: string;
  /** Resolved product thumbnail (preferred over generic icon when set) */
  productThumbnailUrl?: string;
  /** Persist dismiss in localStorage (off in admin preview) */
  dismissible?: boolean;
  storageKey?: string;
  preview?: boolean;
};

const TONE_STYLES: Record<
  PromoTone,
  { band: string; text: string; muted: string; button: string; chip: string }
> = {
  sale: {
    band: "border-[#bd6325]/35 bg-[#bd6325]",
    text: "text-[#faf9f5]",
    muted: "text-[#faf9f5]/80",
    button:
      "bg-[#faf9f5] text-[#bd6325] hover:bg-[#eeeae0] border-transparent",
    chip: "bg-[#faf9f5]/15 text-[#faf9f5]",
  },
  seasonal: {
    band: "border-[#5d6043]/30 bg-[#5d6043]",
    text: "text-[#faf9f5]",
    muted: "text-[#faf9f5]/80",
    button:
      "bg-[#faf9f5] text-[#5d6043] hover:bg-[#eeeae0] border-transparent",
    chip: "bg-[#faf9f5]/15 text-[#faf9f5]",
  },
  announcement: {
    band: "border-[rgba(34,34,34,0.10)] bg-[#eeeae0]",
    text: "text-[#222222]",
    muted: "text-[#5d6043]",
    button:
      "bg-[#222222] text-[#faf9f5] hover:bg-[#5d6043] border-transparent",
    chip: "bg-[#222222]/08 text-[#5d6043]",
  },
};

const normalizeTone = (tone?: string | null): PromoTone => {
  if (tone === "sale" || tone === "seasonal" || tone === "announcement") return tone;
  return "sale";
};

const formatEndsLabel = (endsAt?: string | Date | null): string | null => {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  if (!Number.isFinite(end.getTime())) return null;
  const now = new Date();
  if (end.getTime() < now.getTime()) return null;

  const ms = end.getTime() - now.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Ends today";
  if (days === 1) return "Ends tomorrow";
  if (days <= 7) return `Ends in ${days} days`;

  return `Ends ${end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
};

export default function PromoSection({
  message,
  body,
  ctaLabel,
  ctaHref,
  endsAt,
  tone,
  imageUrl,
  productThumbnailUrl,
  dismissible = true,
  storageKey,
  preview = false,
}: PromoSectionProps) {
  const resolvedTone = normalizeTone(tone);
  const styles = TONE_STYLES[resolvedTone];
  const endsLabel = formatEndsLabel(endsAt);
  const thumb = productThumbnailUrl || imageUrl || "";
  const key = storageKey || `cms-promo:${message.slice(0, 80)}:${String(endsAt || "")}`;

  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (preview || !dismissible) {
      setReady(true);
      return;
    }
    try {
      setDismissed(window.localStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [key, dismissible, preview]);

  const shortMessage = useMemo(() => {
    const text = String(message || "").trim();
    if (text.length <= 90) return text;
    return `${text.slice(0, 87).trim()}…`;
  }, [message]);

  if (!shortMessage) return null;
  if (!ready) return null;
  if (dismissed && !preview) return null;

  const handleDismiss = () => {
    if (preview || !dismissible) return;
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  const cta = ctaLabel && ctaHref ? (
    preview ? (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold ${styles.button}`}
      >
        {ctaLabel}
      </span>
    ) : (
      <Link
        href={ctaHref}
        className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${styles.button}`}
      >
        {ctaLabel}
      </Link>
    )
  ) : null;

  return (
    <section
      className={`border-b ${styles.band} ${styles.text}`}
      aria-label="Promotion"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div
            className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl sm:h-14 sm:w-14 ${styles.chip}`}
          >
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="h-5 w-5 opacity-80" aria-hidden />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold leading-snug sm:text-lg">
                {shortMessage}
              </p>
              {endsLabel ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${styles.chip}`}
                >
                  {endsLabel}
                </span>
              ) : null}
            </div>
            {body ? (
              <p className={`mt-1 text-sm leading-6 ${styles.muted}`}>{body}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-center">
          {cta}
          {dismissible && !preview ? (
            <button
              type="button"
              onClick={handleDismiss}
              className={`rounded-full p-2 transition hover:bg-black/10 ${styles.text}`}
              aria-label="Dismiss promotion"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
