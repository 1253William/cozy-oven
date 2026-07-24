"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import CmsPageSectionsRenderer from "../../components/cms/CmsPageSectionsRenderer";
import type { CmsPageSection } from "../../services/cmsService";
import { PAGE_SECTION_LABELS } from "../../services/cmsService";
import productService, { Product } from "../../services/productService";
import { isSaleActive } from "../../lib/productPricing";
import { resolveSectionProducts } from "../../lib/cmsSectionProducts";
import { splitLeadingPromo } from "../../lib/cmsSectionOrder";

type CmsDraftPreviewModalProps = {
  title: string;
  subtitle?: string;
  sections: CmsPageSection[];
  /** When set, only that section is shown (even if disabled). */
  sectionId?: string | null;
  onClose: () => void;
};

export default function CmsDraftPreviewModal({
  title,
  subtitle,
  sections,
  sectionId = null,
  onClose,
}: CmsDraftPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [productsBySectionId, setProductsBySectionId] = useState<
    Record<string, Product[]>
  >({});

  const { leadingPromo, bodySections, singleSection } = useMemo(() => {
    if (sectionId) {
      const match = sections.find((section) => section.id === sectionId);
      return {
        leadingPromo: null as CmsPageSection | null,
        bodySections: match ? [{ ...match, enabled: true }] : [],
        singleSection: true,
      };
    }
    const split = splitLeadingPromo(sections);
    return {
      leadingPromo: split.leadingPromo,
      bodySections: split.leadingPromo ? split.rest : sections,
      singleSection: false,
    };
  }, [sections, sectionId]);

  const sectionLabel =
    sectionId && bodySections[0]
      ? PAGE_SECTION_LABELS[bodySections[0].type]
      : null;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const needsProducts = bodySections.some(
          (section) => section.type === "productStrip"
        );
        if (!needsProducts) {
          if (active) {
            setProductsBySectionId({});
            setLoading(false);
          }
          return;
        }
        const all = await productService.getProducts({ page: 1, limit: 100 });
        const list = all.data || [];
        const sale = list.filter(
          (product) => product.isAvailable !== false && isSaleActive(product)
        );
        const map: Record<string, Product[]> = {};
        for (const section of bodySections) {
          if (section.type !== "productStrip") continue;
          map[section.id] = resolveSectionProducts(section, {
            allProducts: list,
            saleProducts: sale,
          });
        }
        if (active) setProductsBySectionId(map);
      } catch (err) {
        console.error(err);
        if (active) setProductsBySectionId({});
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sectionId,
    JSON.stringify(
      bodySections.map((section) => ({
        id: section.id,
        type: section.type,
        productIds: section.content?.productIds,
        categoryFilter: section.content?.categoryFilter,
        showOnSaleProducts: section.content?.showOnSaleProducts,
      }))
    ),
  ]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-3 sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#faf9f5] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b9aca2]/50 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#222222]">{title}</h2>
            <p className="mt-0.5 text-sm text-[#5d6043]">
              {sectionLabel
                ? `Section preview · ${sectionLabel}`
                : subtitle || "Live draft preview (unsaved changes included)"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[#eeeae0]"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
            </div>
          ) : singleSection ? (
            <div className="editorial-shell bg-[#faf9f5]">
              <CmsPageSectionsRenderer
                sections={bodySections}
                productsBySectionId={productsBySectionId}
                preview
                includeDisabled
              />
            </div>
          ) : (
            <div className="editorial-shell bg-[#faf9f5]">
              {leadingPromo ? (
                <>
                  <CmsPageSectionsRenderer sections={[leadingPromo]} preview />
                  <div className="border-b border-[#b9aca2]/40 bg-[#eeeae0]/60 px-4 py-3 text-center text-xs font-medium text-[#5d6043]">
                    Navigation sits below the promo on the live site
                  </div>
                  <CmsPageSectionsRenderer
                    sections={bodySections}
                    productsBySectionId={productsBySectionId}
                    preview
                  />
                </>
              ) : (
                <CmsPageSectionsRenderer
                  sections={bodySections}
                  productsBySectionId={productsBySectionId}
                  preview
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
