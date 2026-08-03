"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSiteSettings } from "../context/SiteSettingsContext";

const barCategories = [
  {
    title: "Fresh Banana Bread",
    items: ["Classic", "Chocolate"],
  },
  {
    title: "Frostings",
    items: ["Vanilla", "Chocolate"],
  },
  {
    title: "Fresh Fruit Toppings",
    items: ["Strawberries", "Blueberries", "Grapes", "Seasonal fruits"],
  },
  {
    title: "Premium Biscuits & Crunch",
    items: ["Oreo", "Lotus Biscoff", "Cookie Crumble"],
  },
  {
    title: "Nuts",
    items: ["Pistachios", "Almonds", "Mixed Nuts"],
  },
  {
    title: "Sweet Treats",
    items: ["Chocolate Chips", "Mini Marshmallows", "Sprinkles", "Caramel Pieces"],
  },
  {
    title: "Signature Glazes & Sauces",
    items: [
      "Chocolate Drizzle",
      "Salted Caramel",
      "White Chocolate",
      "Biscoff Sauce",
      "Maple Syrup",
    ],
  },
];

const occasions = [
  "Weddings",
  "Birthday Parties",
  "Baby Showers",
  "Bridal Showers",
  "Corporate Events",
  "Conferences",
  "Church Events",
  "School Events",
  "Festivals",
  "Product Launches",
  "Christmas Parties",
  "Private Celebrations",
];

export default function CozyKartClient() {
  const settings = useSiteSettings();
  const whatsappHref =
    settings.social.whatsappUrl || "https://api.whatsapp.com/message/QAOMJAY7KI7WP1";

  return (
    <>
      <div className="h-9 shrink-0" aria-hidden />
      <Navbar />
      <main className="editorial-shell">
        <section className="relative min-h-[calc(100vh-100px)] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover motion-safe:animate-[cozy-kart-drift_28s_ease-in-out_infinite_alternate]"
            src="/cozy-kart.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Cozy Kart banana bread bar in action"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#222222]/90 via-[#222222]/50 to-[#222222]/28"
            aria-hidden
          />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
            <div className="motion-safe:animate-[cozy-kart-rise_0.9s_ease_both]">
              <p className="font-editorial text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.04em] text-[#faf9f5]">
                Cozy Kart
              </p>
              <h1 className="mt-4 max-w-2xl text-[clamp(1.35rem,3.2vw,2rem)] font-medium leading-snug text-[#faf9f5]/92">
                The Banana Bread Bar Experience
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#faf9f5]/78 sm:text-lg sm:leading-8">
                Cozy Oven&apos;s interactive banana bread bar for weddings, birthdays,
                corporate events, and celebrations worth remembering.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2F855A] px-7 py-3.5 font-semibold text-[#faf9f5] shadow-[0_16px_30px_rgba(34,34,34,0.18)] transition hover:bg-[#276749] hover:shadow-[0_26px_80px_rgba(34,34,34,0.16)]"
                >
                  Book Cozy Kart
                </a>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#faf9f5]/30 bg-[#faf9f5]/12 px-7 py-3.5 font-semibold text-[#faf9f5] transition hover:bg-[#faf9f5] hover:text-[#222222]"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <p className="text-lg leading-8 text-[#5d6043] sm:text-xl sm:leading-9">
            Guests start with a freshly baked slice of Cozy Oven banana bread and
            customize it with a selection of delicious toppings, creating their own
            unique dessert.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="prototype-heading text-3xl sm:text-4xl">What&apos;s on the Bar?</h2>
            <p className="mt-3 text-[#5d6043]">
              From classic loaves to signature glazes — every topping is ready for guests
              to build their own.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {barCategories.map((category) => (
              <div key={category.title}>
                <h3 className="border-b border-[rgba(34,34,34,0.12)] pb-3 font-editorial text-lg tracking-[-0.02em] text-[#222222]">
                  {category.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {category.items.map((item) => (
                    <li key={item} className="text-[15px] leading-6 text-[#5d6043]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-[rgba(34,34,34,0.08)] bg-[rgba(34,34,34,0.03)]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="prototype-heading text-center text-3xl sm:text-4xl">Perfect For</h2>
            <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {occasions.map((occasion) => (
                <li
                  key={occasion}
                  className="text-center text-[15px] font-medium leading-6 text-[#5d6043] sm:text-left"
                >
                  {occasion}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <h2 className="prototype-heading text-3xl sm:text-4xl">
            The Cozy Kart Experience
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5d6043]">
            Guests don&apos;t just eat banana bread—they create their own masterpiece.
            From choosing their favourite loaf to adding frostings, fruits, nuts,
            biscuits, sweets, and glazes, every serving is personalised, making Cozy Kart
            a memorable attraction at any event.
          </p>
          <p className="mt-8 font-editorial text-xl tracking-[-0.02em] text-[#222222] sm:text-2xl">
            The Ultimate Banana Bread Experience.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-6 py-14 text-center text-[#faf9f5] shadow-[0_26px_80px_rgba(34,34,34,0.16)] sm:px-10 lg:px-16 lg:py-16">
            <p className="font-editorial text-3xl tracking-[-0.03em] sm:text-4xl">
              Bring Cozy Kart to your next event
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#faf9f5]/80">
              A premium dessert station that combines great taste, creativity, and
              entertainment — showcasing Cozy Oven&apos;s signature banana bread in a fun
              and memorable way.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#faf9f5] px-7 py-3 font-semibold text-[#222222] transition hover:bg-[#b9aca2]"
              >
                Book on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#faf9f5]/30 px-7 py-3 font-semibold text-[#faf9f5] transition hover:bg-[#faf9f5]/10"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
