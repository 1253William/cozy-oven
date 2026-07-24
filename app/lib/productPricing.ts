export type SaleWindow = {
  salePrice?: number | null;
  saleStartsAt?: string | Date | null;
  saleEndsAt?: string | Date | null;
};

export const isSaleActive = (sale: SaleWindow, now: Date = new Date()): boolean => {
  const salePrice = Number(sale.salePrice);
  if (!Number.isFinite(salePrice) || salePrice < 0) return false;

  const startsAt = sale.saleStartsAt ? new Date(sale.saleStartsAt) : null;
  const endsAt = sale.saleEndsAt ? new Date(sale.saleEndsAt) : null;

  if (startsAt && Number.isFinite(startsAt.getTime()) && now < startsAt) return false;
  if (endsAt && Number.isFinite(endsAt.getTime()) && now > endsAt) return false;
  return true;
};

export const resolveProductPrice = (
  basePrice: number | null | undefined,
  sale: SaleWindow,
  now: Date = new Date()
): { price: number; compareAtPrice: number | null; onSale: boolean } => {
  const price = Number(basePrice) || 0;
  if (!isSaleActive(sale, now)) {
    return { price, compareAtPrice: null, onSale: false };
  }
  const salePrice = Number(sale.salePrice);
  return {
    price: salePrice,
    compareAtPrice: price > salePrice ? price : null,
    onSale: true,
  };
};
