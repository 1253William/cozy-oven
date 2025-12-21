"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  DollarSign,
  TrendingUp,
  Award,
  ArrowRight,
  Download,
  Package,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useDashboardOverview, usePopularProducts } from "../../hooks/useDashboard";

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [chartFilter, setChartFilter] = useState<"daily" | "monthly" | "overview">("monthly");

  // Constants
  const PRODUCT_ID_DISPLAY_LENGTH = 8;

  // Fetch real dashboard data
  const { data: dashboardData, loading: dashboardLoading } = useDashboardOverview();
  const { products: popularProducts, loading: productsLoading } = usePopularProducts(1, 4);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const loading = dashboardLoading || productsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && dashboardData && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Sales Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Sales</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      GHS {dashboardData.dailyStats.sales.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {dashboardData.dailyStats.orders} orders today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      GHS {dashboardData.monthlyStats.sales.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {dashboardData.monthlyStats.orders} orders this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Best Seller This Week Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Seller (Week)</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">
                      {dashboardData.bestSellerThisWeek?.name || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {dashboardData.bestSellerThisWeek?.quantitySold || 0} sold
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Best Seller This Month Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Seller (Month)</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">
                      {dashboardData.bestSellerThisMonth?.name || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {dashboardData.bestSellerThisMonth?.quantitySold || 0} sold
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Best Seller of the Month - Detailed Card */}
            {dashboardData.bestSellerThisMonth && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Best Seller of the Month
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-48 h-48 bg-gray-200 rounded-xl relative overflow-hidden flex-shrink-0">
                    {dashboardData.bestSellerThisMonth.productThumbnail ? (
                      <Image
                        src={dashboardData.bestSellerThisMonth.productThumbnail}
                        alt={dashboardData.bestSellerThisMonth.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 w-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {dashboardData.bestSellerThisMonth.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Sold</p>
                        <p className="text-2xl font-bold text-green-600">
                          {dashboardData.bestSellerThisMonth.quantitySold}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">units this month</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">
                          GHS {dashboardData.bestSellerThisMonth.revenue?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">total earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Dishes Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Popular Products</h2>
                <button 
                  onClick={() => router.push("/admin/products")}
                  className="flex items-center gap-2 text-[#2A2C22] font-medium hover:underline"
                >
                  See All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
                      <Image
                        src={product.productThumbnail || "/placeholder.png"}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#2A2C22]">
                        GHS {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {product.totalQuantitySold} sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show placeholder if no products */}
              {popularProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No popular products data available</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Overview Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
            <div className="flex items-center gap-3">
              {/* Filter Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartFilter("daily")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartFilter === "daily"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartFilter("monthly")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartFilter === "monthly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setChartFilter("overview")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartFilter === "overview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Overview
                </button>
              </div>
              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-80">
            <div className="h-full flex items-end justify-between gap-4 px-4">
              {chartFilter === "daily" && [
                { label: "Mon", value: 850 },
                { label: "Tue", value: 1200 },
                { label: "Wed", value: 950 },
                { label: "Thu", value: 1100 },
                { label: "Fri", value: 1400 },
                { label: "Sat", value: 1600 },
                { label: "Sun", value: 1300 },
              ].map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative group">
                    <div
                      className="w-full bg-[#2A2C22] rounded-t-lg transition-all duration-500 hover:bg-[#3a3c32] cursor-pointer"
                      style={{ height: `${(day.value / 1600) * 280}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        GHS {day.value}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{day.label}</span>
                </div>
              ))}
              {chartFilter === "monthly" && [
                { label: "Jan", value: 35000 },
                { label: "Feb", value: 38000 },
                { label: "Mar", value: 42000 },
                { label: "Apr", value: 39000 },
                { label: "May", value: 45000 },
                { label: "Jun", value: 46000 },
              ].map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative group">
                    <div
                      className="w-full bg-[#2A2C22] rounded-t-lg transition-all duration-500 hover:bg-[#3a3c32] cursor-pointer"
                      style={{ height: `${(month.value / 46000) * 280}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        GHS {month.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{month.label}</span>
                </div>
              ))}
              {chartFilter === "overview" && [
                { label: "Q1", value: 115000 },
                { label: "Q2", value: 130000 },
                { label: "Q3", value: 125000 },
                { label: "Q4", value: 140000 },
              ].map((quarter, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative group">
                    <div
                      className="w-full bg-[#2A2C22] rounded-t-lg transition-all duration-500 hover:bg-[#3a3c32] cursor-pointer"
                      style={{ height: `${(quarter.value / 140000) * 280}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        GHS {quarter.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{quarter.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
