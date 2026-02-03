import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import CartToastWrapper from "./components/CartToastWrapper";
import PurchaseToast from "./components/PurchaseToast";
import DeliveryBanner from "./components/DeliveryBanner";

export const metadata: Metadata = {
  title: "Cozy Oven - Delicious Baked Goods",
  description: "Order delicious baked goods from Cozy Oven",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <CartToastWrapper>
                <DeliveryBanner />
                {children}
                <PurchaseToast />
              </CartToastWrapper>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
