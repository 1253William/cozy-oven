"use client";

import { FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import reviewService, { Review } from "../services/reviewService";

interface ProductTabsProps {
  details: string;
  productId: string;
  initialReviews?: Review[];
}

function formatRelativeDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  return date.toLocaleDateString();
}

export default function ProductTabs({
  details,
  productId,
  initialReviews = [],
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(initialReviews.length === 0);
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getProductReviews(productId);
        if (active) setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openReviewsFromHash = () => {
      if (window.location.hash !== "#reviews") return;
      setActiveTab("reviews");
      window.requestAnimationFrame(() => {
        document.getElementById("reviews")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };

    openReviewsFromHash();
    window.addEventListener("hashchange", openReviewsFromHash);
    return () => window.removeEventListener("hashchange", openReviewsFromHash);
  }, [productId]);

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            className={`h-4 w-4 ${
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-[#b9aca2]"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!displayName.trim() || !comment.trim()) {
      setError("Name and comment are required.");
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.submitPublicReview({
        displayName: displayName.trim(),
        rating,
        comment: comment.trim(),
        productId,
        website,
      });
      setDisplayName("");
      setComment("");
      setRating(5);
      setMessage("Thanks! Your review was submitted.");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="reviews" className="mt-8 scroll-mt-28">
      <div className="flex gap-4 border-b border-[#b9aca2]/60">
        <button
          onClick={() => setActiveTab("details")}
          className={`relative px-4 pb-3 font-semibold transition-colors ${
            activeTab === "details" ? "text-[#5d6043]" : "text-[#5d6043] hover:text-[#5d6043]"
          }`}
        >
          Details
          {activeTab === "details" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5d6043]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`relative px-4 pb-3 font-semibold transition-colors ${
            activeTab === "reviews" ? "text-[#5d6043]" : "text-[#5d6043] hover:text-[#5d6043]"
          }`}
        >
          Reviews ({reviews.length})
          {activeTab === "reviews" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5d6043]" />
          )}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "details" ? (
          <div className="leading-relaxed text-[#5d6043]">
            <p>{details}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Storage:</strong> Keep refrigerated for up to 5 days
              </p>
              <p>
                <strong>Allergens:</strong> Contains wheat, eggs, and milk
              </p>
              <p>
                <strong>Serving suggestion:</strong> Best served at room temperature or lightly
                toasted
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-6">
              {loading ? (
                <p className="text-sm text-[#5d6043]">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[#5d6043]">
                  No reviews yet. Be the first to share how it tasted.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-[#b9aca2]/40 pb-6 last:border-0"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-[#222222]">{review.displayName}</h4>
                        </div>
                        <p className="text-sm text-[#5d6043]">
                          {formatRelativeDate(review.createdAt)}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-[#5d6043]">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-[#b9aca2]/50 p-5"
            >
              <h3 className="font-semibold text-[#222222]">Leave a review</h3>
              <p className="text-sm text-[#5d6043]">
                Anyone can share feedback. Public reviews appear after approval.
              </p>

              {/* honeypot */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="mb-1 block text-sm text-[#5d6043]">Your name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-lg border border-[#b9aca2]/60 px-3 py-2 text-[#222222]"
                  maxLength={80}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[#5d6043]">Rating</label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="mb-1 block text-sm text-[#5d6043]">Comment</label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="min-h-[100px] w-full rounded-lg border border-[#b9aca2]/60 px-3 py-2 text-[#222222]"
                  maxLength={500}
                  required
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {message ? <p className="text-sm text-[#5d6043]">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#5d6043] px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
