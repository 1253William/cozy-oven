import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { checkoutid?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>

        <p className="text-zinc-600 mb-4">
          Your payment was cancelled. If this was a mistake, please try again.
        </p>

        
        <Link
          href="/"
          className="inline-block rounded-md bg-[#2A2C22] px-6 py-3 text-white font-semibold hover:bg-[#1F2118] transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
