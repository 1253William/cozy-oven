"use client";

import { useCart } from "../context/CartContext";
import Toast from "./Toast";

export default function CartToastWrapper({ children }: { children: React.ReactNode }) {
  const { toastMessage, clearToast } = useCart();

  return (
    <>
      {children}
      <Toast message={toastMessage} onClose={clearToast} />
    </>
  );
}

