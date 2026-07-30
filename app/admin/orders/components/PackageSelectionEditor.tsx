"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { PackageGroup, Product } from "../../../services/productService";

export interface PackageSelection {
  label: string;
  quantity: number;
  groupLabel?: string;
  groupId?: string;
  type?: "fixed" | "selection";
}

const normalizePackageGroups = (product?: Product): PackageGroup[] => {
  const groups = product?.packageConfig?.groups;
  if (groups?.length) {
    return [...groups].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  const legacyOptions = product?.packageConfig?.options || [];
  if (!legacyOptions.length) return [];

  return [
    {
      id: "default",
      label: product?.packageConfig?.selectionLabel || "Choose your options",
      type: "selection",
      requiredSelectionCount: product?.packageConfig?.requiredSelectionCount || 1,
      allowRepeats: true,
      options: legacyOptions,
      sortOrder: 0,
    },
  ];
};

export const usePackageSelection = (product?: Product) => {
  const [selectionState, setSelectionState] = useState<{
    productId: string;
    counts: Record<string, number>;
  }>({ productId: "", counts: {} });
  const productId = product?.id || "";
  const counts = selectionState.productId === productId ? selectionState.counts : {};
  const groups = useMemo(() => normalizePackageGroups(product), [product]);
  const isPackage = product?.productType === "package";
  const selectableGroups = groups.filter((group) => group.type !== "fixed");

  const selections = useMemo<PackageSelection[]>(
    () => [
      ...groups
        .filter((group) => group.type === "fixed")
        .flatMap((group) =>
          (group.options || [])
            .filter((option) => option.isAvailable !== false)
            .map((option) => ({
              label: option.label,
              quantity: Math.max(1, option.quantity || 1),
              groupLabel: group.label,
              groupId: group.id || group.label,
              type: "fixed" as const,
            }))
        ),
      ...selectableGroups.flatMap((group) =>
        (group.options || [])
          .filter((option) => option.isAvailable !== false)
          .map((option) => ({
            label: option.label,
            quantity: counts[`${group.id || group.label}::${option.label}`] || 0,
            groupLabel: group.label,
            groupId: group.id || group.label,
            type: "selection" as const,
          }))
          .filter((selection) => selection.quantity > 0)
      ),
    ],
    [counts, groups, selectableGroups]
  );

  const isComplete =
    !isPackage ||
    (groups.length > 0 &&
      selectableGroups.every((group) => {
        const groupId = group.id || group.label;
        const selected = (group.options || []).reduce(
          (sum, option) => sum + (counts[`${groupId}::${option.label}`] || 0),
          0
        );
        return selected === group.requiredSelectionCount;
      }));

  const changeCount = (group: PackageGroup, optionLabel: string, delta: -1 | 1) => {
    const groupId = group.id || group.label;
    const key = `${groupId}::${optionLabel}`;

    setSelectionState((currentState) => {
      const current = currentState.productId === productId ? currentState.counts : {};
      const currentCount = current[key] || 0;
      const groupCount = (group.options || []).reduce(
        (sum, option) => sum + (current[`${groupId}::${option.label}`] || 0),
        0
      );

      if (delta > 0) {
        if (groupCount >= group.requiredSelectionCount) return currentState;
        if (group.allowRepeats === false && currentCount >= 1) return currentState;
      }

      const nextCount = Math.max(0, currentCount + delta);
      return {
        productId,
        counts: { ...current, [key]: nextCount },
      };
    });
  };

  return {
    counts,
    groups,
    isPackage,
    isComplete,
    selections,
    changeCount,
  };
};

interface PackageSelectionEditorProps {
  product?: Product;
  groups: PackageGroup[];
  counts: Record<string, number>;
  onChangeCount: (group: PackageGroup, optionLabel: string, delta: -1 | 1) => void;
  contextLabel: "order" | "invoice";
}

export default function PackageSelectionEditor({
  product,
  groups,
  counts,
  onChangeCount,
  contextLabel,
}: PackageSelectionEditorProps) {
  if (product?.productType !== "package") return null;

  if (groups.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This package has no valid configuration. Update the product before adding it to the {contextLabel}.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-[#b9aca2]/60 bg-[#faf9f5] p-4">
      <div className="mb-3">
        <p className="font-semibold text-[#222222]">
          {product.packageConfig?.selectionLabel || "Package selections"}
        </p>
        <p className="text-sm text-[#5d6043]">
          Choose the required items before adding this package to the {contextLabel}.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const groupId = group.id || group.label;
          const activeOptions = (group.options || [])
            .filter((option) => option.isAvailable !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          const selectedCount = activeOptions.reduce(
            (sum, option) => sum + (counts[`${groupId}::${option.label}`] || 0),
            0
          );

          return (
            <div key={groupId} className="space-y-2">
              <div>
                <p className="font-medium text-[#222222]">{group.label}</p>
                <p className="text-sm text-[#5d6043]">
                  {group.type === "fixed"
                    ? "Included in this package"
                    : `Select exactly ${group.requiredSelectionCount}. Chosen: ${selectedCount}/${group.requiredSelectionCount}`}
                </p>
              </div>

              <div className="grid gap-2">
                {activeOptions.map((option) => {
                  const optionCount = counts[`${groupId}::${option.label}`] || 0;
                  return (
                    <div
                      key={`${groupId}-${option.label}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#b9aca2]/60 bg-white/60 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-[#222222]">
                          {option.label}
                          {group.type === "fixed" && (
                            <span className="ml-2 text-sm text-[#5d6043]">x {option.quantity || 1}</span>
                          )}
                        </p>
                        {option.description && <p className="text-sm text-[#5d6043]">{option.description}</p>}
                      </div>

                      {group.type === "selection" && (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onChangeCount(group, option.label, -1)}
                            disabled={optionCount === 0}
                            aria-label={`Remove ${option.label}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b9aca2] disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-[#222222]">{optionCount}</span>
                          <button
                            type="button"
                            onClick={() => onChangeCount(group, option.label, 1)}
                            disabled={
                              selectedCount >= group.requiredSelectionCount ||
                              (group.allowRepeats === false && optionCount >= 1)
                            }
                            aria-label={`Add ${option.label}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b9aca2] disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
