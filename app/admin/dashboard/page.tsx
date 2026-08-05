"use client";

import {
  AnalyticsUpIcon,
  ArrowRight01Icon,
  Award01Icon,
  Loading03Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import AdminPageHeader from "../components/AdminPageHeader";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import { useDashboardOverview, usePopularProducts } from "../../hooks/useDashboard";

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

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
        <AdminPageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.fullName}`}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <AdminIcon icon={Loading03Icon} size={32} className="text-[#5d6043] animate-spin" />
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && dashboardData && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Sales Card */}
              <div className="bg-[#faf9f5] rounded-2xl shadow-sm p-6 border border-[#b9aca2]/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Daily Sales</p>
                    <h3 className="text-2xl font-bold text-[#222222] mt-2">
                      ₵ {dashboardData.dailyStats.sales.toFixed(2)}
                    </h3>
                    <p className="text-xs text-[#5d6043] mt-1">
                      {dashboardData.dailyStats.orders} orders today
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">₵</span>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Card */}
              <div className="bg-[#faf9f5] rounded-2xl shadow-sm p-6 border border-[#b9aca2]/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Monthly Revenue</p>
                    <h3 className="text-2xl font-bold text-[#222222] mt-2">
                      ₵ {dashboardData.monthlyStats.sales.toFixed(2)}
                    </h3>
                    <p className="text-xs text-[#5d6043] mt-1">
                      {dashboardData.monthlyStats.orders} orders this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <AdminIcon icon={AnalyticsUpIcon} size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Best Seller This Week Card */}
              <div className="bg-[#faf9f5] rounded-2xl shadow-sm p-6 border border-[#b9aca2]/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Best Seller (Week)</p>
                    <h3 className="text-lg font-bold text-[#222222] mt-2">
                      {dashboardData.bestSellerThisWeek?.name || "N/A"}
                    </h3>
                    <p className="text-xs text-[#5d6043] mt-1">
                      {dashboardData.bestSellerThisWeek?.quantitySold || 0} sold
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AdminIcon icon={Award01Icon} size={24} className="text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Best Seller This Month Card */}
              <div className="bg-[#faf9f5] rounded-2xl shadow-sm p-6 border border-[#b9aca2]/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5d6043]">Best Seller (Month)</p>
                    <h3 className="text-lg font-bold text-[#222222] mt-2">
                      {dashboardData.bestSellerThisMonth?.name || "N/A"}
                    </h3>
                    <p className="text-xs text-[#5d6043] mt-1">
                      {dashboardData.bestSellerThisMonth?.quantitySold || 0} sold
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AdminIcon icon={Award01Icon} size={24} className="text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Best Seller of the Month - Detailed Card */}
            {dashboardData.bestSellerThisMonth && (
              <div className="bg-[#faf9f5] rounded-2xl shadow-sm border border-[#b9aca2]/40 p-6">
                <h2 className="text-xl font-bold text-[#222222] mb-4">
                  Best Seller of the Month
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-48 h-48 bg-[#b9aca2] rounded-xl relative overflow-hidden flex-shrink-0">
                    {(dashboardData.bestSellerThisMonth.thumbnail || dashboardData.bestSellerThisMonth.productThumbnail) ? (
                      <Image
                        src={dashboardData.bestSellerThisMonth.thumbnail || dashboardData.bestSellerThisMonth.productThumbnail || ''}
                        alt={dashboardData.bestSellerThisMonth.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-[#b9aca2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <AdminIcon icon={Package01Icon} size={64} className="text-[#b9aca2]" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 w-full">
                    <h3 className="text-2xl font-bold text-[#222222] mb-2">
                      {dashboardData.bestSellerThisMonth.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-[#5d6043] mb-1">Total Sold</p>
                        <p className="text-2xl font-bold text-green-600">
                          {dashboardData.bestSellerThisMonth.quantitySold}
                        </p>
                        <p className="text-xs text-[#5d6043] mt-1">units this month</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-[#5d6043] mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₵ {dashboardData.bestSellerThisMonth.revenue?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-[#5d6043] mt-1">total earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Dishes Section */}
            <div className="bg-[#faf9f5] rounded-2xl shadow-sm border border-[#b9aca2]/40 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#222222]">Popular Products</h2>
                <button 
                  onClick={() => router.push("/admin/products")}
                  className="flex items-center gap-2 text-[#5d6043] font-medium hover:underline"
                >
                  See All
                  <AdminIcon icon={ArrowRight01Icon} size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
                  <div
                    key={product.id || product._id}
                    className="border border-[#b9aca2]/60 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="w-full h-32 bg-[#b9aca2] rounded-lg mb-3 relative overflow-hidden">
                      <Image
                        src={product.thumbnail || product.productThumbnail || "/placeholder.png"}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-[#222222] mb-2">{product.productName}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#5d6043]">
                        GHS {product?.price?.toFixed(2)}
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
                <div className="text-center py-8 text-[#5d6043]">
                  <AdminIcon icon={Package01Icon} size={48} className="mx-auto mb-2 text-[#b9aca2]" />
                  <p>No popular products data available</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}
