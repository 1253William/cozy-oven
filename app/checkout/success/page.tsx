import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { checkoutid?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] px-4">
      <div className="max-w-md rounded-[28px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] p-8 text-center shadow-[0_12px_40px_rgba(34,34,34,0.10)]">
        <h1 className="font-editorial text-3xl tracking-[-0.03em] text-[#222222]">
          Payment successful
        </h1>

        <p className="mt-4 text-[#5d6043]">
          Thanks for your payment. We&apos;ve received it successfully.
        </p>

        {searchParams.checkoutid && (
          <p className="mt-4 text-sm text-[#5d6043]">
            Reference:{" "}
            <span className="font-mono text-[#222222]">{searchParams.checkoutid}</span>
          </p>
        )}

        <div className="mt-6 rounded-[22px] border border-[rgba(34,34,34,0.09)] bg-white/70 p-4 text-left">
          <p className="text-sm font-semibold text-[#222222]">After you try your treats</p>
          <p className="mt-2 text-sm leading-6 text-[#5d6043]">
            Leave a review on the product page — it helps other customers choose with confidence.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[#5d6043] px-6 py-3 font-semibold text-[#faf9f5] transition-colors hover:bg-[#222222]"
          >
            Browse products to review
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(34,34,34,0.12)] px-6 py-3 font-semibold text-[#222222] transition-colors hover:bg-white"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
