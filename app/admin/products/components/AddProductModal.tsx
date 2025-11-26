import { X } from "lucide-react";
import ProductForm from "./ProductForm";
import { SelectOption } from "../../../services/productService";

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  productName: string;
  productCategory: string;
  price: number;
  productDetails: string;
  imageFile: File | null;
  imagePreview: string;
  selectOptions: SelectOption[];
  selectOptionInput: { label: string; additionalPrice: number };
  loading: boolean;
  categories: string[];
  onProductNameChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onProductDetailsChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOptionInputChange: (field: "label" | "additionalPrice", value: string | number) => void;
  onAddSelectOption: () => void;
  onRemoveSelectOption: (index: number) => void;
}

export default function AddProductModal({
  show,
  onClose,
  onSubmit,
  productName,
  productCategory,
  price,
  productDetails,
  imageFile,
  imagePreview,
  selectOptions,
  selectOptionInput,
  loading,
  categories,
  onProductNameChange,
  onProductCategoryChange,
  onPriceChange,
  onProductDetailsChange,
  onImageChange,
  onSelectOptionInputChange,
  onAddSelectOption,
  onRemoveSelectOption,
}: AddProductModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ProductForm
          productName={productName}
          productCategory={productCategory}
          price={price}
          productDetails={productDetails}
          imageFile={imageFile}
          imagePreview={imagePreview}
          selectOptions={selectOptions}
          selectOptionInput={selectOptionInput}
          loading={loading}
          categories={categories}
          onProductNameChange={onProductNameChange}
          onProductCategoryChange={onProductCategoryChange}
          onPriceChange={onPriceChange}
          onProductDetailsChange={onProductDetailsChange}
          onImageChange={onImageChange}
          onSelectOptionInputChange={onSelectOptionInputChange}
          onAddSelectOption={onAddSelectOption}
          onRemoveSelectOption={onRemoveSelectOption}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Add Product"
        />
      </div>
    </div>
  );
}
