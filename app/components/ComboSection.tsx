"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import comboService, { ComboProduct, ComboOption } from "../services/comboService";
import { useCart } from "../context/CartContext";

interface ComboWithSelection extends ComboProduct {}

export default function ComboSection() {
  const [combos, setCombos] = useState<ComboWithSelection[]>([]);
  const [activeCombo, setActiveCombo] = useState<ComboProduct | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCombos(comboService.getAll());
    }
  }, []);

  if (combos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#fff8f0]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2A2C22]">
              Flight Boxes &amp; Gift Combos
            </h2>
            <p className="text-gray-700 mt-2 max-w-xl">
              Build a custom box by choosing multiple flavours. The base price covers the first
              selections, and any extras are added transparently.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => (
            <button
              key={combo.id}
              onClick={() => setActiveCombo(combo)}
              className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 bg-gray-100">
                {combo.image ? (
                  <Image
                    src={combo.image}
                    alt={combo.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Flight Box
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{combo.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {combo.description || "Create your own signature combo."}
                </p>
                <p className="text-sm font-medium text-[#bd6325]">
                  Choose any {combo.baseSelectionCount} for ₵ {combo.basePrice.toFixed(2)}
                </p>
                {combo.allowExtras && (
                  <p className="text-xs text-gray-500">
                    Extras beyond{" "}
                    <span className="font-semibold">{combo.baseSelectionCount}</span> are charged
                    per flavour.
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeCombo && (
        <ComboBuilderModal combo={activeCombo} onClose={() => setActiveCombo(null)} />
      )}
    </section>
  );
}

interface ComboBuilderModalProps {
  combo: ComboProduct;
  onClose: () => void;
}

function ComboBuilderModal({ combo, onClose }: ComboBuilderModalProps) {
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const activeOptions = useMemo(
    () => combo.options.filter((opt) => opt.isActive),
    [combo.options]
  );

  const selectedOptions: ComboOption[] = useMemo(
    () => activeOptions.filter((opt) => selectedIds.includes(opt.id)),
    [activeOptions, selectedIds]
  );

  const includedOptions = selectedOptions.slice(0, combo.baseSelectionCount);
  const extraOptions = selectedOptions.slice(combo.baseSelectionCount);

  const extrasTotal = extraOptions.reduce((sum, opt) => sum + opt.price, 0);

  const totalPrice =
    selectedOptions.length === 0
      ? combo.basePrice
      : selectedOptions.length <= combo.baseSelectionCount
      ? combo.basePrice
      : combo.basePrice + extrasTotal;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canAddToCart = selectedOptions.length >= combo.baseSelectionCount;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const summaryLines = selectedOptions.map((opt, index) => {
      if (index < combo.baseSelectionCount) {
        return `• ${opt.name} (Included)`;
      }
      return `• ${opt.name} (+₵${opt.price.toFixed(2)})`;
    });

    const description =
      combo.description ||
      `Custom combo with ${selectedOptions.length} flavour${selectedOptions.length > 1 ? "s" : ""}.`;

    addToCart(
      {
        id: combo.baseProductId,
        name: combo.name,
        price: `GHS ${totalPrice.toFixed(2)}`,
        image: combo.image || "/placeholder.png",
        description: `${description}\n\n${summaryLines.join("\n")}`,
        rating: 5,
        reviews: 0,
        sizes: [],
        details: description,
      },
      1,
      undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
          <div className="space-y-4">
            <div className="relative h-52 rounded-2xl overflow-hidden bg-gray-100">
              {combo.image ? (
                <Image
                  src={combo.image}
                  alt={combo.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Flight Box
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2A2C22] mb-1">{combo.name}</h2>
              <p className="text-sm text-gray-700 mb-2">
                {combo.description ||
                  `Choose any ${combo.baseSelectionCount} flavours for a base price of ₵ ${combo.basePrice.toFixed(
                    2
                  )}.`}
              </p>
              <p className="text-sm font-medium text-[#bd6325]">
                Base: choose any {combo.baseSelectionCount} for ₵ {combo.basePrice.toFixed(2)}
              </p>
              {combo.allowExtras && (
                <p className="text-xs text-gray-500 mt-1">
                  Extras beyond {combo.baseSelectionCount} add their flavour price to the total.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Pick your flavours
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeOptions.map((opt) => {
                  const index = selectedIds.indexOf(opt.id);
                  const isSelected = index !== -1;
                  const isIncluded =
                    isSelected && index > -1 && index < combo.baseSelectionCount;
                  const isExtra = isSelected && index >= combo.baseSelectionCount;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleSelect(opt.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-[#bd6325] bg-[#fff3e6]"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {opt.name}
                      </span>
                      <span className="text-xs font-semibold">
                        {isIncluded && (
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            Included
                          </span>
                        )}
                        {isExtra && (
                          <span className="text-[#bd6325] bg-orange-50 px-2 py-0.5 rounded-full">
                            +₵{opt.price.toFixed(2)}
                          </span>
                        )}
                        {!isSelected && (
                          <span className="text-gray-500">
                            ₵ {opt.price.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                First {combo.baseSelectionCount} selections are covered by the base price. Any
                extra selections show their additional cost.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Base price</span>
                <span className="font-semibold text-gray-900">
                  ₵ {combo.basePrice.toFixed(2)}
                </span>
              </div>
              {extraOptions.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Extras ({extraOptions.length})
                  </span>
                  <span className="font-semibold text-[#bd6325]">
                    +₵ {extrasTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-bold mt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-[#bd6325]">₵ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`mt-3 w-full py-3 rounded-full font-semibold transition-colors ${
                  canAddToCart
                    ? "bg-[#bd6325] text-white hover:bg-[#a8551f]"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {canAddToCart
                  ? `Add combo to cart (₵ ${totalPrice.toFixed(2)})`
                  : `Select at least ${combo.baseSelectionCount} flavours`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


