import type { Metadata } from "next";
import CozyKartClient from "./CozyKartClient";

export const metadata: Metadata = {
  title: "Cozy Kart | The Banana Bread Bar Experience",
  description:
    "Cozy Kart is Cozy Oven's interactive banana bread bar for weddings, birthdays, corporate events, and celebrations. The ultimate banana bread experience.",
  alternates: { canonical: "/cozy-kart" },
  openGraph: {
    title: "Cozy Kart | The Banana Bread Bar Experience",
    description:
      "An interactive banana bread bar that brings premium Cozy Oven banana bread to your next event.",
    url: "/cozy-kart",
    type: "website",
  },
};

export default function CozyKartPage() {
  return <CozyKartClient />;
}
