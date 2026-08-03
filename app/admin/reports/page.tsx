"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import reportsService, {
  type FinanceSummary,
  type SalesByCategory,
  type TopSellingProduct,
  type TopCustomer,
} from "../../services/reportsService";
import { formatPaymentMethod } from "../../utils/paymentMethod";

const CATEGORY_COLORS = [
  "#5d6043",
  "#bd6325",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ChangeBadge({
  value,
  label = "vs last month",
}: {
  value: number | null | undefined;
  label?: string;
}) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-[#5d6043]">{label}: —</span>;
  }
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
        up ? "text-green-700" : "text-red-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {value}% {label}
    </span>
  );
}

function WaterfallRow({
  label,
  value,
  emphasize,
  subtract,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
  subtract?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        emphasize
          ? "border-t border-[#b9aca2]/50 pt-3 font-semibold text-[#222222]"
          : "text-[#5d6043]"
      }`}
    >
      <span>
        {subtract ? "− " : ""}
        {label}
      </span>
      <span className={subtract && !emphasize ? "text-red-700" : undefined}>
        GHS {value.toFixed(2)}
      </span>
    </div>
  );
}

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  const [customersPage, setCustomersPage] = useState(1);
  const [customersMeta, setCustomersMeta] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setCustomersPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchAllReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, selectedMonth, selectedYear, customersPage]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [financeRes, categoryRes, productsRes, customersRes] = await Promise.all([
        reportsService.getFinanceSummary(selectedMonth, selectedYear),
        reportsService.getSalesByCategory(selectedMonth, selectedYear),
        reportsService.getTopSellingProducts(selectedMonth, selectedYear),
        reportsService.getTopCustomers(customersPage, 5, selectedMonth, selectedYear),
      ]);

      if (financeRes.success) setFinanceSummary(financeRes.data);
      if (categoryRes.success) setSalesByCategory(categoryRes.data);
      if (productsRes.success) setTopProducts(productsRes.data);
      if (customersRes.success) {
        setTopCustomers(customersRes.data);
        setCustomersMeta(customersRes.meta);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await reportsService.exportMonthlyReport(selectedMonth, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cozy-oven-report-${selectedMonth}-${selectedYear}.csv`
        .toLowerCase()
        .replace(/\s+/g, "-");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const blob = await reportsService.exportMonthlyReportPdf(selectedMonth, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cozy-oven-report-${selectedMonth}-${selectedYear}.pdf`
        .toLowerCase()
        .replace(/\s+/g, "-");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExportingPdf(false);
    }
  };

  const dailySales = financeSummary?.dailySales || [];
  const maxDailyRevenue = useMemo(
    () => Math.max(...dailySales.map((d) => d.revenue), 1),
    [dailySales]
  );

  const fulfillment = financeSummary?.fulfillment;
  const statusBreakdown = financeSummary?.statusBreakdown || [];
  const discountBreakdown =
    financeSummary?.discounts || financeSummary?.pnl?.discounts;
  const promotionCodes = financeSummary?.promotionCodes || [];
  const pnl = financeSummary?.pnl;
  const customerSummary =
    financeSummary?.customerSummary ||
    (financeSummary?.customers
      ? {
          total: financeSummary.customers.total,
          new: financeSummary.customers.new,
          returning: financeSummary.customers.returning,
        }
      : null);
  const yoy = financeSummary?.comparisons?.sameMonthLastYear;
  const dataQuality = financeSummary?.dataQuality;
  const pace = financeSummary?.pace;
  const topProductsByMargin = financeSummary?.topProductsByMargin || [];
  const byChannel = financeSummary?.byChannel || [];
  const totalChannelRevenue = byChannel.reduce((sum, row) => sum + row.revenue, 0) || 1;
  const offlineRow = byChannel.find((row) => row.channel === "offline");
  const offlineShare =
    totalChannelRevenue > 0
      ? Number((((offlineRow?.revenue || 0) / totalChannelRevenue) * 100).toFixed(1))
      : 0;

  const qualityWarnings = dataQuality?.warnings || [];
  const showQualityBanner =
    qualityWarnings.length > 0 ||
    (dataQuality?.cogsCoverage?.coveragePercent != null &&
      dataQuality.cogsCoverage.coveragePercent < 100);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Reports & Analytics</h1>
            <p className="mt-1 text-[#5d6043]">
              Period insights for {selectedMonth} {selectedYear}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-[#faf9f5] transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5d6043] px-4 py-2 text-[#5d6043] transition-colors hover:bg-[#f3efe8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {exportingPdf ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-4 shadow-sm">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <span className="text-sm font-medium text-[#5d6043]">Report period:</span>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-[#b9aca2] px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
          </div>
        ) : (
          <>
            {/* 1. Owner snapshot */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <p className="text-sm font-medium text-[#5d6043]">Gross sales</p>
                <h3 className="mt-2 text-2xl font-bold text-[#222222]">
                  GHS {financeSummary?.totalRevenue.toFixed(2) || "0.00"}
                </h3>
                <div className="mt-1 flex flex-col gap-0.5">
                  <ChangeBadge value={financeSummary?.comparison?.revenueChangePercent} />
                  <ChangeBadge value={yoy?.revenue} label="vs same month last year" />
                </div>
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <p className="text-sm font-medium text-[#5d6043]">Offline share</p>
                <h3 className="mt-2 text-2xl font-bold text-[#222222]">{offlineShare}%</h3>
                <p className="mt-2 text-xs text-[#5d6043]">
                  GHS {(offlineRow?.revenue || 0).toFixed(2)} · {offlineRow?.orders || 0} orders
                </p>
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <p className="text-sm font-medium text-[#5d6043]">Net profit</p>
                <h3 className="mt-2 text-2xl font-bold text-[#222222]">
                  GHS {(pnl?.netProfit ?? financeSummary?.profit ?? 0).toFixed(2)}
                </h3>
                <div className="mt-1 flex flex-col gap-0.5">
                  <ChangeBadge value={financeSummary?.comparison?.profitChangePercent} />
                  <ChangeBadge value={yoy?.profit} label="vs same month last year" />
                </div>
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <p className="text-sm font-medium text-[#5d6043]">Net margin</p>
                <h3 className="mt-2 text-2xl font-bold text-[#222222]">
                  {pnl?.netMargin || financeSummary?.profitMargin || "0%"}
                </h3>
                <p className="mt-2 text-xs text-[#5d6043]">
                  {financeSummary?.orderCount || 0} paid orders · AOV GHS{" "}
                  {(financeSummary?.averageOrderValue || 0).toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <p className="text-sm font-medium text-[#5d6043]">Customers</p>
                <h3 className="mt-2 text-2xl font-bold text-[#222222]">
                  {customerSummary?.total ?? 0}
                </h3>
                <p className="mt-2 text-xs text-[#5d6043]">
                  {customerSummary?.new ?? 0} new · {customerSummary?.returning ?? 0} returning
                </p>
              </div>
            </div>

            {/* 2. Data quality banner */}
            {showQualityBanner ? (
              <div className="flex gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Data quality note</p>
                  {dataQuality?.cogsCoverage && dataQuality.cogsCoverage.coveragePercent < 100 ? (
                    <p className="mt-1">
                      COGS is available for {dataQuality.cogsCoverage.coveragePercent}% of sold
                      order lines — profit may be overstated until recipes/costs cover more sales.
                    </p>
                  ) : null}
                  {qualityWarnings.map((warning) => (
                    <p key={warning} className="mt-1">
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 3. Profit waterfall + discounts */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm lg:col-span-2">
                <h3 className="font-semibold text-[#222222]">Profit story</h3>
                <p className="mt-1 text-xs text-[#5d6043]">
                  How sales become net profit this period.
                </p>
                <div className="mt-4 space-y-2">
                  <WaterfallRow label="Gross sales" value={financeSummary?.totalRevenue || 0} />
                  <WaterfallRow
                    label="Gateway fees"
                    value={pnl?.transactionFees || financeSummary?.fees?.transactionFees || 0}
                    subtract
                  />
                  <WaterfallRow
                    label="Refunds"
                    value={pnl?.refundedAmount || 0}
                    subtract
                  />
                  <WaterfallRow
                    label="Discounts (product + code + manual)"
                    value={discountBreakdown?.total || 0}
                    subtract
                  />
                  <WaterfallRow label="COGS" value={pnl?.cogs || 0} subtract />
                  <WaterfallRow
                    label="Gross profit"
                    value={pnl?.grossProfit || 0}
                    emphasize
                  />
                  <WaterfallRow label="Overhead" value={pnl?.totalOpex || 0} subtract />
                  <WaterfallRow
                    label="Net profit"
                    value={pnl?.netProfit ?? financeSummary?.profit ?? 0}
                    emphasize
                  />
                </div>
                {financeSummary?.profitMarginExplanation ? (
                  <p className="mt-4 text-xs text-[#5d6043]">
                    {financeSummary.profitMarginExplanation}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <h3 className="font-semibold text-[#222222]">Discount breakdown</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ["Product sales", discountBreakdown?.productSale || 0],
                    ["Promotion codes", discountBreakdown?.promotionCode || 0],
                    ["Manual discounts", discountBreakdown?.manual || 0],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between text-[#5d6043]">
                      <span>{label}</span>
                      <span>GHS {Number(value).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#b9aca2]/50 pt-3 font-semibold text-[#222222]">
                    <span>Total discounts</span>
                    <span>GHS {(discountBreakdown?.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Channel & payment */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <h3 className="font-semibold text-[#222222]">By channel</h3>
                <div className="mt-3 space-y-3">
                  {byChannel.length === 0 ? (
                    <p className="text-sm text-[#5d6043]">No channel data.</p>
                  ) : (
                    byChannel.map((row) => {
                      const share = Number(
                        ((row.revenue / totalChannelRevenue) * 100).toFixed(1)
                      );
                      return (
                        <div key={row.channel}>
                          <div className="mb-1 flex justify-between text-sm text-[#5d6043]">
                            <span className="capitalize font-medium text-[#222222]">
                              {row.channel}
                            </span>
                            <span>
                              {share}% · GHS {row.revenue.toFixed(2)} · {row.orders}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#b9aca2]/30">
                            <div
                              className="h-full rounded-full bg-[#5d6043]"
                              style={{ width: `${Math.min(100, share)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <h3 className="font-semibold text-[#222222]">Payment methods</h3>
                <div className="mt-3 space-y-2">
                  {(financeSummary?.byPaymentMethod || []).length === 0 ? (
                    <p className="text-sm text-[#5d6043]">No payment data.</p>
                  ) : (
                    financeSummary?.byPaymentMethod?.map((row) => (
                      <div
                        key={row.paymentMethod}
                        className="flex justify-between text-sm text-[#5d6043]"
                      >
                        <span>{formatPaymentMethod(row.paymentMethod)}</span>
                        <span>
                          GHS {row.revenue.toFixed(2)} · {row.orders}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 5. Pace */}
            {pace && pace.elapsedDays > 0 ? (
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                <h3 className="font-semibold text-[#222222]">Month pace</h3>
                <p className="mt-2 text-sm text-[#5d6043]">
                  Based on {pace.elapsedDays} of {pace.daysInMonth} days: at this pace, the month
                  ends near{" "}
                  <span className="font-semibold text-[#222222]">
                    GHS {pace.projectedRevenue.toFixed(2)}
                  </span>{" "}
                  (~{pace.projectedOrders} orders).
                </p>
              </div>
            ) : null}

            {/* Weekly sales */}
            <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
              <h3 className="font-semibold text-[#222222]">Weekly sales</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(financeSummary?.weeklySales || []).length === 0 ? (
                  <p className="text-sm text-[#5d6043]">No weekly data.</p>
                ) : (
                  financeSummary?.weeklySales?.map((week) => (
                    <div
                      key={week.week}
                      className="rounded-lg border border-[rgba(34,34,34,0.08)] px-3 py-3 text-sm"
                    >
                      <p className="font-medium text-[#222222]">{week.label}</p>
                      <p className="mt-1 text-[#5d6043]">
                        GHS {week.revenue.toFixed(2)} · {week.orders} orders
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 6. What sold */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-6 shadow-sm lg:col-span-2">
                <h2 className="mb-4 text-xl font-bold text-[#222222]">Daily Sales</h2>
                {dailySales.length === 0 ? (
                  <p className="py-10 text-center text-[#5d6043]">No paid sales this month</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex min-h-[200px] items-end gap-2 pb-1">
                      {dailySales.map((day) => {
                        const barHeight = Math.max(
                          8,
                          Math.round((day.revenue / maxDailyRevenue) * 160)
                        );
                        const label = day.date.slice(8);
                        return (
                          <div
                            key={day.date}
                            className="group flex min-w-[32px] flex-1 flex-col items-center"
                            title={`${day.date}: GHS ${day.revenue.toFixed(2)} · ${day.orders} orders`}
                          >
                            <p className="mb-1 text-[10px] font-medium text-[#5d6043] opacity-0 transition group-hover:opacity-100">
                              {Math.round(day.revenue)}
                            </p>
                            <div
                              className="w-full rounded-t-md bg-[#5d6043] transition group-hover:bg-[#bd6325]"
                              style={{ height: `${barHeight}px` }}
                            />
                            <span className="mt-2 text-[11px] font-medium text-[#5d6043]">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-[#222222]">Delivery vs Pickup</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-[rgba(34,34,34,0.08)] px-3 py-3">
                      <div className="flex items-center gap-2 text-sm text-[#5d6043]">
                        <Truck className="h-4 w-4" />
                        Delivery
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-[#222222]">
                          {fulfillment?.delivery.orders || 0} orders
                        </p>
                        <p className="text-xs text-[#5d6043]">
                          GHS {(fulfillment?.delivery.revenue || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-[rgba(34,34,34,0.08)] px-3 py-3">
                      <div className="flex items-center gap-2 text-sm text-[#5d6043]">
                        <ShoppingBag className="h-4 w-4" />
                        Pickup
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-[#222222]">
                          {fulfillment?.pickup.orders || 0} orders
                        </p>
                        <p className="text-xs text-[#5d6043]">
                          GHS {(fulfillment?.pickup.revenue || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-[#222222]">Order Status</h2>
                  {statusBreakdown.length === 0 ? (
                    <p className="text-sm text-[#5d6043]">No orders this month</p>
                  ) : (
                    <div className="space-y-2">
                      {statusBreakdown.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize text-[#5d6043]">
                            {(item.status || "unknown").replace("-", " ")}
                          </span>
                          <span className="font-semibold text-[#222222]">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-[#222222]">Sales by Category</h2>
                <div className="mb-4 flex h-64 items-center justify-center">
                  {salesByCategory.length > 0 ? (
                    <div
                      className="relative flex h-48 w-48 items-center justify-center rounded-full transition-all duration-500"
                      style={{
                        background: `conic-gradient(${salesByCategory
                          .map((item, index) => {
                            const prevStats = salesByCategory
                              .slice(0, index)
                              .reduce((acc, curr) => acc + curr.percentage, 0);
                            return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${prevStats}% ${prevStats + item.percentage}%`;
                          })
                          .join(", ")})`,
                      }}
                    >
                      <div className="absolute inset-0 m-4 flex flex-col items-center justify-center rounded-full bg-[#faf9f5] shadow-inner">
                        <p className="text-2xl font-bold text-[#222222]">
                          GHS {financeSummary?.totalRevenue.toFixed(0) || "0"}
                        </p>
                        <p className="text-sm text-[#5d6043]">Period sales</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-[#b9aca2]/60">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#222222]">0%</p>
                        <p className="text-sm text-[#5d6043]">No Data</p>
                      </div>
                    </div>
                  )}
                </div>

                {salesByCategory.length === 0 ? (
                  <p className="py-8 text-center text-[#5d6043]">No sales data for this period</p>
                ) : (
                  <div className="space-y-3">
                    {salesByCategory.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{
                              backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }}
                          />
                          <span className="text-sm text-[#5d6043]">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#222222]">
                            GHS {item.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-[#5d6043]">{item.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-[#222222]">Top by revenue</h2>
                {topProducts.length === 0 ? (
                  <p className="py-8 text-center text-[#5d6043]">No product data for this period</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={String(product._id) + product.name}
                        className="flex items-center justify-between border-b border-[#b9aca2]/40 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#b9aca2]">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-semibold text-[#222222]">{product.name}</p>
                            <p className="text-xs text-[#5d6043]">{product.unitsSold} units sold</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#5d6043]">
                          GHS {product.revenue.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-6 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-[#222222]">Top by margin</h2>
                {topProductsByMargin.length === 0 ? (
                  <p className="py-8 text-center text-[#5d6043]">
                    No margin data yet — needs COGS on sold lines
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topProductsByMargin.map((product, index) => (
                      <div
                        key={String(product._id) + product.name}
                        className="flex items-center justify-between border-b border-[#b9aca2]/40 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#b9aca2]">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-semibold text-[#222222]">{product.name}</p>
                            <p className="text-xs text-[#5d6043]">
                              {product.unitsSold} units · {product.marginPercent}% margin
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#5d6043]">
                          GHS {product.margin.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 7. Top customers */}
            <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#222222]">Top Customers</h2>
                {customersMeta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomersPage((prev) => Math.max(1, prev - 1))}
                      disabled={customersPage === 1 || loading}
                      className="rounded-lg border border-[#b9aca2] p-2 hover:bg-[#faf9f5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-[#5d6043]">
                      Page {customersPage} of {customersMeta.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomersPage((prev) => Math.min(customersMeta.totalPages, prev + 1))
                      }
                      disabled={customersPage === customersMeta.totalPages || loading}
                      className="rounded-lg border border-[#b9aca2] p-2 hover:bg-[#faf9f5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {topCustomers.length === 0 ? (
                <p className="py-12 text-center text-[#5d6043]">No customer data for this period</p>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead className="border-b border-[#b9aca2]/60 bg-[#faf9f5]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5d6043]">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5d6043]">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5d6043]">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5d6043]">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5d6043]">
                            Spent
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#b9aca2]/60">
                        {topCustomers.map((customer) => (
                          <tr key={`${customer.userId}-${customer.rank}`} className="hover:bg-[#faf9f5]">
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-lg font-bold text-[#b9aca2]">#{customer.rank}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5d6043] font-semibold text-[#faf9f5]">
                                  {customer.fullName?.charAt(0) || "?"}
                                </div>
                                <span className="ml-3 text-sm font-semibold text-[#222222]">
                                  {customer.fullName}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-sm text-[#5d6043]">{customer.email || "—"}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-sm text-[#222222]">{customer.totalOrders}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-sm font-semibold text-[#5d6043]">
                                GHS {customer.totalSpent.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {topCustomers.map((customer) => (
                      <div
                        key={`${customer.userId}-${customer.rank}-m`}
                        className="rounded-lg border border-[#b9aca2]/60 p-4"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5d6043] font-semibold text-[#faf9f5]">
                            {customer.fullName?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#222222]">{customer.fullName}</h3>
                            <p className="text-xs text-[#5d6043]">{customer.email || "—"}</p>
                            <p className="text-xs text-[#5d6043]">Rank #{customer.rank}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="mb-1 text-xs text-[#5d6043]">Orders</p>
                            <p className="text-sm font-semibold text-[#222222]">{customer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs text-[#5d6043]">Spent</p>
                            <p className="text-sm font-semibold text-[#5d6043]">
                              GHS {customer.totalSpent.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 8. Marketing */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg border border-[#b9aca2]/40 bg-[#faf9f5] lg:col-span-2">
                <div className="border-b border-[#b9aca2]/40 p-5">
                  <h3 className="font-semibold text-[#222222]">Promotion code performance</h3>
                  <p className="mt-1 text-xs text-[#5d6043]">
                    Paid orders attributed during this report period.
                  </p>
                </div>
                {promotionCodes.length === 0 ? (
                  <p className="p-8 text-center text-sm text-[#5d6043]">
                    No paid promotion-code orders this month.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-sm">
                      <thead className="bg-[#f4efe7] text-left text-xs uppercase text-[#5d6043]">
                        <tr>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3 text-right">Uses</th>
                          <th className="px-4 py-3 text-right">Customers</th>
                          <th className="px-4 py-3 text-right">GMV</th>
                          <th className="px-4 py-3 text-right">Discount</th>
                          <th className="px-4 py-3 text-right">Net revenue</th>
                          <th className="px-4 py-3 text-right">AOV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#b9aca2]/40">
                        {promotionCodes.map((promotion) => (
                          <tr key={`${promotion.promotionId || promotion.code}-${promotion.code}`}>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[#222222]">{promotion.code}</p>
                              <p className="text-xs text-[#5d6043]">
                                {promotion.influencerName || promotion.name}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right text-[#5d6043]">
                              {promotion.paidUses}
                            </td>
                            <td className="px-4 py-3 text-right text-[#5d6043]">
                              {promotion.uniqueCustomers}
                            </td>
                            <td className="px-4 py-3 text-right text-[#5d6043]">
                              GHS {promotion.grossMerchandiseValue.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-green-700">
                              GHS {promotion.discountGiven.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-[#222222]">
                              GHS {promotion.netRevenue.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-[#5d6043]">
                              GHS {promotion.averageOrderValue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                  <h3 className="font-semibold text-[#222222]">Reviews this month</h3>
                  <p className="mt-2 text-sm text-[#5d6043]">
                    Total {financeSummary?.reviews?.total || 0} · Approved{" "}
                    {financeSummary?.reviews?.approved || 0} · Pending{" "}
                    {financeSummary?.reviews?.pending || 0} · Rejected{" "}
                    {financeSummary?.reviews?.rejected || 0}
                  </p>
                  <p className="mt-1 text-sm text-[#5d6043]">
                    Avg approved rating: {financeSummary?.reviews?.averageApprovedRating ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#b9aca2]/40 bg-[#faf9f5] p-5 shadow-sm">
                  <h3 className="font-semibold text-[#222222]">Overhead cost breakdown</h3>
                  <div className="mt-3 space-y-2">
                    {(pnl?.opexBreakdown || []).length === 0 ? (
                      <p className="text-sm text-[#5d6043]">No overhead costs recorded.</p>
                    ) : (
                      pnl?.opexBreakdown?.map((row) => (
                        <div key={row.category} className="flex justify-between text-sm text-[#5d6043]">
                          <span>{row.category}</span>
                          <span>GHS {row.amount.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
