"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Edit2,
  Plus,
  Minus,
  Loader2,
  Trash2,
} from "lucide-react";
import InventoryCards from "./components/InventoryCards";
import inventoryService, { type InventoryItem } from "../../services/inventoryService";

export default function InventoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setcategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, currentPage, statusFilter, categoryFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllInventory({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });
      if (response.success) {
        setInventory(response.data);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      try {
        const response = await inventoryService.deleteInventory(id);
        if (response.success) {
          alert(response.message);
          fetchInventory();
        }
      } catch (error) {
        console.error("Error deleting inventory:", error);
        alert("Failed to delete inventory item");
      }
    }
  };

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const filteredInventory = inventory;

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter((item) => item.itemStatus === "low stock").length,
    outOfStock: inventory.filter((item) => item.itemStatus === "out of stock").length,
    totalValue: inventory
      .reduce((acc, item) => acc + item.quantityRemaining * item.costPrice, 0)
      .toFixed(2),
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return "bg-green-100 text-green-700";
      case "low stock":
        return "bg-yellow-100 text-yellow-700";
      case "out of stock":
        return "bg-red-100 text-red-700";
      case "damaged":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStockIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return <TrendingUp className="w-4 h-4" />;
      case "low stock":
        return <AlertCircle className="w-4 h-4" />;
      case "out of stock":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleStockAdjustment = async (itemId: string) => {
    const item = inventory.find((i) => i._id === itemId);
    if (!item) return;

    // Validate adjustment amount
    if (adjustmentAmount <= 0) {
      alert("Adjustment amount must be a positive number");
      return;
    }

    try {
      // Calculate new quantity based on adjustment type
      const currentQty = item.quantityRemaining;
      const newQty = adjustmentType === "add" 
        ? currentQty + adjustmentAmount 
        : Math.max(0, currentQty - adjustmentAmount);

      const response = await inventoryService.updateInventory(itemId, {
        itemQuantity: newQty,
      });
      if (response.success) {
        alert(response.message);
        fetchInventory();
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Failed to adjust stock");
    }
    setSelectedItem(null);
    setAdjustmentAmount(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">GHS {stats.totalValue}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, SKU, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table/Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reorder Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {item.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{item.itemSKU}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{item.itemCategory}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.quantityRemaining}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {item.quantityPurchased}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">-</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          GHS {item.costPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.itemStatus
                          )}`}
                        >
                          {getStockIcon(item.itemStatus)}
                          {item.itemStatus.charAt(0).toUpperCase() + item.itemStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedItem(item._id)}
                            className="p-1 text-[#2A2C22] hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden p-4">
            <InventoryCards
              items={filteredInventory}
              onAdjustStock={handleStockAdjustment}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              adjustmentType={adjustmentType}
              setAdjustmentType={setAdjustmentType}
              adjustmentAmount={adjustmentAmount}
              setAdjustmentAmount={setAdjustmentAmount}
            />
          </div>

          {/* Empty State */}
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal - Only for Desktop */}
      {selectedItem && (
        <div className="hidden md:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Adjust Stock</h2>
            <p className="text-gray-600 mb-6">
              Adjust the stock level for{" "}
              {mockInventory.find((i) => i.id === selectedItem)?.productName}
            </p>

            <div className="space-y-4">
              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustmentType("add")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      adjustmentType === "add"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Stock
                  </button>
                  <button
                    onClick={() => setAdjustmentType("remove")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      adjustmentType === "remove"
                        ? "bg-red-100 border-red-500 text-red-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Remove Stock
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              {/* Current Stock Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {mockInventory.find((i) => i.id === selectedItem)?.currentStock}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">New Stock:</span>
                  <span className="text-sm font-semibold text-[#2A2C22]">
                    {adjustmentType === "add"
                      ? (mockInventory.find((i) => i.id === selectedItem)?.currentStock ||
                          0) + adjustmentAmount
                      : Math.max(
                          0,
                          (mockInventory.find((i) => i.id === selectedItem)
                            ?.currentStock || 0) - adjustmentAmount
                        )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setAdjustmentAmount(0);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockAdjustment(selectedItem)}
                className="flex-1 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
