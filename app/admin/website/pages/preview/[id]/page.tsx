"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminLayout from "../../../../components/AdminLayout";
import EditorialProductCard from "../../../../../components/EditorialProductCard";
import cmsService, { CmsPage } from "../../../../../services/cmsService";
import productService, { Product } from "../../../../../services/productService";
import { isSaleActive } from "../../../../../lib/productPricing";

export default function CmsPagePreviewPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [page, setPage] = useState<CmsPage | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
        const wanted = data.content?.productIds || [];
        const selected = wanted
          .map((pid: string) => list.find((product: Product) => String(product.id) === String(pid)))
          .filter(Boolean) as Product[];
        const sale = data.content?.showOnSaleProducts
          ? list.filter(
              (product: Product) => product.isAvailable !== false && isSaleActive(product)
            )
          : [];
        setProducts(selected.length > 0 ? selected : sale);
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

  const headline = page?.content?.headline || page?.title || "";
  const isPromo = page?.template === "promo";

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
            Preview · {page.status}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#5d6043]" />
        </div>
      ) : error || !page ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Page not found"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#b9aca2]/60 bg-[#faf9f5]">
          <section
            className={`relative overflow-hidden ${
              isPromo ? "bg-[#222222] text-[#faf9f5]" : "bg-[#faf9f5] text-[#222222]"
            }`}
          >
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
              <div>
                <h1 className="font-editorial text-3xl tracking-[-0.03em] sm:text-4xl">
                  {headline}
                </h1>
                {page.content?.body ? (
                  <p
                    className={`mt-4 max-w-xl text-base leading-7 ${
                      isPromo ? "text-[#faf9f5]/80" : "text-[#5d6043]"
                    }`}
                  >
                    {page.content.body}
                  </p>
                ) : null}
                {page.content?.ctaLabel && page.content?.ctaHref ? (
                  <span
                    className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${
                      isPromo
                        ? "border border-[#faf9f5] text-[#faf9f5]"
                        : "bg-[#5d6043] text-[#faf9f5]"
                    }`}
                  >
                    {page.content.ctaLabel}
                  </span>
                ) : null}
              </div>
              {page.content?.imageUrl ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#b9aca2]">
                  <Image
                    src={page.content.imageUrl}
                    alt={headline}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
            </div>
          </section>

          {products.length > 0 ? (
            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <h2 className="font-editorial mb-6 text-2xl text-[#222222]">Shop the picks</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <EditorialProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}
