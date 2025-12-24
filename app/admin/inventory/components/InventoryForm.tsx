import { Loader2 } from "lucide-react";

interface InventoryFormProps {
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
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  isEdit?: boolean;
}

const categories = [
  "Raw Materials",
  "Packaging",
  "Equipment",
  "Supplies",
  "Other",
];

export default function InventoryForm({
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
  onSubmit,
  onCancel,
  submitLabel,
  isEdit = false,
}: InventoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Name *
        </label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => onItemNameChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
          placeholder="e.g., Bread Flour"
          required
        />
      </div>

      {/* Item Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Category *
        </label>
        <select
          value={itemCategory}
          onChange={(e) => onItemCategoryChange(e.target.value)}
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

      {/* Quantity and Cost Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Purchased *
          </label>
          <input
            type="number"
            min="1"
            value={quantityPurchased}
            onChange={(e) => onQuantityPurchasedChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
            placeholder="10"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Price (GHS) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={(e) => onCostPriceChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
            placeholder="180.00"
            required
          />
        </div>
      </div>

      {/* Vendor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Name *
          </label>
          <input
            type="text"
            value={vendorName}
            onChange={(e) => onVendorNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
            placeholder="e.g., Golden Mills Ltd"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Contact *
          </label>
          <input
            type="text"
            value={vendorContact}
            onChange={(e) => onVendorContactChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
            placeholder="e.g., 0241234567"
            required
          />
        </div>
      </div>

      {/* Purchase Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Purchase Purpose *
        </label>
        <textarea
          value={purchasePurpose}
          onChange={(e) => onPurchasePurposeChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
          placeholder="e.g., Weekly bread production"
          rows={3}
          required
        />
      </div>

      {/* Total Cost Display */}
      {!isEdit && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Cost:</span>
            <span className="text-lg font-bold text-gray-900">
              GHS {(quantityPurchased * costPrice).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
