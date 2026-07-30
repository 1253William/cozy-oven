import { X, Upload, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { CostItem } from "../../../services/costingService";
import { PackageConfig, PackageGroup, PackageOption, Product, SelectOption } from "../../../services/productService";

interface ProductFormProps {
  productType: "standard" | "package";
  productName: string;
  productCategory: string;
  price: number;
  salePrice?: number | null;
  saleStartsAt?: string;
  saleEndsAt?: string;
  productDetails: string;
  imageFile: File | null;
  imagePreview: string | string[];
  selectOptions: SelectOption[];
  selectOptionInput: { label: string; additionalPrice: number };
  packageConfig: PackageConfig;
  packageOptionInput: PackageOption;
  loading: boolean;
  categories: string[];
  componentProducts: Product[];
  supplyItems: CostItem[];
  onProductTypeChange: (value: "standard" | "package") => void;
  onProductNameChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onSalePriceChange?: (value: number | null) => void;
  onSaleStartsAtChange?: (value: string) => void;
  onSaleEndsAtChange?: (value: string) => void;
  onProductDetailsChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  existingImageCount?: number;
  onSelectOptionInputChange: (field: "label" | "additionalPrice", value: string | number) => void;
  onAddSelectOption: () => void;
  onRemoveSelectOption: (index: number) => void;
  onToggleOptionAvailable?: (index: number) => void;
  onPackageConfigChange: (config: PackageConfig) => void;
  onPackageOptionInputChange: (field: keyof PackageOption, value: string | number | boolean) => void;
  onAddPackageOption: () => void;
  onRemovePackageOption: (index: number) => void;
  onTogglePackageOptionAvailable: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  isEdit?: boolean;
}

export default function ProductForm({
  productType,
  productName,
  productCategory,
  price,
  salePrice = null,
  saleStartsAt = "",
  saleEndsAt = "",
  productDetails,
  imageFile,
  imagePreview,
  selectOptions,
  selectOptionInput,
  packageConfig,
  packageOptionInput,
  loading,
  categories,
  componentProducts,
  supplyItems,
  onProductTypeChange,
  onProductNameChange,
  onProductCategoryChange,
  onPriceChange,
  onSalePriceChange,
  onSaleStartsAtChange,
  onSaleEndsAtChange,
  onProductDetailsChange,
  onImageChange,
  onRemoveImage,
  existingImageCount = 0,
  onSelectOptionInputChange,
  onAddSelectOption,
  onRemoveSelectOption,
  onToggleOptionAvailable,
  onPackageConfigChange,
  onPackageOptionInputChange,
  onAddPackageOption,
  onRemovePackageOption,
  onTogglePackageOptionAvailable,
  onSubmit,
  onCancel,
  submitLabel,
  isEdit = false,
}: ProductFormProps) {
  const isPackageCategory = (() => {
    const normalized = productCategory.trim().toLowerCase();
    return normalized === "package" || normalized === "gifts and flight boxes";
  })();
  const categorySuggestions = Array.from(
    new Set(["Gifts and Flight Boxes", ...categories.filter((c) => c.trim().toLowerCase() !== "package")])
  ).sort();

  const updatePackageGroup = (index: number, updates: Partial<PackageGroup>) => {
    onPackageConfigChange({
      ...packageConfig,
      groups: (packageConfig.groups || []).map((group, i) =>
        i === index ? { ...group, ...updates } : group
      ),
    });
  };

  const addPackageGroup = (type: "fixed" | "selection") => {
    const groups = packageConfig.groups || [];
    onPackageConfigChange({
      ...packageConfig,
      groups: [
        ...groups,
        {
          id: `group-${Date.now()}`,
          label: type === "fixed" ? "Included items" : "Choose your options",
          type,
          requiredSelectionCount: type === "fixed" ? 0 : 1,
          allowRepeats: true,
          options: [],
          sortOrder: groups.length,
        },
      ],
    });
  };

  const removePackageGroup = (index: number) => {
    onPackageConfigChange({
      ...packageConfig,
      groups: (packageConfig.groups || []).filter((_, i) => i !== index),
    });
  };

  const addOptionToGroup = (groupIndex: number) => {
    const groups = packageConfig.groups || [];
    onPackageConfigChange({
      ...packageConfig,
      groups: groups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              options: [
                ...group.options,
                {
                  componentType: "product",
                  childProductId: "",
                  childVariantId: "",
                  supplyCostItemId: "",
                  label: "",
                  description: "",
                  isAvailable: true,
                  quantity: 1,
                  sortOrder: group.options.length,
                },
              ],
            }
          : group
      ),
    });
  };

  const updateGroupOption = (
    groupIndex: number,
    optionIndex: number,
    updates: Partial<PackageOption>
  ) => {
    const groups = packageConfig.groups || [];
    onPackageConfigChange({
      ...packageConfig,
      groups: groups.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              options: group.options.map((option, oi) =>
                oi === optionIndex ? { ...option, ...updates } : option
              ),
            }
          : group
      ),
    });
  };

  const removeGroupOption = (groupIndex: number, optionIndex: number) => {
    const groups = packageConfig.groups || [];
    onPackageConfigChange({
      ...packageConfig,
      groups: groups.map((group, i) =>
        i === groupIndex
          ? { ...group, options: group.options.filter((_, oi) => oi !== optionIndex) }
          : group
      ),
    });
  };

  const productById = (id?: string) => componentProducts.find((product) => product.id === id);
  const variantLabel = (product?: Product, variantId?: string) =>
    product?.selectOptions?.find((option) => option.variantId === variantId)?.label;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Product Name */}
      <div className="order-1">
        <label className="block text-sm font-semibold text-[#5d6043] mb-2">
          Product Name {!isEdit && "*"}
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
          placeholder="Enter product name"
          required={!isEdit}
        />
      </div>

      {/* Category and Price */}
      <div className="order-2 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#5d6043] mb-2">
            Category {!isEdit && "*"}
          </label>
          <input
            list="categories-list"
            value={productCategory}
            onChange={(e) => onProductCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
            placeholder="Select existing or type new category"
            required={!isEdit}
          />
          <datalist id="categories-list">
            {categorySuggestions.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5d6043] mb-2">
            Price (GHS) {!isEdit && "*"}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price || ""}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
            placeholder="0.00"
            required={!isEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5d6043] mb-2">
            Sale price (GHS)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={salePrice ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onSalePriceChange?.(raw === "" ? null : parseFloat(raw) || 0);
            }}
            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5d6043] mb-2">
            Sale starts
          </label>
          <input
            type="datetime-local"
            value={saleStartsAt}
            onChange={(e) => onSaleStartsAtChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5d6043] mb-2">
            Sale ends
          </label>
          <input
            type="datetime-local"
            value={saleEndsAt}
            onChange={(e) => onSaleEndsAtChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="order-4">
        <label className="block text-sm font-semibold text-[#5d6043] mb-2">
          Product Details {!isEdit && "*"}
        </label>
        <textarea
          value={productDetails}
          onChange={(e) => onProductDetailsChange(e.target.value)}
          className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
          placeholder="Enter product description"
          rows={3}
          required={!isEdit}
        />
      </div>

      {/* Image Upload */}
      <div className="order-5">
        <label className="block text-sm font-semibold text-[#5d6043] mb-2">
          Product Images (Select multiple)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 border border-[#b9aca2] rounded-lg cursor-pointer hover:bg-[#faf9f5]">
            <Upload className="w-4 h-4" />
            {isEdit ? "Add More Images" : "Choose Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        </div>
        
        {/* Image Previews */}
        {imagePreview && (
          <div className="mt-4">
            {/* Existing server images */}
            {isEdit && existingImageCount > 0 && (
              <>
                <p className="text-xs font-medium text-[#5d6043] mb-2">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {(Array.isArray(imagePreview) ? imagePreview : [imagePreview])
                    .slice(0, existingImageCount)
                    .filter(p => p && typeof p === 'string' && p.trim() !== '')
                    .map((preview, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-[#b9aca2]/60">
                        <Image
                          src={preview}
                          alt={`Current ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImage && onRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-[#faf9f5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[#faf9f5] text-[10px] py-1 text-center font-bold">
                            MAIN THUMBNAIL
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Newly added images */}
            {(() => {
              const newPreviews = (Array.isArray(imagePreview) ? imagePreview : [imagePreview])
                .slice(isEdit ? existingImageCount : 0)
                .filter(p => p && typeof p === 'string' && p.trim() !== '');
              if (newPreviews.length === 0) return null;
              return (
                <>
                  {isEdit && <p className="text-xs font-medium text-green-600 mb-2">New Images to Upload</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newPreviews.map((preview, index) => {
                      const actualIndex = isEdit ? existingImageCount + index : index;
                      return (
                        <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-green-300">
                          <Image
                            src={preview}
                            alt={`New ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveImage && onRemoveImage(actualIndex)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-[#faf9f5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {!isEdit && index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[#faf9f5] text-[10px] py-1 text-center font-bold">
                              MAIN THUMBNAIL
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Select Options */}
      <div className="order-6">
        <label className="block text-sm font-semibold text-[#5d6043] mb-2">
          Select Options (e.g., Size variations)
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={selectOptionInput.label}
              onChange={(e) => onSelectOptionInputChange("label", e.target.value)}
              className="flex-1 px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              placeholder="Option label (e.g., Large)"
            />
            <input
              type="number"
              step="0.01"
              value={selectOptionInput.additionalPrice || ""}
              onChange={(e) => onSelectOptionInputChange("additionalPrice", parseFloat(e.target.value) || 0)}
              className="w-32 px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              placeholder="+ Price"
            />
            <button
              type="button"
              onClick={onAddSelectOption}
              className="px-4 py-2 bg-[#b9aca2] rounded-lg hover:bg-[#b9aca2]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {selectOptions.map((option, index) => (
            <div key={index} className="flex items-center justify-between bg-[#faf9f5] p-2 rounded-lg gap-2">
              <span className={`text-sm flex-1 ${option.isAvailable === false ? "text-[#b9aca2] line-through" : ""}`}>
                {option.label} (+GHS {option.additionalPrice.toFixed(2)})
              </span>
              {onToggleOptionAvailable && (
                <button
                  type="button"
                  onClick={() => onToggleOptionAvailable(index)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    option.isAvailable !== false ? "bg-green-500" : "bg-[#b9aca2]"
                  }`}
                  title={option.isAvailable !== false ? "Mark as unavailable" : "Mark as available"}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-[#faf9f5] transition-transform ${
                      option.isAvailable !== false ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemoveSelectOption(index)}
                className="text-red-600 hover:bg-red-50 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isPackageCategory && (
        <div className="order-3 rounded-xl border border-[#b9aca2]/60 bg-[#faf9f5] p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#222222]">Package Builder</h3>
            <p className="text-xs text-[#5d6043] mt-1">
              Customers will choose exactly the required number from these available options.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                Selection Label
              </label>
              <input
                type="text"
                value={packageConfig.selectionLabel || ""}
                onChange={(e) =>
                  onPackageConfigChange({
                    ...packageConfig,
                    selectionLabel: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                placeholder="Choose your flavours"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                Required Choices
              </label>
              <input
                type="number"
                min="1"
                value={packageConfig.requiredSelectionCount || 1}
                onChange={(e) =>
                  onPackageConfigChange({
                    ...packageConfig,
                    requiredSelectionCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#b9aca2]/60 bg-[#faf9f5] p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#222222]">Package Groups</h4>
                <p className="text-xs text-[#5d6043]">
                  Use fixed groups for included items and selection groups for customer choices.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addPackageGroup("selection")}
                  className="px-3 py-2 text-sm bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222]"
                >
                  + Selection
                </button>
                <button
                  type="button"
                  onClick={() => addPackageGroup("fixed")}
                  className="px-3 py-2 text-sm border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5]"
                >
                  + Fixed
                </button>
              </div>
            </div>

            {(packageConfig.groups || []).map((group, groupIndex) => (
              <div key={group.id || groupIndex} className="rounded-lg border border-[#b9aca2]/60 p-3 space-y-3">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-[#5d6043] mb-1">Group Label</label>
                    <input
                      type="text"
                      value={group.label}
                      onChange={(e) => updatePackageGroup(groupIndex, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5d6043] mb-1">Type</label>
                    <select
                      value={group.type}
                      onChange={(e) =>
                        updatePackageGroup(groupIndex, {
                          type: e.target.value as "fixed" | "selection",
                          requiredSelectionCount: e.target.value === "fixed" ? 0 : Math.max(1, group.requiredSelectionCount || 1),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                    >
                      <option value="selection">Customer chooses</option>
                      <option value="fixed">Fixed included</option>
                    </select>
                  </div>
                  {group.type === "selection" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#5d6043] mb-1">Required</label>
                      <input
                        type="number"
                        min="1"
                        value={group.requiredSelectionCount || 1}
                        onChange={(e) =>
                          updatePackageGroup(groupIndex, {
                            requiredSelectionCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                          })
                        }
                        className="w-24 px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePackageGroup(groupIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {group.type === "selection" && (
                  <label className="flex items-center gap-2 text-sm text-[#5d6043]">
                    <input
                      type="checkbox"
                      checked={group.allowRepeats !== false}
                      onChange={(e) => updatePackageGroup(groupIndex, { allowRepeats: e.target.checked })}
                    />
                    Allow customers to repeat an option
                  </label>
                )}

                <div className="space-y-2">
                  {group.options.map((option, optionIndex) => {
                    const selectedProduct = productById(option.childProductId);
                    const selectedSupply = supplyItems.find((item) => item._id === option.supplyCostItemId);
                    return (
                      <div key={`${groupIndex}-${optionIndex}`} className="grid grid-cols-1 md:grid-cols-[130px_1fr_1fr_100px_auto] gap-2">
                        <select
                          value={option.componentType || "product"}
                          onChange={(e) =>
                            updateGroupOption(groupIndex, optionIndex, {
                              componentType: e.target.value as "product" | "supply",
                              childProductId: "",
                              childVariantId: "",
                              supplyCostItemId: "",
                              label: "",
                              description: "",
                            })
                          }
                          className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                        >
                          <option value="product">Product</option>
                          <option value="supply">Supply</option>
                        </select>
                        {(option.componentType || "product") === "supply" ? (
                          <select
                            value={option.supplyCostItemId || ""}
                            onChange={(e) => {
                              const supply = supplyItems.find((item) => item._id === e.target.value);
                              updateGroupOption(groupIndex, optionIndex, {
                                supplyCostItemId: e.target.value,
                                label: supply?.name || "",
                                description: supply ? supply.unit : "",
                              });
                            }}
                            className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                            required
                          >
                            <option value="">Select supply item</option>
                            {supplyItems.map((item) => (
                              <option key={item._id} value={item._id}>{item.name} ({item.unit})</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={option.childProductId || ""}
                            onChange={(e) => {
                              const product = productById(e.target.value);
                              const firstVariant = product?.selectOptions?.[0]?.variantId || "";
                              updateGroupOption(groupIndex, optionIndex, {
                                childProductId: e.target.value,
                                childVariantId: firstVariant,
                                label: product?.productName || "",
                                description: variantLabel(product, firstVariant) || "",
                              });
                            }}
                            className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                            required
                          >
                            <option value="">Select product</option>
                            {componentProducts.map((product) => (
                              <option key={product.id} value={product.id}>{product.productName}</option>
                            ))}
                          </select>
                        )}
                        {(option.componentType || "product") === "product" ? (
                          <select
                            value={option.childVariantId || ""}
                            onChange={(e) =>
                              updateGroupOption(groupIndex, optionIndex, {
                                childVariantId: e.target.value,
                                description: variantLabel(selectedProduct, e.target.value) || "",
                              })
                            }
                            className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                          >
                            <option value="">Base size</option>
                            {(selectedProduct?.selectOptions || []).map((variant) => (
                              <option key={variant.variantId || variant.label} value={variant.variantId || ""}>{variant.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={selectedSupply?.unit || ""}
                            readOnly
                            className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm bg-[#f3f0ea]"
                            placeholder="Unit"
                          />
                        )}
                        <input
                          type="number"
                          min="0.000001"
                          step="any"
                          value={option.quantity || 1}
                          onChange={(e) =>
                            updateGroupOption(groupIndex, optionIndex, {
                              quantity: Math.max(0.000001, Number(e.target.value) || 1),
                            })
                          }
                          className="px-3 py-2 border border-[#b9aca2] rounded-lg text-sm"
                          title="Component quantity"
                        />
                        <button
                          type="button"
                          onClick={() => removeGroupOption(groupIndex, optionIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove component"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => addOptionToGroup(groupIndex)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5]"
                  >
                    <Plus className="w-4 h-4" />
                    Add option
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      <div className="order-7 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50"
        >
          {loading ? `${isEdit ? "Updating" : "Adding"}...` : submitLabel}
        </button>
      </div>
    </form>
  );
}
