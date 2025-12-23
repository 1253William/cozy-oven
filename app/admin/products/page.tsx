"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Filter,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Product, SelectOption } from "../../services/productService";
import useAdminProducts from "../../hooks/useAdminProducts";
import useProductManagement from "../../hooks/useProductManagement";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import ProductGrid from "./components/ProductGrid";

export default function ProductManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "productName">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productCategory: "",
    price: 0,
    productDetails: "",
  });
  const [selectOptionInput, setSelectOptionInput] = useState({ label: "", additionalPrice: 0 });
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

  // Use custom hooks
  const { products, loading, pagination, refetch } = useAdminProducts({
    page: currentPage,
    limit: 12,
    category: categoryFilter || undefined,
    sortBy,
    order,
  });

  // Get unique categories dynamically from products
  const categories = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    products.forEach(product => {
      if (product.productCategory) {
        categoriesSet.add(product.productCategory);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [products]);

  const {
    loading: actionLoading,
    error: actionError,
    success: actionSuccess,
    createProductWithImage,
    updateProduct,
    updateProductWithImage,
    clearMessages,
  } = useProductManagement();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  // Clear messages after timeout
  useEffect(() => {
    if (actionError || actionSuccess) {
      const timer = setTimeout(() => clearMessages(), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError, actionSuccess, clearMessages]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSelectOption = () => {
    if (selectOptionInput.label) {
      setSelectOptions([...selectOptions, selectOptionInput]);
      setSelectOptionInput({ label: "", additionalPrice: 0 });
    }
  };

  const removeSelectOption = (index: number) => {
    setSelectOptions(selectOptions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewProduct({
      productName: "",
      productCategory: "",
      price: 0,
      productDetails: "",
    });
    setSelectOptions([]);
    setImageFile(null);
    setImagePreview("");
    setSelectOptionInput({ label: "", additionalPrice: 0 });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newProduct.productName.trim()) {
        console.error("Product name is required");
        return;
      }
      
      if (!newProduct.productCategory) {
        console.error("Product category is required");
        return;
      }
      
      if (newProduct.price <= 0) {
        console.error("Product price must be greater than 0");
        return;
      }
      
      if (!newProduct.productDetails.trim()) {
        console.error("Product details are required");
        return;
      }
      
      if (!imageFile) {
        console.error("Product image is required");
        return;
      }

      // Validate image file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        console.error("Invalid image type. Only JPEG, PNG, and WebP are allowed");
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        console.error("Image size must be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("productName", newProduct.productName.trim());
      formData.append("price", newProduct.price.toString());
      formData.append("productCategory", newProduct.productCategory);
      formData.append("productDetails", newProduct.productDetails.trim());
      // Only append selectOptions if there are any
      if (selectOptions.length > 0) {
        formData.append("selectOptions", JSON.stringify(selectOptions));
      }
      // Change field name from "productThumbnail" to "image" to match backend expectations
      formData.append("image", imageFile);

      await createProductWithImage(formData);
      setShowAddModal(false);
      resetForm();
      await refetch();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      // Validate if there are any changes
      const hasChanges = 
        newProduct.productName !== selectedProduct.productName ||
        newProduct.price !== selectedProduct.price ||
        newProduct.productCategory !== selectedProduct.productCategory ||
        newProduct.productDetails !== selectedProduct.productDetails ||
        imageFile !== null ||
        JSON.stringify(selectOptions) !== JSON.stringify(selectedProduct.selectOptions);
      
      if (!hasChanges) {
        console.log("No changes detected");
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        return;
      }

      // Validate price if changed
      if (newProduct.price && newProduct.price <= 0) {
        console.error("Product price must be greater than 0");
        return;
      }

      if (imageFile) {
        // Validate image file type and size
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
          console.error("Invalid image type. Only JPEG, PNG, and WebP are allowed");
          return;
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
          console.error("Image size must be less than 5MB");
          return;
        }

        const formData = new FormData();
        if (newProduct.productName && newProduct.productName.trim())
          formData.append("productName", newProduct.productName.trim());
        if (newProduct.price) formData.append("price", newProduct.price.toString());
        if (newProduct.productCategory)
          formData.append("productCategory", newProduct.productCategory);
        if (newProduct.productDetails && newProduct.productDetails.trim())
          formData.append("productDetails", newProduct.productDetails.trim());
        if (selectOptions.length > 0)
          formData.append("selectOptions", JSON.stringify(selectOptions));
        // Change field name from "productThumbnail" to "image" to match backend expectations
        formData.append("image", imageFile);

        await updateProductWithImage(selectedProduct._id, formData);
      } else {
        await updateProduct(selectedProduct._id, {
          productName: newProduct.productName?.trim() || undefined,
          price: newProduct.price || undefined,
          productCategory: newProduct.productCategory || undefined,
          productDetails: newProduct.productDetails?.trim() || undefined,
          selectOptions: selectOptions.length > 0 ? selectOptions : undefined,
        });
      }

      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      await refetch();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      productName: product.productName,
      productCategory: product.productCategory,
      price: product.price,
      productDetails: product.productDetails,
    });
    setSelectOptions(product.selectOptions || []);
    setImagePreview(product.productThumbnail);
    setShowEditModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
  };

  return (
    <AdminLayout>
      {/* Toast Notifications */}
      {actionError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {actionSuccess}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your products and categories</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors"
            disabled={loading || actionLoading}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Categories - Only show if there are categories with products */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => setCategoryFilter(category === categoryFilter ? "" : category)}
                  className={`bg-white rounded-xl shadow-sm p-4 border transition-all cursor-pointer ${
                    categoryFilter === category
                      ? "border-[#2A2C22] ring-2 ring-[#2A2C22]/20"
                      : "border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className="w-12 h-12 bg-[#2A2C22] rounded-full flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{category}</h3>
                </div>
              ))}
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
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "createdAt" | "price" | "productName")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="productName">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>

            {/* Order */}
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#2A2C22] animate-spin" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <ProductGrid products={filteredProducts} onEdit={openEditModal} />

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddProduct}
        productName={newProduct.productName}
        productCategory={newProduct.productCategory}
        price={newProduct.price}
        productDetails={newProduct.productDetails}
        imageFile={imageFile}
        imagePreview={imagePreview}
        selectOptions={selectOptions}
        selectOptionInput={selectOptionInput}
        loading={actionLoading}
        categories={categories}
        onProductNameChange={(value) => setNewProduct({ ...newProduct, productName: value })}
        onProductCategoryChange={(value) => setNewProduct({ ...newProduct, productCategory: value })}
        onPriceChange={(value) => setNewProduct({ ...newProduct, price: value })}
        onProductDetailsChange={(value) => setNewProduct({ ...newProduct, productDetails: value })}
        onImageChange={handleImageChange}
        onSelectOptionInputChange={(field, value) =>
          setSelectOptionInput({ ...selectOptionInput, [field]: value })
        }
        onAddSelectOption={addSelectOption}
        onRemoveSelectOption={removeSelectOption}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        show={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditProduct}
        selectedProduct={selectedProduct}
        productName={newProduct.productName}
        productCategory={newProduct.productCategory}
        price={newProduct.price}
        productDetails={newProduct.productDetails}
        imageFile={imageFile}
        imagePreview={imagePreview}
        selectOptions={selectOptions}
        selectOptionInput={selectOptionInput}
        loading={actionLoading}
        categories={categories}
        onProductNameChange={(value) => setNewProduct({ ...newProduct, productName: value })}
        onProductCategoryChange={(value) => setNewProduct({ ...newProduct, productCategory: value })}
        onPriceChange={(value) => setNewProduct({ ...newProduct, price: value })}
        onProductDetailsChange={(value) => setNewProduct({ ...newProduct, productDetails: value })}
        onImageChange={handleImageChange}
        onSelectOptionInputChange={(field, value) =>
          setSelectOptionInput({ ...selectOptionInput, [field]: value })
        }
        onAddSelectOption={addSelectOption}
        onRemoveSelectOption={removeSelectOption}
      />
    </AdminLayout>
  );
}
