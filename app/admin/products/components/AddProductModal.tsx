import { X } from "lucide-react";
import ProductForm from "./ProductForm";
import { PackageConfig, PackageOption, SelectOption } from "../../../services/productService";

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  productType: "standard" | "package";
  productName: string;
  productCategory: string;
  price: number;
  salePrice?: number | null;
  saleStartsAt?: string;
  saleEndsAt?: string;
  productDetails: string;
  imageFile: File | null;
  imagePreview: string[];
  onRemoveImage?: (index: number) => void;
  selectOptions: SelectOption[];
  selectOptionInput: { label: string; additionalPrice: number };
  packageConfig: PackageConfig;
  packageOptionInput: PackageOption;
  loading: boolean;
  categories: string[];
  onProductTypeChange: (value: "standard" | "package") => void;
  onProductNameChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onSalePriceChange?: (value: number | null) => void;
  onSaleStartsAtChange?: (value: string) => void;
  onSaleEndsAtChange?: (value: string) => void;
  onProductDetailsChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOptionInputChange: (field: "label" | "additionalPrice", value: string | number) => void;
  onAddSelectOption: () => void;
  onRemoveSelectOption: (index: number) => void;
  onToggleOptionAvailable?: (index: number) => void;
  onPackageConfigChange: (config: PackageConfig) => void;
  onPackageOptionInputChange: (field: keyof PackageOption, value: string | number | boolean) => void;
  onAddPackageOption: () => void;
  onRemovePackageOption: (index: number) => void;
  onTogglePackageOptionAvailable: (index: number) => void;
}

export default function AddProductModal({
  show,
  onClose,
  onSubmit,
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
  onRemoveImage,
  selectOptions,
  selectOptionInput,
  packageConfig,
  packageOptionInput,
  loading,
  categories,
  onProductTypeChange,
  onProductNameChange,
  onProductCategoryChange,
  onPriceChange,
  onSalePriceChange,
  onSaleStartsAtChange,
  onSaleEndsAtChange,
  onProductDetailsChange,
  onImageChange,
  onSelectOptionInputChange,
  onAddSelectOption,
  onRemoveSelectOption,
  onToggleOptionAvailable,
  onPackageConfigChange,
  onPackageOptionInputChange,
  onAddPackageOption,
  onRemovePackageOption,
  onTogglePackageOptionAvailable,
}: AddProductModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#faf9f5] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#faf9f5] z-10 pb-4">
          <h2 className="text-2xl font-bold text-[#222222]">Add New Product</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#b9aca2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ProductForm
          productType={productType}
          productName={productName}
          productCategory={productCategory}
          price={price}
          salePrice={salePrice}
          saleStartsAt={saleStartsAt}
          saleEndsAt={saleEndsAt}
          productDetails={productDetails}
          imageFile={imageFile}
          imagePreview={imagePreview as any}
          onRemoveImage={onRemoveImage}
          selectOptions={selectOptions}
          selectOptionInput={selectOptionInput}
          packageConfig={packageConfig}
          packageOptionInput={packageOptionInput}
          loading={loading}
          categories={categories}
          onProductTypeChange={onProductTypeChange}
          onProductNameChange={onProductNameChange}
          onProductCategoryChange={onProductCategoryChange}
          onPriceChange={onPriceChange}
          onSalePriceChange={onSalePriceChange}
          onSaleStartsAtChange={onSaleStartsAtChange}
          onSaleEndsAtChange={onSaleEndsAtChange}
          onProductDetailsChange={onProductDetailsChange}
          onImageChange={onImageChange}
          onSelectOptionInputChange={onSelectOptionInputChange}
          onAddSelectOption={onAddSelectOption}
          onRemoveSelectOption={onRemoveSelectOption}
          onToggleOptionAvailable={onToggleOptionAvailable}
          onPackageConfigChange={onPackageConfigChange}
          onPackageOptionInputChange={onPackageOptionInputChange}
          onAddPackageOption={onAddPackageOption}
          onRemovePackageOption={onRemovePackageOption}
          onTogglePackageOptionAvailable={onTogglePackageOptionAvailable}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Add Product"
        />
      </div>
    </div>
  );
}
