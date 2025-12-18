import { X } from "lucide-react";
import InventoryForm from "./InventoryForm";
import { InventoryItem } from "../../../services/inventoryService";

interface EditInventoryModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedItem: InventoryItem | null;
  itemName: string;
  quantityPurchased: number;
  costPrice: number;
  sellingPrice: number;
  vendorName: string;
  vendorContact: string;
  purchasePurpose: string;
  itemCategory: string;
  loading: boolean;
  onItemNameChange: (value: string) => void;
  onQuantityPurchasedChange: (value: number) => void;
  onCostPriceChange: (value: number) => void;
  onSellingPriceChange: (value: number) => void;
  onVendorNameChange: (value: string) => void;
  onVendorContactChange: (value: string) => void;
  onPurchasePurposeChange: (value: string) => void;
  onItemCategoryChange: (value: string) => void;
}

export default function EditInventoryModal({
  show,
  onClose,
  onSubmit,
  selectedItem,
  itemName,
  quantityPurchased,
  costPrice,
  sellingPrice,
  vendorName,
  vendorContact,
  purchasePurpose,
  itemCategory,
  loading,
  onItemNameChange,
  onQuantityPurchasedChange,
  onCostPriceChange,
  onSellingPriceChange,
  onVendorNameChange,
  onVendorContactChange,
  onPurchasePurposeChange,
  onItemCategoryChange,
}: EditInventoryModalProps) {
  if (!show || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Inventory</h2>
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
          sellingPrice={sellingPrice}
          vendorName={vendorName}
          vendorContact={vendorContact}
          purchasePurpose={purchasePurpose}
          itemCategory={itemCategory}
          loading={loading}
          onItemNameChange={onItemNameChange}
          onQuantityPurchasedChange={onQuantityPurchasedChange}
          onCostPriceChange={onCostPriceChange}
          onSellingPriceChange={onSellingPriceChange}
          onVendorNameChange={onVendorNameChange}
          onVendorContactChange={onVendorContactChange}
          onPurchasePurposeChange={onPurchasePurposeChange}
          onItemCategoryChange={onItemCategoryChange}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Update Inventory"
          isEdit
        />
      </div>
    </div>
  );
}
