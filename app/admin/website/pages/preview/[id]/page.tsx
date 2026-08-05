"use client";

import {
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../../../components/AdminIcon";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminLayout from "../../../../components/AdminLayout";
import CmsPageSectionsRenderer from "../../../../../components/cms/CmsPageSectionsRenderer";
import cmsService, { CmsPage } from "../../../../../services/cmsService";
import productService, { Product } from "../../../../../services/productService";
import { isSaleActive } from "../../../../../lib/productPricing";
import { resolveSectionProducts } from "../../../../../lib/cmsSectionProducts";

export default function CmsPagePreviewPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [page, setPage] = useState<CmsPage | null>(null);
  const [productsBySectionId, setProductsBySectionId] = useState<Record<string, Product[]>>(
    {}
  );
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await cmsService.getAdminPage(id);
        if (!active) return;
        setPage(data);

        const all = await productService.getProducts({ page: 1, limit: 100 });
        const list = all.data || [];
        setProductsCatalog(list);
        const sale = list.filter(
          (product: Product) => product.isAvailable !== false && isSaleActive(product)
        );
        const map: Record<string, Product[]> = {};
        for (const section of data.sections || []) {
          if (section.type !== "productStrip") continue;
          map[section.id] = resolveSectionProducts(section, {
            allProducts: list,
            saleProducts: sale,
          });
        }
        setProductsBySectionId(map);
      } catch (err) {
        console.error(err);
        if (active) setError("Could not load preview.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <AdminLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/website/pages"
          className="inline-flex items-center gap-2 text-sm text-[#5d6043] hover:text-[#222222]"
        >
          ← Back to pages
        </Link>
        {page ? (
          <span className="rounded-full bg-[#eeeae0] px-3 py-1 text-xs font-medium text-[#5d6043]">
            Preview · {page.status} · {(page.sections || []).length} sections
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <AdminIcon icon={Loading03Icon} size={32} className="animate-spin text-[#5d6043]" />
        </div>
      ) : error || !page ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Page not found"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5]">
          <CmsPageSectionsRenderer
            sections={page.sections || []}
            productsBySectionId={productsBySectionId}
            products={productsCatalog}
            preview
          />
        </div>
      )}
    </AdminLayout>
  );
}
