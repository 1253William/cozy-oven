"use client";

import {
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect, useState } from "react";
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) {
      return;
    }

    try {
      setUpdatingId(id);
      await reviewService.deleteAdminReview(id);
      await loadReviews(status);
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review.");
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
            Approve public reviews, hide any live review, or delete permanently. Order reviews
            publish automatically but can still be hidden or deleted.
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
            <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[#5d6043]">No reviews in this view.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const busy = updatingId === review.id;
              const canApprove = review.status !== "approved";
              const canHide = review.status !== "rejected";

              return (
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
                          <AdminIcon icon={StarIcon} size={12} className="h-3.5 w-3.5 fill-current" key={index} />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-[#5d6043]">{formatDate(review.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {canApprove ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatus(review.id, "approved")}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-white disabled:opacity-60"
                        >
                          <AdminIcon icon={Tick02Icon} size={16} />
                          {review.status === "pending" ? "Approve" : "Show"}
                        </button>
                      ) : null}
                      {canHide ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatus(review.id, "rejected")}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043] disabled:opacity-60"
                        >
                          <AdminIcon icon={Cancel01Icon} size={16} />
                          Hide
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(review.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
                      >
                        <AdminIcon icon={Delete02Icon} size={16} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-[#5d6043]">{review.comment}</p>
                  {review.orderId ? (
                    <p className="mt-2 text-xs text-[#5d6043]">Order {review.orderId}</p>
                  ) : null}
                  {review.productId ? (
                    <p className="mt-1 text-xs text-[#5d6043]">Product {review.productId}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
