"use client";

import {
  Add01Icon,
  Cancel01Icon,
  Loading03Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect, useMemo, useState } from "react";
import CmsPageSectionsRenderer from "../../components/cms/CmsPageSectionsRenderer";
import {
  PAGE_SECTION_BLURBS,
  PAGE_SECTION_LABELS,
  createDemoPageSection,
  type CmsPageSectionType,
} from "../../services/cmsService";
import productService, { Product } from "../../services/productService";
import { isSaleActive } from "../../lib/productPricing";
import { resolveSectionProducts } from "../../lib/cmsSectionProducts";

type CmsSectionCatalogPickerProps = {
  types: readonly CmsPageSectionType[];
  onSelect: (type: CmsPageSectionType) => void;
  onClose: () => void;
};

export default function CmsSectionCatalogPicker({
  types,
  onSelect,
  onClose,
}: CmsSectionCatalogPickerProps) {
  const [selectedType, setSelectedType] = useState<CmsPageSectionType>(
    types[0] || "textIntro"
  );
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsBySectionId, setProductsBySectionId] = useState<
    Record<string, Product[]>
  >({});
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);

  const demoSection = useMemo(
    () => createDemoPageSection(selectedType),
    [selectedType]
  );

  useEffect(() => {
    if (!types.includes(selectedType) && types[0]) {
      setSelectedType(types[0]);
    }
  }, [types, selectedType]);

  useEffect(() => {
    let active = true;
    (async () => {
      const needsProducts =
        demoSection.type === "productStrip" ||
        (demoSection.type === "promoBanner" && demoSection.content?.productId);
      if (!needsProducts) {
        if (active) {
          setProductsBySectionId({});
          setProductsCatalog([]);
          setLoadingProducts(false);
        }
        return;
      }
      try {
        setLoadingProducts(true);
        const response = await productService.getProducts({ page: 1, limit: 100 });
        const list = response.data || [];
        if (!active) return;
        const sale = list.filter(
          (product) => product.isAvailable !== false && isSaleActive(product)
        );
        setProductsCatalog(list);
        const resolved = resolveSectionProducts(demoSection, {
          allProducts: list,
          saleProducts: sale,
        });
        setProductsBySectionId({
          [demoSection.id]:
            resolved.length > 0
              ? resolved
              : list.filter((product) => product.isAvailable !== false).slice(0, 4),
        });
      } catch {
        if (active) {
          setProductsBySectionId({});
          setProductsCatalog([]);
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [demoSection]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-3 sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-section-catalog-title"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#faf9f5] shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b9aca2]/40 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3
              id="cms-section-catalog-title"
              className="text-lg font-semibold text-[#222222]"
            >
              Choose a section
            </h3>
            <p className="text-sm text-[#5d6043]">
              Preview the look with sample content, then add it to your page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm text-[#5d6043] hover:bg-[#eeeae0]"
            aria-label="Close catalog"
          >
            <AdminIcon icon={Cancel01Icon} size={16} />
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
          <div className="max-h-[40vh] overflow-y-auto border-b border-[#b9aca2]/40 bg-white p-2 lg:max-h-none lg:border-b-0 lg:border-r">
            <ul className="grid gap-1">
              {types.map((type) => {
                const active = type === selectedType;
                return (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-[#5d6043] text-[#faf9f5]"
                          : "text-[#5d6043] hover:bg-[#eeeae0]"
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {PAGE_SECTION_LABELS[type]}
                      </span>
                      <span
                        className={`mt-0.5 block text-xs leading-snug ${
                          active ? "text-[#faf9f5]/80" : "text-[#5d6043]/85"
                        }`}
                      >
                        {PAGE_SECTION_BLURBS[type]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#b9aca2]/30 bg-[#faf9f5] px-4 py-2.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 text-sm text-[#5d6043]">
                <AdminIcon icon={ViewIcon} size={16} />
                <span className="truncate">
                  Demo preview · {PAGE_SECTION_LABELS[selectedType]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelect(selectedType)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-medium text-[#faf9f5] hover:bg-[#4a4d36]"
              >
                <AdminIcon icon={Add01Icon} size={16} />
                Add this section
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f5]">
              {loadingProducts ? (
                <div className="flex justify-center py-20">
                  <AdminIcon icon={Loading03Icon} size={32} className="animate-spin text-[#5d6043]" />
                </div>
              ) : (
                <div className="editorial-shell pointer-events-none">
                  <CmsPageSectionsRenderer
                    sections={[demoSection]}
                    productsBySectionId={productsBySectionId}
                    products={productsCatalog}
                    preview
                    includeDisabled
                  />
                </div>
              )}
            </div>

            <p className="border-t border-[#b9aca2]/30 bg-white px-4 py-2.5 text-xs text-[#5d6043] sm:px-5">
              Sample photos and copy are for preview only. After you add the section, you
              can edit the real content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
