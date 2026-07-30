"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, TicketPercent, X } from "lucide-react";
import { usePromotion } from "../context/PromotionContext";

export default function PromotionCodeField({ compact = false }: { compact?: boolean }) {
  const { quote, isValidating, error, applyCode, removeCode } = usePromotion();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (quote?.promotion.code) setCode(quote.promotion.code);
  }, [quote?.promotion.code]);

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    await applyCode(code);
  };

  if (quote) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-900">
                {quote.promotion.code} applied
              </p>
              <p className="truncate text-xs text-green-800">
                {quote.promotion.name} saves GHS{" "}
                {quote.pricing.codeDiscountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              removeCode();
              setCode("");
            }}
            className="rounded-md p-1 text-green-800 hover:bg-green-100"
            aria-label="Remove promotion code"
            title="Remove promotion code"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className={compact ? "space-y-2" : "space-y-3"}>
      <label className="block text-sm font-semibold text-[#222222]">
        Promotion code
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <TicketPercent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5d6043]" />
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={32}
            placeholder="Enter code"
            className="w-full rounded-lg border border-[#b9aca2] bg-white py-2 pl-9 pr-3 uppercase focus:border-transparent focus:ring-2 focus:ring-[#5d6043]"
          />
        </div>
        <button
          type="submit"
          disabled={isValidating || !code.trim()}
          className="inline-flex min-w-[76px] items-center justify-center rounded-lg bg-[#222222] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5d6043] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
