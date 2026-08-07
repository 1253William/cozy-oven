import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { checkoutid?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
      <div className="max-w-md rounded-[28px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] p-8 text-center shadow-[0_12px_40px_rgba(34,34,34,0.10)]">
        <h1 className="mb-2 text-2xl font-bold text-[#222222]">Payment successful</h1>

        <p className="mb-4 text-[#5d6043]">
          Thanks for your payment. We&apos;ve received it successfully.
        </p>

        <p className="mb-6 text-sm leading-6 text-[#5d6043]">
          Once you&apos;ve tried your order, leave a review on the product page — it helps other
          customers choose their favourites.
        </p>

        {searchParams.checkoutid && (
          <p className="mb-6 text-sm text-[#5d6043]">
            Reference:{" "}
            <span className="font-mono">{searchParams.checkoutid}</span>
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-[#5d6043] px-6 py-3 font-semibold text-[#faf9f5] transition-colors hover:bg-[#222222]"
          >
            Browse products
          </Link>
          <Link
            href="/"
            className="inline-block rounded-full border border-[rgba(34,34,34,0.12)] px-6 py-3 font-semibold text-[#222222] transition-colors hover:border-[#bd6325] hover:text-[#bd6325]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
