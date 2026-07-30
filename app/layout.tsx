import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartToastWrapper from "./components/CartToastWrapper";
import PurchaseToast from "./components/PurchaseToast";
import ReviewPromptModal from "./components/ReviewPromptModal";
import DeliveryBanner from "./components/DeliveryBanner";
import StorefrontMotion from "./components/StorefrontMotion";
import ApiWarmupBanner from "./components/ApiWarmupBanner";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { PromotionProvider } from "./context/PromotionContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store"),
  title: {
    default: "Cozy Oven | Premium Banana Bread & Gift Boxes in Ghana",
    template: "%s | Cozy Oven",
  },
  description:
    "Order premium banana bread, mini loaves, gift boxes, and baked treats from Cozy Oven in Ghana.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cozy Oven | Premium Banana Bread & Gift Boxes in Ghana",
    description:
      "Shop Cozy Oven banana bread, gift boxes, mini loaves, and premium baked treats.",
    url: "/",
    siteName: "Cozy Oven",
    images: [{ url: "/gift.png", width: 1200, height: 630, alt: "Cozy Oven gift box" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cozy Oven | Premium Banana Bread & Gift Boxes in Ghana",
    description:
      "Shop Cozy Oven banana bread, gift boxes, mini loaves, and premium baked treats.",
    images: ["/gift.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Cozy Oven",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store",
    image: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cozyoven.store"}/gift.png`,
    email: "info@cozyoven.store",
    servesCuisine: "Bakery",
    priceRange: "GHS",
    sameAs: ["https://cozyoven.store"],
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <PromotionProvider>
                <SiteSettingsProvider>
                  <CartToastWrapper>
                    <ApiWarmupBanner />
                    <DeliveryBanner />
                    <StorefrontMotion />
                    {children}
                    <PurchaseToast />
                    <ReviewPromptModal />
                  </CartToastWrapper>
                </SiteSettingsProvider>
              </PromotionProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
