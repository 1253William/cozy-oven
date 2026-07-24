"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Star, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import reviewService, { Review, ReviewStatus } from "../../services/reviewService";

type FilterStatus = ReviewStatus | "all";

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<FilterStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadReviews = async (nextStatus: FilterStatus = status) => {
    try {
      setLoading(true);
      const response = await reviewService.getAdminReviews(nextStatus);
      setReviews(response?.data || []);
      setError("");
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleStatus = async (id: string, nextStatus: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      await reviewService.updateAdminReviewStatus(id, nextStatus);
      await loadReviews(status);
    } catch (err) {
      console.error("Error updating review:", err);
      setError("Failed to update review.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#222222]">Reviews</h1>
          <p className="mt-1 text-sm text-[#5d6043]">
            Approve or reject public reviews. Order reviews publish automatically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as FilterStatus[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-full px-4 py-2 text-sm capitalize ${
                status === value
                  ? "bg-[#5d6043] text-white"
                  : "border border-[#b9aca2]/60 text-[#5d6043]"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-[#5d6043]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[#5d6043]">No reviews in this view.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-[#b9aca2]/50 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#222222]">{review.displayName}</h2>
                      <span className="rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs uppercase tracking-wide text-[#5d6043]">
                        {review.source}
                      </span>
                      <span className="rounded-full bg-[#f3efe8] px-2 py-0.5 text-xs uppercase tracking-wide text-[#5d6043]">
                        {review.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-[#5d6043]">{formatDate(review.createdAt)}</p>
                  </div>

                  {review.source === "public" && review.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={updatingId === review.id}
                        onClick={() => handleStatus(review.id, "approved")}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-white disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === review.id}
                        onClick={() => handleStatus(review.id, "rejected")}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>

                <p className="mt-3 text-[#5d6043]">{review.comment}</p>
                {review.orderId ? (
                  <p className="mt-2 text-xs text-[#5d6043]">Order {review.orderId}</p>
                ) : null}
                {review.productId ? (
                  <p className="mt-1 text-xs text-[#5d6043]">Product {review.productId}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
