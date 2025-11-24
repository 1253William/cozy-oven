"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Filter,
  Plus,
  X,
  Edit2,
  Trash2,
  Package,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import productService, {
  Product,
  SelectOption,
  CreateProductData,
} from "../../services/productService";

const categories = [
  "Classic",
  "Chocolate",
  "Nuts & Seeds",
  "Fruits",
  "Specialty",
  "Family Size",
  "Mini",
];

interface NewProductForm extends Omit<CreateProductData, "selectOptions"> {
  selectOptions: string; // JSON string for form handling
}

export default function ProductManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "productName">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    productName: "",
    productCategory: "",
    price: 0,
    productThumbnail: "",
    productDetails: "",
    selectOptions: "[]",
  });
  const [selectOptionInput, setSelectOptionInput] = useState({ label: "", additionalPrice: 0 });
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
      fetchProducts();
    }
  }, [isAuthenticated, user, currentPage, categoryFilter, sortBy, order]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: currentPage,
        limit: 12,
        category: categoryFilter || undefined,
        sortBy,
        order,
      });
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (imageFile) {
        // Create product with image upload
        const formData = new FormData();
        formData.append("productName", newProduct.productName);
        formData.append("price", newProduct.price.toString());
        formData.append("productCategory", newProduct.productCategory);
        formData.append("productDetails", newProduct.productDetails);
        formData.append("selectOptions", JSON.stringify(selectOptions));
        formData.append("productThumbnail", imageFile);

        await productService.createProductWithImage(formData);
      } else {
        // Create product without image
        const productData: CreateProductData = {
          productName: newProduct.productName,
          price: newProduct.price,
          productCategory: newProduct.productCategory,
          productThumbnail: newProduct.productThumbnail || "",
          productDetails: newProduct.productDetails,
          selectOptions: selectOptions,
        };

        await productService.createProduct(productData);
      }

      // Reset form and close modal
      setShowAddModal(false);
      setNewProduct({
        productName: "",
        productCategory: "",
        price: 0,
        productThumbnail: "",
        productDetails: "",
        selectOptions: "[]",
      });
      setSelectOptions([]);
      setImageFile(null);
      setImagePreview("");
      setSuccess("Product created successfully!");

      // Refresh products list
      await fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating product:", error);
      setError("Failed to create product. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (imageFile) {
        // Update product with new image
        const formData = new FormData();
        if (newProduct.productName)
          formData.append("productName", newProduct.productName);
        if (newProduct.price) formData.append("price", newProduct.price.toString());
        if (newProduct.productCategory)
          formData.append("productCategory", newProduct.productCategory);
        if (newProduct.productDetails)
          formData.append("productDetails", newProduct.productDetails);
        if (selectOptions.length > 0)
          formData.append("selectOptions", JSON.stringify(selectOptions));
        formData.append("productThumbnail", imageFile);

        await productService.updateProductWithImage(selectedProduct._id, formData);
      } else {
        // Update product without image
        await productService.updateProduct(selectedProduct._id, {
          productName: newProduct.productName || undefined,
          price: newProduct.price || undefined,
          productCategory: newProduct.productCategory || undefined,
          productDetails: newProduct.productDetails || undefined,
          selectOptions: selectOptions.length > 0 ? selectOptions : undefined,
        });
      }

      // Reset and close modal
      setShowEditModal(false);
      setSelectedProduct(null);
      setNewProduct({
        productName: "",
        productCategory: "",
        price: 0,
        productThumbnail: "",
        productDetails: "",
        selectOptions: "[]",
      });
      setSelectOptions([]);
      setImageFile(null);
      setImagePreview("");
      setSuccess("Product updated successfully!");

      // Refresh products
      await fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating product:", error);
      setError("Failed to update product. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      productName: product.productName,
      productCategory: product.productCategory,
      price: product.price,
      productThumbnail: product.productThumbnail,
      productDetails: product.productDetails,
      selectOptions: JSON.stringify(product.selectOptions),
    });
    setSelectOptions(product.selectOptions || []);
    setImagePreview(product.productThumbnail);
    setShowEditModal(true);
  };

  return (
    <AdminLayout>
      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {success}
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
            disabled={loading}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Categories */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {product.productThumbnail ? (
                      <img
                        src={product.productThumbnail}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {product.productName}
                      </h3>
                      {product.stockQuantity !== undefined && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            product.stockQuantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.productCategory}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-[#2A2C22]">
                        GHS {product.price.toFixed(2)}
                      </span>
                      {product.stockQuantity !== undefined && (
                        <span className="text-sm text-gray-600">
                          Stock: {product.stockQuantity}
                        </span>
                      )}
                    </div>
                    {product.sku && (
                      <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setImageFile(null);
                  setImagePreview("");
                  setSelectOptions([]);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, productName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Category and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newProduct.productCategory}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, productCategory: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (GHS) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Product Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Details *
                </label>
                <textarea
                  value={newProduct.productDetails}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, productDetails: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  placeholder="Enter product description"
                  rows={3}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Select Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Options (e.g., Size variations)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectOptionInput.label}
                      onChange={(e) =>
                        setSelectOptionInput({ ...selectOptionInput, label: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="Option label (e.g., Large)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={selectOptionInput.additionalPrice || ""}
                      onChange={(e) =>
                        setSelectOptionInput({
                          ...selectOptionInput,
                          additionalPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="+ Price"
                    />
                    <button
                      type="button"
                      onClick={addSelectOption}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm">
                        {option.label} (+GHS {option.additionalPrice.toFixed(2)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSelectOption(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setImageFile(null);
                    setImagePreview("");
                    setSelectOptions([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Similar structure to Add Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setImageFile(null);
                  setImagePreview("");
                  setSelectOptions([]);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4">
              {/* Same form fields as Add Modal but with edit handlers */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, productName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newProduct.productCategory}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, productCategory: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (GHS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Details
                </label>
                <textarea
                  value={newProduct.productDetails}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, productDetails: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Options
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectOptionInput.label}
                      onChange={(e) =>
                        setSelectOptionInput({ ...selectOptionInput, label: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="Option label"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={selectOptionInput.additionalPrice || ""}
                      onChange={(e) =>
                        setSelectOptionInput({
                          ...selectOptionInput,
                          additionalPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                      placeholder="+ Price"
                    />
                    <button
                      type="button"
                      onClick={addSelectOption}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm">
                        {option.label} (+GHS {option.additionalPrice.toFixed(2)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSelectOption(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    setImageFile(null);
                    setImagePreview("");
                    setSelectOptions([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
