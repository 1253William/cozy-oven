"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to orders page by default
    router.push("/account/orders");
  }, [router]);

  return null;
}
