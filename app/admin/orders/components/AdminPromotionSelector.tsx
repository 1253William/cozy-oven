"use client";

import {
  Cancel01Icon,
  Loading03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";

import { useEffect, useMemo, useState } from "react";
import type { OrderItem } from "../../../services/orderService";
import promotionService, {
  type Promotion,
  type PromotionQuote,
} from "../../../services/promotionService";

interface AdminPromotionSelectorProps {
  items: OrderItem[];
  quote: PromotionQuote | null;
  onChange: (quote: PromotionQuote | null) => void;
}

export default function AdminPromotionSelector({
  items,
  quote,
  onChange,
}: AdminPromotionSelectorProps) {
  const [code, setCode] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingOptions(true);
    promotionService
      .list({ status: "active", limit: 100 })
      .then((response) => {
        if (active) setPromotions(response.data || []);
      })
      .catch(() => {
        if (active) setPromotions([]);
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const itemSignature = useMemo(() => JSON.stringify(items), [items]);

  const apply = async (nextCode = code) => {
    if (!nextCode.trim() || items.length === 0) return;
    setApplying(true);
    setError(null);
    try {
      const nextQuote = await promotionService.validate(nextCode, items);
      setCode(nextQuote.promotion.code);
      onChange(nextQuote);
    } catch (err) {
      onChange(null);
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "This promotion code could not be applied"
      );
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    if (!quote?.promotion.code || items.length === 0) return;
    const timer = window.setTimeout(() => {
      void apply(quote.promotion.code);
    }, 350);
    return () => window.clearTimeout(timer);
    // Revalidate only when selected products or quantities change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSignature]);

  if (quote) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <AdminIcon icon={Tick02Icon} size={16} className="mt-0.5 text-green-700" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                {quote.promotion.code} applied
              </p>
              <p className="text-xs text-green-800">
                Discount: GHS {quote.pricing.codeDiscountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCode("");
              setError(null);
              onChange(null);
            }}
            className="rounded-md p-1 text-green-800 hover:bg-green-100"
            aria-label="Remove promotion"
            title="Remove promotion"
          >
            <AdminIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#5d6043]">
        Promotion Code (Optional)
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <AdminIcon icon={Tick02Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d6043]" />
          <input
            list="active-promotion-codes"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={loadingOptions || items.length === 0}
            placeholder={
              items.length === 0
                ? "Add products first"
                : loadingOptions
                  ? "Loading codes..."
                  : "Search or enter code"
            }
            className="w-full rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 uppercase focus:border-transparent focus:ring-2 focus:ring-[#5d6043] disabled:bg-gray-100"
          />
          <datalist id="active-promotion-codes">
            {promotions.map((promotion) => (
              <option
                key={promotion._id}
                value={promotion.code}
                label={`${promotion.name}${promotion.influencerName ? ` - ${promotion.influencerName}` : ""}`}
              />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={() => void apply()}
          disabled={applying || !code.trim() || items.length === 0}
          className="inline-flex min-w-[76px] items-center justify-center rounded-lg bg-[#222222] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5d6043] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applying ? <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
