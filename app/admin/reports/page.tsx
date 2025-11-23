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
} from "lucide-react";

// Mock data - replace with actual API calls
const mockReportData = {
  salesByCategory: [
    { category: "Classic", sales: 12500, percentage: 35 },
    { category: "Chocolate", sales: 9800, percentage: 27 },
    { category: "Fruits", sales: 7200, percentage: 20 },
    { category: "Nuts & Seeds", sales: 4500, percentage: 12 },
    { category: "Specialty", sales: 2000, percentage: 6 },
  ],
  topCustomers: [
    { name: "Sarah Williams", orders: 22, spent: 2150.00 },
    { name: "John Doe", orders: 15, spent: 1250.50 },
    { name: "David Brown", orders: 12, spent: 980.75 },
    { name: "Jane Smith", orders: 8, spent: 680.25 },
    { name: "Michael Johnson", orders: 3, spent: 195.75 },
  ],
  topProducts: [
    { name: "Chocolate Banana Bread", sold: 156, revenue: 4368.44 },
    { name: "Classic Banana Bread", sold: 142, revenue: 3690.58 },
    { name: "Walnut Banana Bread", sold: 98, revenue: 2939.02 },
    { name: "Blueberry Banana Bread", sold: 87, revenue: 2520.13 },
    { name: "Double Chocolate Delight", sold: 65, revenue: 1819.35 },
  ],
};

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const totalSales = mockReportData.salesByCategory.reduce((acc, item) => acc + item.sales, 0);

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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Report Period:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDateRange("week")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateRange === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateRange === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange("year")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  dateRange === "year"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                This Year
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  GHS {totalSales.toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15.3% from last period
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">548</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.2% from last period
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Customers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">127</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.5% from last period
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg. Order Value</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">GHS 65.33</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +5.7% from last period
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Category - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Category</h2>
            
            {/* Pie Chart Placeholder */}
            <div className="flex items-center justify-center h-64 mb-4">
              <div className="relative w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-600">Total Sales</p>
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {mockReportData.salesByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: [
                          "#2A2C22",
                          "#4CAF50",
                          "#2196F3",
                          "#FF9800",
                          "#9C27B0",
                        ][index],
                      }}
                    />
                    <span className="text-sm text-gray-700">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      GHS {item.sales.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
            <div className="space-y-4">
              {mockReportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sold} units sold</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#2A2C22]">
                    GHS {product.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Customers</h2>
          <div className="overflow-x-auto">
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
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockReportData.topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="ml-3 text-sm font-semibold text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{customer.orders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#2A2C22]">
                        GHS {customer.spent.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
