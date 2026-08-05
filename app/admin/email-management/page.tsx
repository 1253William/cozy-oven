"use client";

import { Loading03Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminIcon from "../components/AdminIcon";
import { useAuth } from "../../context/AuthContext";
import emailDeliveryService, {
  type EmailDelivery,
  type EmailDeliveryCategory,
  type EmailDeliverySummary,
} from "../../services/emailDeliveryService";

type CategoryFilter = "" | EmailDeliveryCategory;

function formatWhen(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function deliveryBadges(row: EmailDelivery): { label: string; className: string }[] {
  const badges: { label: string; className: string }[] = [];
  if (row.bouncedAt)
    badges.push({ label: "Bounced", className: "bg-red-100 text-red-800" });
  if (row.complainedAt)
    badges.push({ label: "Complaint", className: "bg-orange-100 text-orange-800" });
  if (row.failedAt)
    badges.push({ label: "Failed", className: "bg-red-100 text-red-700" });
  if (row.clickedAt)
    badges.push({ label: "Clicked", className: "bg-emerald-100 text-emerald-800" });
  if (row.openedAt)
    badges.push({ label: "Opened", className: "bg-sky-100 text-sky-800" });
  if (row.deliveredAt)
    badges.push({ label: "Delivered", className: "bg-green-100 text-green-800" });
  if (!badges.length && row.sentAt)
    badges.push({ label: "Sent", className: "bg-[#b9aca2]/40 text-[#5d6043]" });
  if (!badges.length)
    badges.push({ label: row.lastEvent || "Pending", className: "bg-[#b9aca2]/30 text-[#5d6043]" });
  return badges.slice(0, 3);
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-4 shadow-sm">
      <p className="text-sm font-medium text-[#5d6043]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#222222]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5d6043]/80">{hint}</p> : null}
    </div>
  );
}

export default function EmailManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState<CategoryFilter>("");
  const [messageKey, setMessageKey] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<EmailDeliverySummary | null>(null);
  const [items, setItems] = useState<EmailDelivery[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  const load = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "Admin") return;
    try {
      setLoading(true);
      setError(null);
      const params = {
        category: category || undefined,
        messageKey: messageKey || undefined,
        search: search || undefined,
        page,
        limit: 25,
      };
      const [summaryRes, listRes] = await Promise.all([
        emailDeliveryService.getSummary(params),
        emailDeliveryService.list(params),
      ]);

      if (!summaryRes?.success || !summaryRes.data) {
        setError(summaryRes?.message || "Failed to load summary");
        setSummary(null);
      } else {
        setSummary(summaryRes.data);
      }

      if (!listRes?.success || !listRes.data) {
        setError((prev) => prev || listRes?.message || "Failed to load deliveries");
        setItems([]);
      } else {
        setItems(listRes.data.items || []);
        setTotalPages(listRes.data.pagination?.totalPages || 1);
        setTotal(listRes.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Email management load failed:", err);
      setError("Failed to load email delivery data.");
      setItems([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, category, messageKey, search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Email Management"
          description="Delivery tracking for campaigns and transactional mail (via Resend webhooks)."
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Sent" value={summary?.sent ?? "—"} />
          <StatCard label="Delivered" value={summary?.delivered ?? "—"} />
          <StatCard
            label="Open rate"
            value={summary != null ? `${summary.openRate}%` : "—"}
            hint={summary != null ? `${summary.opened} opened` : undefined}
          />
          <StatCard
            label="Click rate"
            value={summary != null ? `${summary.clickRate}%` : "—"}
            hint={summary != null ? `${summary.clicked} clicked` : undefined}
          />
          <StatCard
            label="Bounces"
            value={summary?.bounced ?? "—"}
            hint={summary != null ? `${summary.bounceRate}%` : undefined}
          />
          <StatCard
            label="Complaints"
            value={summary?.complained ?? "—"}
            hint={summary != null ? `${summary.complaintRate}%` : undefined}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["", "All"],
                ["campaign", "Campaign"],
                ["transactional", "Transactional"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setCategory(value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === value
                    ? "bg-[#5d6043] text-[#faf9f5]"
                    : "bg-[#b9aca2]/30 text-[#5d6043] hover:bg-[#b9aca2]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <AdminIcon
                icon={Search01Icon}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput.trim());
                    setPage(1);
                  }
                }}
                placeholder="Search by email or subject…"
                className="w-full rounded-lg border border-[#b9aca2] py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-[#bd6325]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch(searchInput.trim());
                setPage(1);
              }}
              className="rounded-lg bg-[#bd6325] px-4 py-2 text-sm font-medium text-[#faf9f5] hover:opacity-90"
            >
              Search
            </button>
          </div>

          {summary?.messageKeys?.length ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMessageKey("");
                  setPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  !messageKey
                    ? "bg-[#5d6043] text-[#faf9f5]"
                    : "bg-[#b9aca2]/25 text-[#5d6043]"
                }`}
              >
                All triggers
              </button>
              {summary.messageKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setMessageKey(key === messageKey ? "" : key);
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    messageKey === key
                      ? "bg-[#5d6043] text-[#faf9f5]"
                      : "bg-[#b9aca2]/25 text-[#5d6043] hover:bg-[#b9aca2]/40"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <AdminIcon
              icon={Loading03Icon}
              size={32}
              className="animate-spin text-[#bd6325]"
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] shadow-sm">
            {items.length === 0 ? (
              <p className="px-6 py-12 text-center text-[#5d6043]">
                No email deliveries found for these filters.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[#b9aca2]/40 bg-[#b9aca2]/15 text-[#5d6043]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">To</th>
                        <th className="px-4 py-3 font-semibold">Subject</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Opened</th>
                        <th className="px-4 py-3 font-semibold">Clicked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row) => (
                        <tr
                          key={row._id}
                          className="border-b border-[#b9aca2]/25 last:border-0"
                        >
                          <td className="px-4 py-3 text-[#222222]">
                            <div className="max-w-[200px] truncate font-medium">
                              {row.to}
                            </div>
                            {row.messageKey ? (
                              <div className="text-xs text-[#5d6043]">
                                {row.messageKey}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 max-w-[240px] truncate text-[#222222]">
                            {row.subject}
                          </td>
                          <td className="px-4 py-3 capitalize text-[#5d6043]">
                            {row.category}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {deliveryBadges(row).map((b) => (
                                <span
                                  key={b.label}
                                  className={`rounded px-1.5 py-0.5 text-xs font-medium ${b.className}`}
                                >
                                  {b.label}
                                </span>
                              ))}
                            </div>
                            {row.lastError ? (
                              <p className="mt-1 max-w-[180px] truncate text-xs text-red-600">
                                {row.lastError}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[#5d6043]">
                            {formatWhen(row.openedAt)}
                            {row.openCount > 1 ? (
                              <span className="text-xs"> ×{row.openCount}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[#5d6043]">
                            {formatWhen(row.clickedAt)}
                            {row.clickCount > 1 ? (
                              <span className="text-xs"> ×{row.clickCount}</span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-[#b9aca2]/40 px-4 py-3 text-sm text-[#5d6043]">
                  <span>
                    {total} total · page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-[#b9aca2] px-3 py-1.5 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-[#b9aca2] px-3 py-1.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
