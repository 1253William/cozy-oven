"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuantitySelector from "../../components/QuantitySelector";
import SizeSelector from "../../components/SizeSelector";
import ProductTabs from "../../components/ProductTabs";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import useCustomerProduct from "../../hooks/useProductDetails";
import { resolveProductPrice } from "../../lib/productPricing";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [packageSelectionCounts, setPackageSelectionCounts] = useState<Record<string, number>>({});
  const { product, loading } = useCustomerProduct(id as string);

  // Check if this is a minis/mini/flightbox product
  const isMiniCategory = (category?: string) => {
    if (!category) return false;
    const lower = category.toLowerCase();
    return lower === "minis" || lower === "mini" || lower === "flightbox";
  };
  const isMinisProduct = isMiniCategory(product?.productCategory);
  const minQuantity = isMinisProduct ? 4 : 1;
  
  // Filter to only show available options
  const availableOptions = product?.selectOptions?.filter(
    opt => opt.isAvailable !== false && opt.soldIndividually !== false
  ) ?? [];
  const sizes = availableOptions.map(opt => opt.label) ?? ["Regular"];

  // A product is "sold out" if it has variants and ALL variants are unavailable
  const hasVariants = (product?.selectOptions?.length ?? 0) > 0;
  const isSoldOut = hasVariants && availableOptions.length === 0;
  const isPackageProduct = product?.productType === "package";
  const packageGroups = useMemo(() => {
    const groups = product?.packageConfig?.groups;
    if (groups && groups.length > 0) {
      return [...groups].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    const legacyOptions = product?.packageConfig?.options || [];
    if (legacyOptions.length > 0) {
      return [
        {
          id: "default",
          label: product?.packageConfig?.selectionLabel || "Choose your options",
          type: "selection" as const,
          requiredSelectionCount: product?.packageConfig?.requiredSelectionCount || 1,
          allowRepeats: true,
          options: legacyOptions,
          sortOrder: 0,
        },
      ];
    }

    return [];
  }, [product?.packageConfig]);
  const selectablePackageGroups = packageGroups.filter((group) => group.type !== "fixed");
  const selectedPackageCount = Object.values(packageSelectionCounts).reduce((sum, count) => sum + count, 0);
  const requiredPackageCount = selectablePackageGroups.reduce(
    (sum, group) => sum + (group.requiredSelectionCount || 0),
    0
  );
  const fixedPackageSelections = packageGroups
    .filter((group) => group.type === "fixed")
    .flatMap((group) =>
      (group.options || [])
        .filter((option) => option.isAvailable !== false)
        .map((option) => ({
          label: option.label,
          quantity: option.quantity || 1,
          groupLabel: group.label,
          groupId: group.id || group.label,
          type: "fixed" as const,
        }))
    );
  const packageSelections = [
    ...fixedPackageSelections,
    ...selectablePackageGroups.flatMap((group) =>
      (group.options || [])
        .filter((option) => option.isAvailable !== false)
        .map((option) => ({
          label: option.label,
          quantity: packageSelectionCounts[`${group.id || group.label}::${option.label}`] || 0,
          groupLabel: group.label,
          groupId: group.id || group.label,
          type: "selection" as const,
        }))
        .filter((selection) => selection.quantity > 0)
    ),
  ];
  const packageSelectionComplete =
    !isPackageProduct ||
    selectablePackageGroups.every((group) => {
      const groupId = group.id || group.label;
      const count = (group.options || []).reduce(
        (sum, option) => sum + (packageSelectionCounts[`${groupId}::${option.label}`] || 0),
        0
      );
      return count === group.requiredSelectionCount;
    });
  
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableOptions?.[0]?.label ?? null
  );

  const galleryImages = useMemo(() => {
    if (!product) return [] as string[];
    const seen = new Set<string>();
    const out: string[] = [];
    const push = (url?: string | null) => {
      const u = typeof url === "string" ? url.trim() : "";
      if (!u) return;
      if (seen.has(u)) return;
      seen.add(u);
      out.push(u);
    };
    push(product.thumbnail);
    (product.images ?? []).forEach(push);
    return out;
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    setPackageSelectionCounts({});
  }, [id]);

  useEffect(() => {
    if (activeImageIndex >= galleryImages.length) {
      setActiveImageIndex(0);
    }
  }, [galleryImages.length, activeImageIndex]);

  // Update selectedSize and quantity when product loads
  useEffect(() => {
    if (product && availableOptions.length > 0) {
      const firstAvailable = availableOptions[0]?.label;
      if (firstAvailable && (!selectedSize || !availableOptions.find(opt => opt.label === selectedSize))) {
        setSelectedSize(firstAvailable);
      }
    }
    // Set minimum quantity for minis
    if (product && isMiniCategory(product.productCategory)) {
      setQuantity(prev => Math.max(prev, 4));
    }
  }, [product, availableOptions]);

  // Size price is absolute; sale window still applies on top of the chosen unit price.
  const priced = (() => {
    if (!product) return { price: 0, compareAtPrice: null as number | null, onSale: false };

    const option = availableOptions.find(
      opt => opt.label === selectedSize
    );

    const base = option?.additionalPrice ?? product.price;
    return resolveProductPrice(base, product);
  })();
  const currentPrice = priced.price;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="editorial-shell flex min-h-screen items-center justify-center pt-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#bd6325]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="editorial-shell flex min-h-screen items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="font-editorial mb-4 text-4xl text-[#222222]">Product not found</h1>
            <button
              onClick={() => router.push("/")}
              className="editorial-button px-6 py-3"
            >
              Return to home
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }


  const mainImageSrc =
    galleryImages[activeImageIndex] ??
    product.thumbnail ??
    "/placeholder.svg";

  const handleAddToCart = () => {
    if (!packageSelectionComplete) return;

    addToCart(
      {
        id: product.id,
        name: product.productName,
        price: `GHS ${currentPrice.toFixed(2)}`,
        image: mainImageSrc,
        description: product.productDetails,
        rating: product.rating || 4.5,
        reviews: 0,
        sizes,
        details: product.productDetails
      },
      quantity,
      selectedSize ?? undefined,
      packageSelections
    );
  };

  const wishlistItemKey = selectedSize ?? undefined;
  const alreadyInWishlist = isInWishlist(product.id, wishlistItemKey);

  const handleToggleWishlist = () => {
    if (alreadyInWishlist) {
      removeFromWishlist(product.id, wishlistItemKey);
      setWishlistFeedback("Removed from wishlist");
    } else {
      addToWishlist({
        id: product.id,
        name: product.productName,
        price: `GHS ${currentPrice.toFixed(2)}`,
        image: mainImageSrc,
        description: product.productDetails,
        rating: product.rating || 4.5,
        reviews: 0,
        sizes,
        details: product.productDetails,
        quantity: 1,
        selectedSize: wishlistItemKey,
      });
      setWishlistFeedback("Saved to wishlist");
    }
    window.setTimeout(() => setWishlistFeedback(null), 2000);
  };

  const updatePackageSelection = (groupId: string, label: string, nextCount: number, requiredCount: number) => {
    setPackageSelectionCounts((prev) => {
      const key = `${groupId}::${label}`;
      const current = prev[key] || 0;
      const groupTotal = Object.entries(prev)
        .filter(([entryKey]) => entryKey.startsWith(`${groupId}::`))
        .reduce((sum, [, count]) => sum + count, 0);
      const totalWithoutCurrent = groupTotal - current;
      const bounded = Math.max(
        0,
        Math.min(nextCount, Math.max(0, requiredCount - totalWithoutCurrent))
      );
      return {
        ...prev,
        [key]: bounded,
      };
    });
  };

  return (
    <>
      <Navbar />
      <main className="editorial-shell min-h-screen pb-16 pt-20">
        <div className="max-w-7xl mx-auto px-4">

          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 font-black text-[#5d6043] transition hover:text-[#bd6325]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-12">

            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-[36px] border border-[rgba(34,34,34,0.09)] bg-[#b9aca2] shadow-[0_26px_80px_rgba(34,34,34,0.16)]">
                <Image
                  src={mainImageSrc}
                  alt={product.productName}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i <= 0 ? galleryImages.length - 1 : i - 1
                        )
                      }
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#faf9f5]/90 p-2 text-[#222222] shadow-md transition-colors hover:bg-[#faf9f5]"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i >= galleryImages.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-[#faf9f5]/90 p-2 text-[#222222] shadow-md transition-colors hover:bg-[#faf9f5]"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#222222]/40 px-2 py-1">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === activeImageIndex
                              ? "w-6 bg-[#faf9f5]"
                              : "w-2 bg-[#faf9f5]/50 hover:bg-[#faf9f5]/70"
                          }`}
                          aria-label={`Image ${i + 1} of ${galleryImages.length}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {isSoldOut && (
                  <div className="absolute top-4 right-4 bg-red-500 text-[#faf9f5] px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10">
                    Sold Out
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin snap-x snap-mandatory">
                  {galleryImages.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                    className={`relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-2xl border-2 transition-all sm:h-24 sm:w-24 ${
                        i === activeImageIndex
                          ? "border-[#bd6325] ring-2 ring-[#bd6325]/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.productName} — image ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <h1 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222] sm:text-4xl">
                  {product.productName}
                </h1>
                {isSoldOut && (
                  <span className="rounded-full bg-red-700 px-3 py-1 text-sm font-semibold text-[#faf9f5]">
                    Sold Out
                  </span>
                )}
              </div>

              <p className="mb-4 text-sm text-[#5d6043]">
                Baked with love in Tema · Loved across 1,300+ deliveries
              </p>

              <p className="mb-6 text-2xl font-semibold text-[#bd6325] sm:text-3xl">
                {priced.compareAtPrice != null ? (
                  <>
                    <span className="mr-3 text-lg font-normal text-[#5d6043]/55 line-through">
                      GHS {priced.compareAtPrice.toFixed(2)}
                    </span>
                    GHS {currentPrice.toFixed(2)}
                  </>
                ) : (
                  <>GHS {currentPrice.toFixed(2)}</>
                )}
              </p>

              <p className="mb-6 leading-8 text-[#5d6043]">
                {product.productDetails}
              </p>

              {!isSoldOut && (
                <>
                  {hasVariants && (
                    <div className="mb-6">
                      <label className="mb-2 block font-black text-[#222222]">Size</label>
                      <SizeSelector
                        sizes={sizes}
                        selectedSize={selectedSize}
                        onSizeChange={setSelectedSize}
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="mb-2 block font-black text-[#222222]">Quantity</label>
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      min={minQuantity}
                    />
                    {isMinisProduct && (
                      <p className="mt-2 text-sm font-black text-[#bd6325]">
                        Minimum order: 4 pieces
                      </p>
                    )}
                  </div>

                  {isPackageProduct && (
                    <div className="mb-6 rounded-[30px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/86 p-5 shadow-[0_12px_40px_rgba(34,34,34,0.10)]">
                      <div className="mb-5">
                        <label className="block text-lg font-semibold text-[#222222]">
                          {product.packageConfig?.selectionLabel || "Build your gift box"}
                        </label>
                        <ol className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[#5d6043]">
                          <li className="rounded-full bg-[#b9aca2]/50 px-3 py-1.5 text-[#222222]">
                            1. Review size
                          </li>
                          <li
                            className={`rounded-full px-3 py-1.5 ${
                              packageSelectionComplete
                                ? "bg-[#222222] text-[#faf9f5]"
                                : "bg-[#bd6325]/15 text-[#bd6325]"
                            }`}
                          >
                            2. Pick items
                          </li>
                          <li className="rounded-full border border-[rgba(34,34,34,0.12)] px-3 py-1.5">
                            3. Add to cart
                          </li>
                        </ol>
                        <p className="mt-3 text-sm text-[#5d6043]">
                          {requiredPackageCount > 0
                            ? `Chosen: ${selectedPackageCount}/${requiredPackageCount}`
                            : "Included items are fixed for this package."}
                        </p>
                      </div>

                      <div className="space-y-5">
                        {packageGroups.map((group) => {
                          const groupId = group.id || group.label;
                          const activeOptions = (group.options || [])
                            .filter((option) => option.isAvailable !== false)
                            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                          const groupSelectedCount = activeOptions.reduce(
                            (sum, option) => sum + (packageSelectionCounts[`${groupId}::${option.label}`] || 0),
                            0
                          );

                          return (
                            <div key={groupId} className="space-y-3">
                              <div>
                                <p className="font-black text-[#222222]">{group.label}</p>
                                <p className="text-sm text-[#5d6043]">
                                  {group.type === "fixed"
                                    ? "Included in this package"
                                    : `Select exactly ${group.requiredSelectionCount}. Chosen: ${groupSelectedCount}/${group.requiredSelectionCount}`}
                                </p>
                              </div>

                              {activeOptions.map((option) => {
                                const optionCount = packageSelectionCounts[`${groupId}::${option.label}`] || 0;
                                return (
                                  <div
                                    key={`${groupId}-${option.label}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] p-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-black text-[#222222]">
                                        {option.label}
                                        {group.type === "fixed" && (
                                          <span className="ml-2 text-sm text-[#5d6043]">x {option.quantity || 1}</span>
                                        )}
                                      </p>
                                      {option.description && (
                                        <p className="text-sm text-[#5d6043]">{option.description}</p>
                                      )}
                                    </div>

                                    {group.type === "selection" && (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updatePackageSelection(groupId, option.label, optionCount - 1, group.requiredSelectionCount)
                                          }
                                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(34,34,34,0.12)] bg-[#faf9f5] disabled:opacity-40"
                                          disabled={optionCount === 0}
                                        >
                                          -
                                        </button>
                                        <span className="w-8 text-center font-semibold">{optionCount}</span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updatePackageSelection(groupId, option.label, optionCount + 1, group.requiredSelectionCount)
                                          }
                                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(34,34,34,0.12)] bg-[#faf9f5] disabled:opacity-40"
                                          disabled={
                                            groupSelectedCount >= group.requiredSelectionCount ||
                                            (group.allowRepeats === false && optionCount >= 1)
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut || !packageSelectionComplete}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-full px-8 py-4 font-black transition-all ${
                    isSoldOut || !packageSelectionComplete
                      ? "cursor-not-allowed bg-[#b9aca2] text-[#5d6043]"
                      : "bg-[#222222] text-[#faf9f5] shadow-[0_16px_30px_rgba(34,34,34,0.18)] hover:bg-[#222222]"
                  }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {isSoldOut
                    ? "Sold Out"
                    : !packageSelectionComplete
                    ? `Select ${requiredPackageCount} options`
                    : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-4 font-black transition-all ${
                    alreadyInWishlist
                      ? "border-[#bd6325] bg-[#bd6325]/10 text-[#bd6325]"
                      : "border-[rgba(34,34,34,0.12)] bg-[#faf9f5] text-[#5d6043] hover:border-[#bd6325] hover:text-[#bd6325]"
                  }`}
                  aria-label={alreadyInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-5 w-5 ${alreadyInWishlist ? "fill-[#bd6325] text-[#bd6325]" : ""}`}
                  />
                  {alreadyInWishlist ? "Saved" : "Wishlist"}
                </button>
              </div>
              {wishlistFeedback ? (
                <p className="mt-2 text-sm font-medium text-[#5d6043]">{wishlistFeedback}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-16">
            <ProductTabs details={product.productDetails} productId={String(product.id || id)} />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
