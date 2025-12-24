import { X } from "lucide-react";
import InventoryForm from "./InventoryForm";

interface AddInventoryModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  itemName: string;
  quantityPurchased: number;
  costPrice: number;
  vendorName: string;
  vendorContact: string;
  purchasePurpose: string;
  itemCategory: string;
  loading: boolean;
  onItemNameChange: (value: string) => void;
  onQuantityPurchasedChange: (value: number) => void;
  onCostPriceChange: (value: number) => void;
  onVendorNameChange: (value: string) => void;
  onVendorContactChange: (value: string) => void;
  onPurchasePurposeChange: (value: string) => void;
  onItemCategoryChange: (value: string) => void;
}

export default function AddInventoryModal({
  show,
  onClose,
  onSubmit,
  itemName,
  quantityPurchased,
  costPrice,
  vendorName,
  vendorContact,
  purchasePurpose,
  itemCategory,
  loading,
  onItemNameChange,
  onQuantityPurchasedChange,
  onCostPriceChange,
  onVendorNameChange,
  onVendorContactChange,
  onPurchasePurposeChange,
  onItemCategoryChange,
}: AddInventoryModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add New Inventory</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <InventoryForm
          itemName={itemName}
          quantityPurchased={quantityPurchased}
          costPrice={costPrice}
          vendorName={vendorName}
          vendorContact={vendorContact}
          purchasePurpose={purchasePurpose}
          itemCategory={itemCategory}
          loading={loading}
          onItemNameChange={onItemNameChange}
          onQuantityPurchasedChange={onQuantityPurchasedChange}
          onCostPriceChange={onCostPriceChange}
          onVendorNameChange={onVendorNameChange}
          onVendorContactChange={onVendorContactChange}
          onPurchasePurposeChange={onPurchasePurposeChange}
          onItemCategoryChange={onItemCategoryChange}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Add Inventory"
        />
      </div>
    </div>
  );
}
