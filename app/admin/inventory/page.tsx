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
  Loader2,
  Trash2,
} from "lucide-react";
import inventoryService, { type InventoryItem } from "../../services/inventoryService";
import AddInventoryModal from "./components/AddInventoryModal";
import EditInventoryModal from "./components/EditInventoryModal";

export default function InventoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Add Inventory Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addItemName, setAddItemName] = useState("");
  const [addQuantityPurchased, setAddQuantityPurchased] = useState(0);
  const [addCostPrice, setAddCostPrice] = useState(0);
  const [addVendorName, setAddVendorName] = useState("");
  const [addVendorContact, setAddVendorContact] = useState("");
  const [addPurchasePurpose, setAddPurchasePurpose] = useState("");
  const [addItemCategory, setAddItemCategory] = useState("");

  // Edit Inventory Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editQuantityPurchased, setEditQuantityPurchased] = useState(0);
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorContact, setEditVendorContact] = useState("");
  const [editPurchasePurpose, setEditPurchasePurpose] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");

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
  }, [isAuthenticated, user, currentPage, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllInventory({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
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

  // Add Inventory Handler
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const response = await inventoryService.createInventory({
        itemName: addItemName,
        quantityPurchased: addQuantityPurchased,
        costPrice: addCostPrice,
        vendorName: addVendorName,
        vendorContact: addVendorContact,
        purchasePurpose: addPurchasePurpose,
        itemCategory: addItemCategory,
      });
      if (response.success) {
        alert(response.message);
        setShowAddModal(false);
        resetAddForm();
        fetchInventory();
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      alert("Failed to create inventory item");
    } finally {
      setAddLoading(false);
    }
  };

  const resetAddForm = () => {
    setAddItemName("");
    setAddQuantityPurchased(0);
    setAddCostPrice(0);
    setAddVendorName("");
    setAddVendorContact("");
    setAddPurchasePurpose("");
    setAddItemCategory("");
  };

  // Edit Inventory Handler
  const handleEditClick = async (item: InventoryItem) => {
    try {
      // Fetch full item details
      const response = await inventoryService.getInventoryItem(item._id);
      if (response.success) {
        const fullItem = response.data;
        setSelectedItem(fullItem);
        setEditItemName(fullItem.itemName);
        setEditQuantityPurchased(fullItem.quantityRemaining);
        setEditCostPrice(fullItem.costPrice);
        setEditVendorName(fullItem.vendorName);
        setEditVendorContact(fullItem.vendorContact || "");
        setEditPurchasePurpose(fullItem.purchasePurpose || "");
        setEditItemCategory(fullItem.itemCategory);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      alert("Failed to fetch inventory item details");
    }
  };

  const handleEditInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setEditLoading(true);
    try {
      const response = await inventoryService.updateInventory(selectedItem._id, {
        itemName: editItemName,
        itemQuantity: editQuantityPurchased,
        itemPrice: editCostPrice,
        itemCategory: editItemCategory,
      });
      if (response.success) {
        alert(response.message);
        setShowEditModal(false);
        setSelectedItem(null);
        fetchInventory();
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update inventory item");
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const filteredInventory = inventory;

  const stats = {
    totalProducts: inventory?.length,
    lowStock: inventory?.filter((item) => item.itemStatus === "low stock").length,
    outOfStock: inventory?.filter((item) => item.itemStatus === "out of stock").length,
    totalValue: inventory
      ?.reduce((acc, item) => acc + item.quantityRemaining * item.costPrice, 0)
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



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your product stock levels</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Inventory
          </button>
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchInventory();
                  }
                }}
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
                ) : filteredInventory?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory?.map((item) => (
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
                            onClick={() => handleEditClick(item)}
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

          {/* Mobile Cards View - Simplified */}
          <div className="md:hidden p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin mx-auto" />
              </div>
            ) : filteredInventory?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No inventory items found</p>
              </div>
            ) : (
              filteredInventory?.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                        <p className="text-sm text-gray-500">{item.itemCategory}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.itemStatus)}`}>
                      {getStockIcon(item.itemStatus)}
                      {item.itemStatus.charAt(0).toUpperCase() + item.itemStatus.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">SKU</p>
                      <p className="text-sm font-medium text-gray-900">{item.itemSKU}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Stock</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.quantityRemaining} / {item.quantityPurchased}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Unit Cost</p>
                      <p className="text-sm font-semibold text-gray-900">GHS {item.costPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Actions</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-[#2A2C22] hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Empty State */}
          {filteredInventory?.length === 0 && !loading && (
            <div className="hidden md:block text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
        onSubmit={handleAddInventory}
        itemName={addItemName}
        quantityPurchased={addQuantityPurchased}
        costPrice={addCostPrice}
        vendorName={addVendorName}
        vendorContact={addVendorContact}
        purchasePurpose={addPurchasePurpose}
        itemCategory={addItemCategory}
        loading={addLoading}
        onItemNameChange={setAddItemName}
        onQuantityPurchasedChange={setAddQuantityPurchased}
        onCostPriceChange={setAddCostPrice}
        onVendorNameChange={setAddVendorName}
        onVendorContactChange={setAddVendorContact}
        onPurchasePurposeChange={setAddPurchasePurpose}
        onItemCategoryChange={setAddItemCategory}
      />

      {/* Edit Inventory Modal */}
      <EditInventoryModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditInventory}
        selectedItem={selectedItem}
        itemName={editItemName}
        quantityPurchased={editQuantityPurchased}
        costPrice={editCostPrice}
        vendorName={editVendorName}
        vendorContact={editVendorContact}
        purchasePurpose={editPurchasePurpose}
        itemCategory={editItemCategory}
        loading={editLoading}
        onItemNameChange={setEditItemName}
        onQuantityPurchasedChange={setEditQuantityPurchased}
        onCostPriceChange={setEditCostPrice}
        onVendorNameChange={setEditVendorName}
        onVendorContactChange={setEditVendorContact}
        onPurchasePurposeChange={setEditPurchasePurpose}
        onItemCategoryChange={setEditItemCategory}
      />
    </AdminLayout>
  );
}
