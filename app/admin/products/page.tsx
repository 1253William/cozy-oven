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
import { PackageConfig, PackageOption, Product, SelectOption } from "../../services/productService";
// import ComboProductModal from "./components/ComboProductModal";
// import comboService, { ComboProduct } from "../../services/comboService";
import useAdminProducts from "../../hooks/useAdminProducts";
import useProductManagement from "../../hooks/useProductManagement";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import ProductGrid from "./components/ProductGrid";

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ProductManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "productName">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // const [showComboModal, setShowComboModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [originalExistingImages, setOriginalExistingImages] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productCategory: "",
    price: 0,
    salePrice: null as number | null,
    unitCost: null as number | null,
    saleStartsAt: "",
    saleEndsAt: "",
    productDetails: "",
  });
  const [productType, setProductType] = useState<"standard" | "package">("standard");
  const [selectOptionInput, setSelectOptionInput] = useState({ label: "", additionalPrice: 0 });
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [packageConfig, setPackageConfig] = useState<PackageConfig>({
    selectionLabel: "Choose your options",
    requiredSelectionCount: 1,
    options: [],
  });
  const [packageOptionInput, setPackageOptionInput] = useState<PackageOption>({
    label: "",
    description: "",
    isAvailable: true,
  });
  // const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);

  // Use custom hooks
  const { products, loading, pagination, refetch } = useAdminProducts({
    page: currentPage,
    limit: 12,
    category: categoryFilter || undefined,
    search: appliedSearch || undefined,
    sortBy,
    order,
  });

  const PACKAGE_CATEGORY_LABEL = "Gifts and Flight Boxes";

  // Get unique categories dynamically from products
  const categories = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    categoriesSet.add(PACKAGE_CATEGORY_LABEL);
    products.forEach(product => {
      if (product.productCategory) {
        const category =
          product.productCategory.trim().toLowerCase() === "package"
            ? PACKAGE_CATEGORY_LABEL
            : product.productCategory;
        categoriesSet.add(category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [products]);

  const isPackageCategory = (category: string) => {
    const normalized = category.trim().toLowerCase();
    return normalized === "package" || normalized === "gifts and flight boxes";
  };

  const {
    loading: actionLoading,
    error: actionError,
    success: actionSuccess,
    createProductWithImage,
    updateProductWithImage,
    updateProduct,
    deleteProduct,
    clearMessages,
  } = useProductManagement();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  // Load combo products from localStorage for admin view
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setComboProducts(comboService.getAll());
  //   }
  // }, []);

  // const refreshCombos = () => {
  //   if (typeof window !== "undefined") {
  //     setComboProducts(comboService.getAll());
  //   }
  // };

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

  const filteredProducts = products;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Filter valid files
      const validFiles = newFiles.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          console.error(`Invalid image type for ${file.name}. Only JPEG, PNG, and WebP are allowed`);
          return false;
        }
        if (file.size > maxSize) {
          console.error(`Image ${file.name} is too large. Max size is 5MB`);
          return false;
        }
        return true;
      });

      setImageFiles(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const existingCount = existingImages.length;
    if (index < existingCount) {
      // Removing an existing server image — just hide it from previews
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly added file
      const fileIndex = index - existingCount;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const addSelectOption = () => {
    if (selectOptionInput.label) {
      setSelectOptions([...selectOptions, { ...selectOptionInput, isAvailable: true }]);
      setSelectOptionInput({ label: "", additionalPrice: 0 });
    }
  };

  const addPackageOption = () => {
    const label = packageOptionInput.label.trim();
    if (!label) return;

    setPackageConfig((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          label,
          description: packageOptionInput.description?.trim() || undefined,
          isAvailable: true,
          sortOrder: prev.options.length,
        },
      ],
    }));
    setPackageOptionInput({ label: "", description: "", isAvailable: true });
  };

  const removePackageOption = (index: number) => {
    setPackageConfig((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const togglePackageOptionAvailable = (index: number) => {
    setPackageConfig((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index
          ? { ...option, isAvailable: option.isAvailable === false ? true : false }
          : option
      ),
    }));
  };

  const updatePackageOptionInput = (
    field: keyof PackageOption,
    value: string | number | boolean
  ) => {
    setPackageOptionInput((prev) => ({ ...prev, [field]: value }));
  };

  const packageConfigIsValid = () => {
    if (!isPackageCategory(newProduct.productCategory)) return true;
    if (packageConfig.groups && packageConfig.groups.length > 0) {
      return packageConfig.groups.every((group) => {
        const availableCount = group.options.filter((option) => option.isAvailable !== false).length;
        if (group.type === "fixed") return availableCount > 0;
        if (!group.requiredSelectionCount || group.requiredSelectionCount < 1) return false;
        if (group.allowRepeats === false) return availableCount >= group.requiredSelectionCount;
        return availableCount > 0;
      });
    }
    const availableCount = packageConfig.options.filter((option) => option.isAvailable !== false).length;
    return packageConfig.requiredSelectionCount > 0 && availableCount >= packageConfig.requiredSelectionCount;
  };

  const removeSelectOption = (index: number) => {
    setSelectOptions(selectOptions.filter((_, i) => i !== index));
  };

  const toggleOptionAvailable = (index: number) => {
    const updatedOptions = [...selectOptions];
    // Toggle: if currently false, set to true; if true/undefined, set to false
    const currentValue = updatedOptions[index].isAvailable;
    updatedOptions[index] = {
      ...updatedOptions[index],
      isAvailable: currentValue === false ? true : false,
    };
    setSelectOptions(updatedOptions);
  };

  const resetForm = () => {
    setNewProduct({
      productName: "",
      productCategory: "",
      price: 0,
      salePrice: null,
      unitCost: null,
      saleStartsAt: "",
      saleEndsAt: "",
      productDetails: "",
    });
    setProductType("standard");
    setSelectOptions([]);
    setPackageConfig({
      selectionLabel: "Choose your options",
      requiredSelectionCount: 1,
      options: [],
    });
    setPackageOptionInput({ label: "", description: "", isAvailable: true });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setOriginalExistingImages([]);
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
      
      if (imageFiles.length === 0) {
        console.error("Product image is required");
        return;
      }

      if (!packageConfigIsValid()) {
        console.error("Package products need enough available options for the required selection count");
        return;
      }

      // Validations already handled in handleImageChange
      const nextProductType = isPackageCategory(newProduct.productCategory) ? "package" : "standard";

      const formData = new FormData();
      formData.append("productName", newProduct.productName.trim());
      formData.append("productCategory", newProduct.productCategory);
      formData.append("productDetails", newProduct.productDetails.trim());
      formData.append("price", newProduct.price.toString());
      formData.append("salePrice", newProduct.salePrice == null ? "" : String(newProduct.salePrice));
      formData.append("unitCost", newProduct.unitCost == null ? "" : String(newProduct.unitCost));
      formData.append("saleStartsAt", newProduct.saleStartsAt || "");
      formData.append("saleEndsAt", newProduct.saleEndsAt || "");
      formData.append("productType", nextProductType);
      formData.append("selectOptions", JSON.stringify(selectOptions));
      if (nextProductType === "package") {
        formData.append("packageConfig", JSON.stringify(packageConfig));
      }
      
      // Backend expects 'thumbnail' for all images (array of 1-5)
      imageFiles.forEach(file => {
        formData.append("thumbnail", file);
      });

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
      if (!selectedProduct.id) {
        console.error("Product ID is missing. selectedProduct object:", selectedProduct);
        return;
      }

      // Check for changes (optional optimization, but good for UX)
      const hasChanges = 
        newProduct.productName !== selectedProduct.productName ||
        newProduct.price !== selectedProduct.price ||
        newProduct.productCategory !== selectedProduct.productCategory ||
        newProduct.productDetails !== selectedProduct.productDetails ||
        (isPackageCategory(newProduct.productCategory) ? "package" : "standard") !== (selectedProduct.productType || "standard") ||
        JSON.stringify(packageConfig) !== JSON.stringify(selectedProduct.packageConfig || {
          selectionLabel: "Choose your options",
          requiredSelectionCount: 1,
          options: [],
        }) ||
        imageFiles.length > 0 ||
        JSON.stringify(existingImages) !== JSON.stringify(originalExistingImages) ||
        JSON.stringify(selectOptions) !== JSON.stringify(selectedProduct.selectOptions);
      
      if (!hasChanges) {
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

      if (!packageConfigIsValid()) {
        console.error("Package products need enough available options for the required selection count");
        return;
      }

      const nextProductType = isPackageCategory(newProduct.productCategory) ? "package" : "standard";

      const formData = new FormData();
      
      // Append basic fields
      formData.append("productName", newProduct.productName.trim());
      formData.append("productCategory", newProduct.productCategory);
      formData.append("productDetails", newProduct.productDetails.trim());
      formData.append("price", newProduct.price.toString());
      formData.append("salePrice", newProduct.salePrice == null ? "" : String(newProduct.salePrice));
      formData.append("unitCost", newProduct.unitCost == null ? "" : String(newProduct.unitCost));
      formData.append("saleStartsAt", newProduct.saleStartsAt || "");
      formData.append("saleEndsAt", newProduct.saleEndsAt || "");
      formData.append("productType", nextProductType);
      
      // selectOptions MUST be a JSON string
      formData.append("selectOptions", JSON.stringify(selectOptions));
      if (nextProductType === "package") {
        formData.append("packageConfig", JSON.stringify(packageConfig));
      }
      
      const imagesChanged =
        imageFiles.length > 0 ||
        JSON.stringify(existingImages) !== JSON.stringify(originalExistingImages);

      // Keep existing gallery URLs + append any newly uploaded files
      if (imagesChanged) {
        formData.append("keepImages", JSON.stringify(existingImages));
        if (imageFiles.length > 0) {
          imageFiles.forEach(file => {
            formData.append("thumbnail", file);
          });
        }
      }

      console.log("handleEditProduct: Updating product", selectedProduct.id);
      await updateProductWithImage(selectedProduct.id, formData);

      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      await refetch();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const openEditModal = (product: Product) => {
    console.log("Opening edit modal for product:", product);
    setSelectedProduct(product);
    setNewProduct({
      productName: product.productName,
      productCategory:
        product.productType === "package" ||
        product.productCategory?.trim().toLowerCase() === "package"
          ? PACKAGE_CATEGORY_LABEL
          : product.productCategory,
      price: product.price,
      salePrice: product.salePrice ?? null,
      unitCost: product.unitCost ?? null,
      saleStartsAt: toDateTimeLocalValue(product.saleStartsAt),
      saleEndsAt: toDateTimeLocalValue(product.saleEndsAt),
      productDetails: product.productDetails,
    });
    setSelectOptions(product.selectOptions || []);
    setProductType(product.productType || "standard");
    setPackageConfig(product.packageConfig || {
      selectionLabel: "Choose your options",
      requiredSelectionCount: 1,
      options: [],
    });
    setPackageOptionInput({ label: "", description: "", isAvailable: true });
    // Store existing server images separately from new uploads
    const serverImages = product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];
    setExistingImages(serverImages);
    setOriginalExistingImages(serverImages);
    // Clear new file uploads
    setImageFiles([]);
    setImagePreviews([]);
    setShowEditModal(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      await refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleAvailable = async (product: Product) => {
    try {
      // Toggle: if currently true/undefined, set to false; if false, set to true
      const newValue = product.isAvailable !== false ? false : true;
      const newStatus = newValue ? "in stock" : "out of stock";
      await updateProduct(product.id, { 
        isAvailable: newValue,
        productStatus: newStatus
      });
      await refetch();
    } catch (error) {
      console.error("Error toggling availability status:", error);
    }
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
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
          {actionSuccess}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Product Management</h1>
            <p className="text-[#5d6043] mt-1">Manage your products and categories</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={() => setShowComboModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#5d6043] text-[#5d6043] rounded-lg hover:bg-[#faf9f5] transition-colors"
              disabled={loading || actionLoading}
            >
              <Plus className="w-5 h-5" />
              Create Combo
            </button> */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors"
              disabled={loading || actionLoading}
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Categories - Only show if there are categories with products */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => setCategoryFilter(category === categoryFilter ? "" : category)}
                  className={`bg-[#faf9f5] rounded-xl shadow-sm p-4 border transition-all cursor-pointer ${
                    categoryFilter === category
                      ? "border-[#5d6043] ring-2 ring-[#5d6043]/20"
                      : "border-[#b9aca2]/40 hover:shadow-md"
                  }`}
                >
                  <div className="w-12 h-12 bg-[#5d6043] rounded-full flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-[#faf9f5]" />
                  </div>
                  <h3 className="font-semibold text-[#222222] text-sm">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-[#faf9f5] rounded-xl shadow-sm p-4 border border-[#b9aca2]/40">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b9aca2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    setAppliedSearch(searchQuery.trim());
                  }
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#b9aca2]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "createdAt" | "price" | "productName")
                }
                className="px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
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
              className="px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#5d6043] animate-spin" />
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <ProductGrid products={filteredProducts} onEdit={openEditModal} onDelete={handleDelete} onToggleAvailable={handleToggleAvailable} />

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 p-12 text-center">
                <Package className="w-16 h-16 text-[#b9aca2] mx-auto mb-4" />
                <p className="text-[#5d6043]">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-[#5d6043]">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Combo Products Overview - Commented out until feature is complete */}
            {/* {comboProducts.length > 0 && (
              <div className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#222222]">Combo Products</h2>
                  <p className="text-sm text-[#5d6043]">
                    Configure how Flight Boxes / Gift Combos behave for customers.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comboProducts.map((combo) => (
                    <div
                      key={combo.id}
                      className="border border-[#b9aca2]/60 rounded-xl p-4 hover:shadow-md transition-shadow bg-[#faf9f5]"
                    >
                      <h3 className="font-semibold text-[#222222] mb-1">{combo.name}</h3>
                      <p className="text-xs text-[#5d6043] mb-2 line-clamp-2">
                        {combo.description || "No description provided."}
                      </p>
                      <p className="text-sm font-medium text-[#222222] mb-1">
                        Base rule: choose any {combo.baseSelectionCount} for ₵{" "}
                        {combo.basePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-[#5d6043] mb-2">
                        Extras {combo.allowExtras ? "allowed (charged per option)" : "not allowed"}
                      </p>
                      <p className="text-xs text-[#5d6043]">
                        {combo.options.filter((o) => o.isActive).length} active options
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        show={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddProduct}
        productType={productType}
        productName={newProduct.productName}
        productCategory={newProduct.productCategory}
        price={newProduct.price}
        salePrice={newProduct.salePrice}
        unitCost={newProduct.unitCost}
        saleStartsAt={newProduct.saleStartsAt}
        saleEndsAt={newProduct.saleEndsAt}
        productDetails={newProduct.productDetails}
        imageFile={imageFiles.length > 0 ? imageFiles[0] : null}
        imagePreview={imagePreviews as any}
        selectOptions={selectOptions}
        selectOptionInput={selectOptionInput}
        packageConfig={packageConfig}
        packageOptionInput={packageOptionInput}
        loading={actionLoading}
        categories={categories}
        onProductTypeChange={setProductType}
        onProductNameChange={(value) => setNewProduct({ ...newProduct, productName: value })}
        onProductCategoryChange={(value) => setNewProduct({ ...newProduct, productCategory: value })}
        onPriceChange={(value) => setNewProduct({ ...newProduct, price: value })}
        onSalePriceChange={(value) => setNewProduct({ ...newProduct, salePrice: value })}
        onUnitCostChange={(value) => setNewProduct({ ...newProduct, unitCost: value })}
        onSaleStartsAtChange={(value) => setNewProduct({ ...newProduct, saleStartsAt: value })}
        onSaleEndsAtChange={(value) => setNewProduct({ ...newProduct, saleEndsAt: value })}
        onProductDetailsChange={(value) => setNewProduct({ ...newProduct, productDetails: value })}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
        onSelectOptionInputChange={(field, value) =>
          setSelectOptionInput({ ...selectOptionInput, [field]: value })
        }
        onAddSelectOption={addSelectOption}
        onRemoveSelectOption={removeSelectOption}
        onToggleOptionAvailable={toggleOptionAvailable}
        onPackageConfigChange={setPackageConfig}
        onPackageOptionInputChange={updatePackageOptionInput}
        onAddPackageOption={addPackageOption}
        onRemovePackageOption={removePackageOption}
        onTogglePackageOptionAvailable={togglePackageOptionAvailable}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        show={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditProduct}
        selectedProduct={selectedProduct}
        productType={productType}
        productName={newProduct.productName}
        productCategory={newProduct.productCategory}
        price={newProduct.price}
        salePrice={newProduct.salePrice}
        unitCost={newProduct.unitCost}
        saleStartsAt={newProduct.saleStartsAt}
        saleEndsAt={newProduct.saleEndsAt}
        productDetails={newProduct.productDetails}
        imageFile={imageFiles.length > 0 ? imageFiles[0] : null}
        imagePreview={[...existingImages, ...imagePreviews]}
        existingImageCount={existingImages.length}
        selectOptions={selectOptions}
        selectOptionInput={selectOptionInput}
        packageConfig={packageConfig}
        packageOptionInput={packageOptionInput}
        loading={actionLoading}
        categories={categories}
        onProductTypeChange={setProductType}
        onProductNameChange={(value) => setNewProduct({ ...newProduct, productName: value })}
        onProductCategoryChange={(value) => setNewProduct({ ...newProduct, productCategory: value })}
        onPriceChange={(value) => setNewProduct({ ...newProduct, price: value })}
        onSalePriceChange={(value) => setNewProduct({ ...newProduct, salePrice: value })}
        onUnitCostChange={(value) => setNewProduct({ ...newProduct, unitCost: value })}
        onSaleStartsAtChange={(value) => setNewProduct({ ...newProduct, saleStartsAt: value })}
        onSaleEndsAtChange={(value) => setNewProduct({ ...newProduct, saleEndsAt: value })}
        onProductDetailsChange={(value) => setNewProduct({ ...newProduct, productDetails: value })}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
        onSelectOptionInputChange={(field, value) =>
          setSelectOptionInput({ ...selectOptionInput, [field]: value })
        }
        onAddSelectOption={addSelectOption}
        onRemoveSelectOption={removeSelectOption}
        onToggleOptionAvailable={toggleOptionAvailable}
        onPackageConfigChange={setPackageConfig}
        onPackageOptionInputChange={updatePackageOptionInput}
        onAddPackageOption={addPackageOption}
        onRemovePackageOption={removePackageOption}
        onTogglePackageOptionAvailable={togglePackageOptionAvailable}
      />

      {/* Combo Product Modal - Commented out until feature is complete */}
      {/* <ComboProductModal
        show={showComboModal}
        onClose={() => setShowComboModal(false)}
        onSaved={() => {
          refreshCombos();
        }}
        products={products}
      /> */}
    </AdminLayout>
  );
}
