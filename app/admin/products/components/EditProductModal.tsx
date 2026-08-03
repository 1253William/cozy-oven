import { X } from "lucide-react";
import ProductForm from "./ProductForm";
import { CostItem } from "../../../services/costingService";
import { PackageConfig, PackageOption, Product, SelectOption } from "../../../services/productService";

interface EditProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedProduct: Product | null;
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
  existingImageCount?: number;
  onRemoveImage?: (index: number) => void;
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
  onSelectOptionInputChange: (field: "label" | "additionalPrice", value: string | number) => void;
  onAddSelectOption: () => void;
  onRemoveSelectOption: (index: number) => void;
  onToggleOptionAvailable?: (index: number) => void;
  onToggleOptionSoldIndividually?: (index: number) => void;
  onPackageConfigChange: (config: PackageConfig) => void;
  onPackageOptionInputChange: (field: keyof PackageOption, value: string | number | boolean) => void;
  onAddPackageOption: () => void;
  onRemovePackageOption: (index: number) => void;
  onTogglePackageOptionAvailable: (index: number) => void;
}

export default function EditProductModal({
  show,
  onClose,
  onSubmit,
  selectedProduct,
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
  existingImageCount,
  onRemoveImage,
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
  onSelectOptionInputChange,
  onAddSelectOption,
  onRemoveSelectOption,
  onToggleOptionAvailable,
  onToggleOptionSoldIndividually,
  onPackageConfigChange,
  onPackageOptionInputChange,
  onAddPackageOption,
  onRemovePackageOption,
  onTogglePackageOptionAvailable,
}: EditProductModalProps) {
  if (!show || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#faf9f5] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#faf9f5] z-10 pb-4">
          <h2 className="text-2xl font-bold text-[#222222]">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#b9aca2]"
          >
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
          existingImageCount={existingImageCount}
          onRemoveImage={onRemoveImage}
          selectOptions={selectOptions}
          selectOptionInput={selectOptionInput}
          packageConfig={packageConfig}
          packageOptionInput={packageOptionInput}
          loading={loading}
          categories={categories}
          componentProducts={componentProducts}
          supplyItems={supplyItems}
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
          onToggleOptionSoldIndividually={onToggleOptionSoldIndividually}
          onPackageConfigChange={onPackageConfigChange}
          onPackageOptionInputChange={onPackageOptionInputChange}
          onAddPackageOption={onAddPackageOption}
          onRemovePackageOption={onRemovePackageOption}
          onTogglePackageOptionAvailable={onTogglePackageOptionAvailable}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Update Product"
          isEdit
        />
      </div>
    </div>
  );
}
