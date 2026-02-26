"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Download,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import reportsService, {
  type FinanceSummary,
  type SalesByCategory,
  type TopSellingProduct,
  type TopCustomer,
} from "../../services/reportsService";

// Color palette for category charts
const CATEGORY_COLORS = [
  "#2A2C22",
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
];

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Finance Summary State
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Sales Data State
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  
  // Pagination State
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
    if (isAuthenticated && user?.role === "Admin") {
      fetchAllReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, selectedMonth, selectedYear, customersPage]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      // Fetch all reports in parallel
      const [financeRes, categoryRes, productsRes, customersRes] = await Promise.all([
        reportsService.getFinanceSummary(selectedMonth, selectedYear),
        reportsService.getSalesByCategory(),
        reportsService.getTopSellingProducts(),
        reportsService.getTopCustomers(customersPage, 5),
      ]);

      if (financeRes.success) {
        setFinanceSummary(financeRes.data);
      }

      if (categoryRes.success) {
        setSalesByCategory(categoryRes.data);
      }

      if (productsRes.success) {
        setTopProducts(productsRes.data);
      }

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

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed insights into your business</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Finance Period:</span>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              >
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    GHS {financeSummary?.totalRevenue.toFixed(2) || "0.00"}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedMonth} {selectedYear}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    GHS {financeSummary?.totalExpenses.toFixed(2) || "0.00"}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedMonth} {selectedYear}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Profit</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    GHS {financeSummary?.profit.toFixed(2) || "0.00"}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedMonth} {selectedYear}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Profit Margin</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {financeSummary?.profitMargin || "0%"}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Category</h2>
            
            {/* Pie Chart */}
            <div className="flex items-center justify-center h-64 mb-4">
              {salesByCategory.length > 0 ? (
                <div 
                  className="relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: `conic-gradient(${salesByCategory.map((item, index) => {
                      const prevStats = salesByCategory.slice(0, index).reduce((acc, curr) => acc + curr.percentage, 0);
                      return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${prevStats}% ${prevStats + item.percentage}%`;
                    }).join(", ")})`
                  }}
                >
                  <div className="absolute inset-0 m-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <p className="text-2xl font-bold text-gray-900">
                      GHS {financeSummary?.totalRevenue.toFixed(0) || "0"}
                    </p>
                    <p className="text-sm text-gray-600">Total Sales</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">0%</p>
                    <p className="text-sm text-gray-600">No Data</p>
                  </div>
                </div>
              )}
            </div>

            {/* Category List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#2A2C22] animate-spin" />
              </div>
            ) : salesByCategory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {salesByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-gray-700">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        GHS {item.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#2A2C22] animate-spin" />
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No product data available</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.unitsSold} units sold</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#2A2C22]">
                      GHS {product.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Customers</h2>
            {customersMeta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomersPage(prev => Math.max(1, prev - 1))}
                  disabled={customersPage === 1 || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {customersPage} of {customersMeta.totalPages}
                </span>
                <button
                  onClick={() => setCustomersPage(prev => Math.min(customersMeta.totalPages, prev + 1))}
                  disabled={customersPage === customersMeta.totalPages || loading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
            </div>
          ) : topCustomers.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No customer data available</p>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topCustomers.map((customer) => (
                      <tr key={customer.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-gray-400">#{customer.rank}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.fullName.charAt(0)}
                            </div>
                            <span className="ml-3 text-sm font-semibold text-gray-900">
                              {customer.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{customer.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{customer.totalOrders}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-[#2A2C22]">
                            GHS {customer.totalSpent.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {topCustomers.map((customer) => (
                  <div key={customer.userId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.fullName}</h3>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-500">Rank #{customer.rank}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                        <p className="text-sm font-semibold text-gray-900">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                        <p className="text-sm font-semibold text-[#2A2C22]">GHS {customer.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
