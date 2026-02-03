"use client";

import { useState } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import type { ComboOption, ComboProduct } from "../../../services/comboService";
import comboService from "../../../services/comboService";
import type { Product } from "../../../services/productService";

interface ComboProductModalProps {
  show: boolean;
  onClose: () => void;
  onSaved?: (combo: ComboProduct) => void;
  products: Product[];
}

export default function ComboProductModal({ show, onClose, onSaved, products }: ComboProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [baseSelectionCount, setBaseSelectionCount] = useState<number>(4);
  const [basePrice, setBasePrice] = useState<number>(100);
  const [allowExtras, setAllowExtras] = useState(true);
  const [selectedBaseProductId, setSelectedBaseProductId] = useState("");

  const [options, setOptions] = useState<ComboOption[]>([]);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddOption = () => {
    if (!optionName.trim() || optionPrice <= 0) return;
    const newOption: ComboOption = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: optionName.trim(),
      price: optionPrice,
      isActive: true,
    };
    setOptions((prev) => [...prev, newOption]);
    setOptionName("");
    setOptionPrice(0);
  };

  const handleToggleOptionActive = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id
          ? {
              ...opt,
              isActive: !opt.isActive,
            }
          : opt
      )
    );
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (baseSelectionCount <= 0) {
      setError("Base selection count must be greater than 0");
      return;
    }
    if (basePrice <= 0) {
      setError("Base price must be greater than 0");
      return;
    }
    const activeOptions = options.filter((opt) => opt.isActive);
    if (activeOptions.length < baseSelectionCount) {
      setError("You must have at least as many active options as the base selection count");
      return;
    }
    if (!selectedBaseProductId) {
      setError("Please choose which product this combo should use at checkout");
      return;
    }

    try {
      setSaving(true);
      const combo = comboService.create({
        name: name.trim(),
        description: description.trim(),
        image: imagePreview || undefined,
        baseSelectionCount,
        basePrice,
        allowExtras,
        baseProductId: selectedBaseProductId,
        options,
      });

      if (onSaved) onSaved(combo);

      // reset and close
      setName("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      setBaseSelectionCount(4);
      setBasePrice(100);
      setAllowExtras(true);
      setSelectedBaseProductId("");
      setOptions([]);
      setOptionName("");
      setOptionPrice(0);
      onClose();
    } catch (err) {
      console.error("Error saving combo product", err);
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Combo Product</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure a Flight Box / Gift Combo with base rules and flavour options.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Combo Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                placeholder="Flight Box"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Combo image
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  {imageFile ? "Change image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <span className="text-xs text-gray-600 truncate max-w-[140px]">
                    {imageFile.name}
                  </span>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2 w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Combo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              placeholder="Describe what this combo includes and how it works."
              rows={3}
            />
          </div>

          {/* Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base selection count *
              </label>
              <input
                type="number"
                min={1}
                value={baseSelectionCount}
                onChange={(e) => setBaseSelectionCount(parseInt(e.target.value || "0", 10))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base price (₵) *
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value || "0"))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 mt-6 md:mt-8">
              <input
                id="allow-extras"
                type="checkbox"
                checked={allowExtras}
                onChange={(e) => setAllowExtras(e.target.checked)}
                className="h-4 w-4 text-[#2A2C22] border-gray-300 rounded"
              />
              <label htmlFor="allow-extras" className="text-sm text-gray-700">
                Allow extras beyond base selection
              </label>
            </div>
          </div>

          {/* Base product link (for checkout) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link to existing product (used for checkout) *
            </label>
            <select
              value={selectedBaseProductId}
              onChange={(e) => setSelectedBaseProductId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent bg-white"
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} — GHS {p.price.toFixed(2)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Pick the regular product that should be used under the hood when customers buy this combo.
              You don&apos;t need to remember any IDs – just choose by name.
            </p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Flavour options
            </label>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  placeholder="Coconut, Blueberry, Chocolate..."
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={optionPrice || ""}
                  onChange={(e) => setOptionPrice(parseFloat(e.target.value || "0"))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                  placeholder="Price"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {options.length > 0 && (
                <div className="space-y-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg gap-2"
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${
                            !opt.isActive ? "text-gray-400 line-through" : "text-gray-900"
                          }`}
                        >
                          {opt.name}
                        </span>
                        <span className="text-xs text-gray-600">
                          ₵ {opt.price.toFixed(2)} per option
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleOptionActive(opt.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            opt.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {opt.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="p-1 rounded-full hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Customers will choose any {baseSelectionCount || 0} options for the base price. Extra
              options (if allowed) will add their individual price on top.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#2A2C22] text-white rounded-lg hover:bg-[#1a1c12] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Combo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


