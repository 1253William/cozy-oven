"use client";

import { FormEvent, useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { usePathname } from "next/navigation";
import reviewService, { EligibleOrderReview } from "../services/reviewService";
import { getGuestOrderProfile } from "../utils/guestOrderProfile";
import { useAuth } from "../context/AuthContext";

const SNOOZE_KEY = "cozyoven_review_snooze_until";
const doneKey = (orderId: string) => `cozyoven_review_done_${orderId}`;

function isSnoozed() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(SNOOZE_KEY);
  if (!raw) return false;
  const until = Number(raw);
  return Number.isFinite(until) && until > Date.now();
}

function markSnooze(days = 5) {
  window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
}

function markDone(orderId: string) {
  window.localStorage.setItem(doneKey(orderId), "1");
  window.localStorage.removeItem(SNOOZE_KEY);
}

export default function ReviewPromptModal() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [eligible, setEligible] = useState<EligibleOrderReview | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return;
    if (isSnoozed()) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const guest = getGuestOrderProfile();
        const data = await reviewService.getEligibleOrder({
          orderId: guest?.orderId,
          phoneNumber: guest?.phoneNumber,
          email: guest?.email,
        });

        if (cancelled || !data?.orderId) return;
        if (window.localStorage.getItem(doneKey(data.orderId))) return;

        setEligible(data);
        setDisplayName(
          data.displayName ||
            guest?.fullName ||
            user?.fullName ||
            "Customer"
        );
        setOpen(true);
      } catch (err) {
        console.error("Eligible order review check failed:", err);
      }
    }, 1800);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, isAuthenticated, user]);

  if (!open || !eligible) return null;

  const handleLater = () => {
    markSnooze(5);
    setOpen(false);
  };

  const handleDismissOrder = () => {
    markDone(eligible.orderId);
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Please add a short comment.");
      return;
    }

    try {
      setSubmitting(true);
      const guest = getGuestOrderProfile();
      await reviewService.submitOrderReview({
        orderId: eligible.orderId,
        displayName: displayName.trim() || "Customer",
        rating,
        comment: comment.trim(),
        guestPhone: guest?.phoneNumber,
        guestEmail: guest?.email,
      });
      markDone(eligible.orderId);
      setOpen(false);
    } catch (err) {
      console.error("Order review submit failed:", err);
      setError("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#222222]">How was your order?</h2>
            <p className="mt-1 text-sm text-[#5d6043]">
              Order {eligible.orderId}
              {eligible.items?.length
                ? ` · ${eligible.items
                    .slice(0, 2)
                    .map((item) => item.name)
                    .join(", ")}${eligible.items.length > 2 ? "…" : ""}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLater}
            className="rounded-full p-1 text-[#5d6043] hover:bg-[#f3efe8]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#5d6043]">Your name</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-[#b9aca2]/60 px-3 py-2"
              maxLength={80}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#5d6043]">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#b9aca2]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#5d6043]">Comment</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-[90px] w-full rounded-lg border border-[#b9aca2]/60 px-3 py-2"
              maxLength={500}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
            <button
              type="button"
              onClick={handleLater}
              className="rounded-lg border border-[#b9aca2] px-4 py-2 text-sm text-[#5d6043]"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={handleDismissOrder}
              className="rounded-lg px-3 py-2 text-sm text-[#5d6043] underline"
            >
              Don&apos;t ask for this order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
