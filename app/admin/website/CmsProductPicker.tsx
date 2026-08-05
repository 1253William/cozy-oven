"use client";

import {
  Cancel01Icon,
  Loading03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import productService, { Product } from "../../services/productService";

type CmsProductPickerProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  maxSelections?: number;
};

export default function CmsProductPicker({
  selectedIds,
  onChange,
  label = "Products on this page",
  maxSelections,
}: CmsProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({ page: 1, limit: 100 });
        if (active) setProducts(response.data || []);
      } catch (err) {
        console.error(err);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => map.set(String(product.id), product));
    return map;
  }, [products]);

  const selectedProducts = selectedIds
    .map((id) => byId.get(String(id)))
    .filter(Boolean) as Product[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.productName?.toLowerCase().includes(q) ||
        product.productCategory?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const toggle = (id: string) => {
    const key = String(id);
    if (selectedIds.includes(key)) {
      onChange(selectedIds.filter((item) => item !== key));
      return;
    }
    if (maxSelections === 1) {
      onChange([key]);
      return;
    }
    if (maxSelections && selectedIds.length >= maxSelections) return;
    onChange([...selectedIds, key]);
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== String(id)));
  };

  return (
    <div className="space-y-3 sm:col-span-2">
      <span className="block text-sm font-semibold text-[#5d6043]">{label}</span>

      {selectedProducts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => remove(product.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[#b9aca2] bg-white px-3 py-1.5 text-sm text-[#222222]"
            >
              <span className="relative h-6 w-6 overflow-hidden rounded-full bg-[#eeeae0]">
                {product.thumbnail ? (
                  <Image src={product.thumbnail} alt="" fill className="object-cover" sizes="24px" />
                ) : null}
              </span>
              {product.productName}
              <AdminIcon icon={Cancel01Icon} size={12} className="h-3.5 w-3.5 text-[#5d6043]" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#5d6043]/80">None selected yet</p>
      )}

      <div className="relative">
        <AdminIcon icon={Search01Icon} size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5d6043]/70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search01Icon products"
          className="w-full rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-[#b9aca2]/70 bg-white">
        {loading ? (
          <div className="flex justify-center py-8">
            <AdminIcon icon={Loading03Icon} size={20} className="animate-spin text-[#5d6043]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[#5d6043]">No products found</p>
        ) : (
          <ul className="divide-y divide-[#eeeae0]">
            {filtered.map((product) => {
              const selected = selectedIds.includes(String(product.id));
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => toggle(String(product.id))}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-[#faf9f5] ${
                      selected ? "bg-[#eeeae0]" : ""
                    }`}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#eeeae0]">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#222222]">
                        {product.productName}
                      </span>
                      <span className="block truncate text-xs text-[#5d6043]">
                        {product.productCategory}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        selected
                          ? "bg-[#5d6043] text-[#faf9f5]"
                          : "bg-[#faf9f5] text-[#5d6043] ring-1 ring-[#b9aca2]"
                      }`}
                    >
                      {selected ? "Added" : "Add"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
