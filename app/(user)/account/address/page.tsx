"use client";

import { useState } from "react";
import { MapPin, Save } from "lucide-react";

interface AddressData {
  shippingAddress: string;
  city: string;
  digitalAddress: string;
}

export default function AddressPage() {
  const [address, setAddress] = useState<AddressData>({
    shippingAddress: "",
    city: "",
    digitalAddress: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Call API to save address
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const hasAddress =
    address.shippingAddress || address.city || address.digitalAddress;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Address</h1>
        <p className="text-gray-600 mt-2">
          Manage your shipping and delivery information
        </p>
      </div>

      <div className="max-w-2xl">
        {!hasAddress && !isEditing ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <MapPin className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No address saved
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Add your delivery address to make checkout faster
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-full hover:bg-[#1a1c12] transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          // Address form
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shipping Address *
              </label>
              <textarea
                name="shippingAddress"
                value={address.shippingAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
                placeholder="Enter your full shipping address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
                placeholder="e.g., Accra"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Digital Address
              </label>
              <input
                type="text"
                name="digitalAddress"
                value={address.digitalAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
                placeholder="e.g., GA-123-4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Ghana Post GPS digital address
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-lg hover:bg-[#1a1c12] transition-colors disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-lg hover:bg-[#1a1c12] transition-colors"
                >
                  Edit Address
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
