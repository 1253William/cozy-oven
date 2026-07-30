"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import promotionService, {
  type Promotion,
  type PromotionApplicationOrder,
  type PromotionInput,
} from "../../services/promotionService";

const EMPTY_FORM: PromotionInput = {
  code: "",
  name: "",
  kind: "general",
  influencerName: "",
  discountType: "percentage",
  discountValue: 10,
  maximumDiscountAmount: null,
  minimumSubtotal: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const statusStyle: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  expired: "bg-orange-100 text-orange-800",
  inactive: "bg-gray-200 text-gray-700",
  archived: "bg-red-100 text-red-800",
};

function PromotionFormModal({
  promotion,
  onClose,
  onSaved,
}: {
  promotion: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const hasApplications = Boolean(
    promotion &&
      (promotion.stats.paidUses > 0 || promotion.stats.pendingApplications > 0)
  );
  const [form, setForm] = useState<PromotionInput>(() =>
    promotion
      ? {
          code: promotion.code,
          name: promotion.name,
          kind: promotion.kind,
          influencerName: promotion.influencerName || "",
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          maximumDiscountAmount: promotion.maximumDiscountAmount ?? null,
          minimumSubtotal: promotion.minimumSubtotal,
          startsAt: toDateTimeLocal(promotion.startsAt),
          endsAt: toDateTimeLocal(promotion.endsAt),
          isActive: promotion.isActive,
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: PromotionInput = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      influencerName:
        form.kind === "influencer" ? form.influencerName?.trim() : undefined,
      maximumDiscountAmount:
        form.discountType === "percentage"
          ? form.maximumDiscountAmount || null
          : null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };

    try {
      if (promotion) {
        await promotionService.update(promotion._id, payload);
      } else {
        await promotionService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save promotion"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-[#faf9f5] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#b9aca2]/60 bg-[#faf9f5] p-5">
          <div>
            <h2 className="text-xl font-bold text-[#222222]">
              {promotion ? "Edit Promotion" : "Create Promotion"}
            </h2>
            {hasApplications && (
              <p className="mt-1 text-xs text-[#5d6043]">
                Used codes keep their code and financial rules.
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-[#5d6043] hover:bg-[#b9aca2]/30" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#5d6043]">
              Code
              <input
                required
                value={form.code}
                disabled={hasApplications}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value.toUpperCase() })
                }
                pattern="[A-Za-z0-9_-]{3,32}"
                maxLength={32}
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 uppercase focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
              />
            </label>
            <label className="text-sm font-medium text-[#5d6043]">
              Promotion name
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                maxLength={120}
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#5d6043]">
              Promotion type
              <select
                value={form.kind}
                disabled={hasApplications}
                onChange={(event) =>
                  setForm({
                    ...form,
                    kind: event.target.value as PromotionInput["kind"],
                  })
                }
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
              >
                <option value="general">General promotion</option>
                <option value="influencer">Influencer</option>
              </select>
            </label>
            {form.kind === "influencer" && (
              <label className="text-sm font-medium text-[#5d6043]">
                Influencer name
                <input
                  required
                  disabled={hasApplications}
                  value={form.influencerName || ""}
                  onChange={(event) =>
                    setForm({ ...form, influencerName: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
                />
              </label>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-[#5d6043]">
              Discount type
              <select
                value={form.discountType}
                disabled={hasApplications}
                onChange={(event) =>
                  setForm({
                    ...form,
                    discountType: event.target
                      .value as PromotionInput["discountType"],
                  })
                }
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <label className="text-sm font-medium text-[#5d6043]">
              {form.discountType === "percentage" ? "Percentage" : "Amount (GHS)"}
              <input
                required
                type="number"
                min="0.01"
                max={form.discountType === "percentage" ? 100 : undefined}
                step="0.01"
                disabled={hasApplications}
                value={form.discountValue}
                onChange={(event) =>
                  setForm({ ...form, discountValue: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
              />
            </label>
            {form.discountType === "percentage" && (
              <label className="text-sm font-medium text-[#5d6043]">
                Maximum discount (GHS)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  disabled={hasApplications}
                  value={form.maximumDiscountAmount ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      maximumDiscountAmount: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                  placeholder="No cap"
                  className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
                />
              </label>
            )}
          </div>

          <label className="block text-sm font-medium text-[#5d6043]">
            Minimum merchandise subtotal (GHS)
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={hasApplications}
              value={form.minimumSubtotal || 0}
              onChange={(event) =>
                setForm({ ...form, minimumSubtotal: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#5d6043]">
              Starts
              <input
                type="datetime-local"
                value={form.startsAt || ""}
                onChange={(event) =>
                  setForm({ ...form, startsAt: event.target.value || null })
                }
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043]"
              />
            </label>
            <label className="text-sm font-medium text-[#5d6043]">
              Ends
              <input
                type="datetime-local"
                value={form.endsAt || ""}
                onChange={(event) =>
                  setForm({ ...form, endsAt: event.target.value || null })
                }
                className="mt-2 w-full rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043]"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-[#5d6043]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
              className="h-4 w-4 accent-[#5d6043]"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 border-t border-[#b9aca2]/60 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#b9aca2] px-4 py-2 text-[#5d6043] hover:bg-[#b9aca2]/20">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-white hover:bg-[#222222] disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {promotion ? "Save changes" : "Create code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatsModal({
  promotion,
  orders,
  loading,
  onClose,
}: {
  promotion: Promotion;
  orders: PromotionApplicationOrder[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-[#faf9f5] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#b9aca2]/60 bg-[#faf9f5] p-5">
          <div>
            <p className="text-sm font-semibold text-[#bd6325]">{promotion.code}</p>
            <h2 className="text-xl font-bold text-[#222222]">{promotion.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-[#5d6043] hover:bg-[#b9aca2]/30" aria-label="Close statistics">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {[
            ["Paid uses", promotion.stats.paidUses],
            ["Pending", promotion.stats.pendingApplications],
            ["Discount given", `GHS ${promotion.stats.discountGiven.toFixed(2)}`],
            ["Net revenue", `GHS ${promotion.stats.netRevenue.toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-[#b9aca2]/50 p-4">
              <p className="text-xs text-[#5d6043]">{label}</p>
              <p className="mt-1 text-lg font-bold text-[#222222]">{value}</p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <h3 className="mb-3 font-semibold text-[#222222]">Recent applications</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#5d6043]" />
            </div>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#5d6043]">
              This code has not been applied to an order.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#b9aca2]/50">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-[#f4efe7] text-left text-[#5d6043]">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b9aca2]/40">
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-4 py-3 font-semibold text-[#222222]">{order.orderId}</td>
                      <td className="px-4 py-3 text-[#5d6043]">
                        {order.customer}
                        <span className="block text-xs">{order.contact}</span>
                      </td>
                      <td className="px-4 py-3 capitalize text-[#5d6043]">{order.channel}</td>
                      <td className="px-4 py-3 capitalize text-[#5d6043]">{order.paymentStatus}</td>
                      <td className="px-4 py-3 text-right text-green-700">GHS {order.codeDiscountAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#222222]">GHS {order.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [editing, setEditing] = useState<Promotion | null | undefined>(undefined);
  const [statsPromotion, setStatsPromotion] = useState<Promotion | null>(null);
  const [statsOrders, setStatsOrders] = useState<PromotionApplicationOrder[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") router.replace("/admin/login");
  }, [isAuthenticated, router, user]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await promotionService.list({
        limit: 100,
        search: appliedSearch || undefined,
        status: status !== "all" ? status : undefined,
        kind: kind !== "all" ? kind : undefined,
      });
      setPromotions(response.data || []);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, isAuthenticated, kind, status, user]);

  const totals = useMemo(
    () =>
      promotions.reduce(
        (sum, promotion) => ({
          paidUses: sum.paidUses + promotion.stats.paidUses,
          pending: sum.pending + promotion.stats.pendingApplications,
          discounts: sum.discounts + promotion.stats.discountGiven,
          revenue: sum.revenue + promotion.stats.netRevenue,
        }),
        { paidUses: 0, pending: 0, discounts: 0, revenue: 0 }
      ),
    [promotions]
  );

  const openStats = async (promotion: Promotion) => {
    setStatsPromotion(promotion);
    setStatsOrders([]);
    setStatsLoading(true);
    try {
      const response = await promotionService.getStats(promotion._id);
      setStatsPromotion(response.promotion);
      setStatsOrders(response.recentOrders);
    } finally {
      setStatsLoading(false);
    }
  };

  const archive = async (promotion: Promotion) => {
    if (!confirm(`Archive promotion ${promotion.code}?`)) return;
    await promotionService.archive(promotion._id);
    await load();
  };

  if (!isAuthenticated || user?.role !== "Admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Promotions</h1>
            <p className="mt-1 text-[#5d6043]">Manage general and influencer discount codes.</p>
          </div>
          <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-white hover:bg-[#222222]">
            <Plus className="h-5 w-5" />
            Create promotion
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Paid uses", totals.paidUses],
            ["Pending applications", totals.pending],
            ["Discount given", `GHS ${totals.discounts.toFixed(2)}`],
            ["Net revenue", `GHS ${totals.revenue.toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-[#b9aca2]/50 bg-[#faf9f5] p-4">
              <p className="text-sm text-[#5d6043]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#222222]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-[#b9aca2]/50 bg-[#faf9f5] p-4 lg:flex-row">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(search.trim());
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b9aca2]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code, promotion, or influencer" className="w-full rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 focus:ring-2 focus:ring-[#5d6043]" />
          </form>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043]">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <select value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-lg border border-[#b9aca2] px-3 py-2 focus:ring-2 focus:ring-[#5d6043]">
            <option value="all">All types</option>
            <option value="general">General</option>
            <option value="influencer">Influencer</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" /></div>
        ) : promotions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#b9aca2] py-16 text-center">
            <Search className="mx-auto h-10 w-10 text-[#b9aca2]" />
            <p className="mt-3 font-semibold text-[#222222]">No promotions found</p>
            <p className="mt-1 text-sm text-[#5d6043]">Create a code or adjust the current filters.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-[#b9aca2]/50 lg:block">
              <table className="w-full">
                <thead className="bg-[#f4efe7] text-left text-xs uppercase text-[#5d6043]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Offer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Paid / Pending</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b9aca2]/40 bg-[#faf9f5]">
                  {promotions.map((promotion) => (
                    <tr key={promotion._id}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#222222]">{promotion.code}</p>
                        <p className="text-xs text-[#5d6043]">{promotion.name}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#5d6043]">
                        {promotion.discountType === "percentage" ? `${promotion.discountValue}%` : `GHS ${promotion.discountValue.toFixed(2)}`}
                        {promotion.influencerName && <span className="block text-xs">{promotion.influencerName}</span>}
                      </td>
                      <td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyle[promotion.status]}`}>{promotion.status}</span></td>
                      <td className="px-4 py-4 text-right text-sm text-[#5d6043]">{promotion.stats.paidUses} / {promotion.stats.pendingApplications}</td>
                      <td className="px-4 py-4 text-right text-sm text-green-700">GHS {promotion.stats.discountGiven.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-[#222222]">GHS {promotion.stats.netRevenue.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => void openStats(promotion)} className="rounded-md p-2 text-blue-700 hover:bg-blue-50" title="View statistics"><Eye className="h-4 w-4" /></button>
                          {promotion.status !== "archived" && (
                            <>
                              <button type="button" onClick={() => setEditing(promotion)} className="rounded-md p-2 text-[#5d6043] hover:bg-[#b9aca2]/30" title="Edit promotion"><Edit className="h-4 w-4" /></button>
                              <button type="button" onClick={() => void archive(promotion)} className="rounded-md p-2 text-red-700 hover:bg-red-50" title="Archive promotion"><Trash2 className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {promotions.map((promotion) => (
                <div key={promotion._id} className="rounded-lg border border-[#b9aca2]/50 bg-[#faf9f5] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-bold text-[#222222]">{promotion.code}</p><p className="text-sm text-[#5d6043]">{promotion.name}</p></div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyle[promotion.status]}`}>{promotion.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-[#5d6043]">Paid / pending</p><p className="font-semibold text-[#222222]">{promotion.stats.paidUses} / {promotion.stats.pendingApplications}</p></div>
                    <div><p className="text-xs text-[#5d6043]">Net revenue</p><p className="font-semibold text-[#222222]">GHS {promotion.stats.netRevenue.toFixed(2)}</p></div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-[#b9aca2]/40 pt-3">
                    <button type="button" onClick={() => void openStats(promotion)} className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm text-[#5d6043]"><BarChart3 className="h-4 w-4" />Stats</button>
                    {promotion.status !== "archived" && <button type="button" onClick={() => setEditing(promotion)} className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-3 py-2 text-sm text-white"><Edit className="h-4 w-4" />Edit</button>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editing !== undefined && (
        <PromotionFormModal
          promotion={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined);
            await load();
          }}
        />
      )}
      {statsPromotion && <StatsModal promotion={statsPromotion} orders={statsOrders} loading={statsLoading} onClose={() => setStatsPromotion(null)} />}
    </AdminLayout>
  );
}
