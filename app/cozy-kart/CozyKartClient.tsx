"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSiteSettings } from "../context/SiteSettingsContext";

const buildSteps = [
  {
    step: "01",
    title: "Choose your loaf",
    body: "Start with a freshly baked slice of Classic or Chocolate Cozy Oven banana bread.",
  },
  {
    step: "02",
    title: "Add frosting",
    body: "Spread on Vanilla or Chocolate frosting — the first layer of customisation.",
  },
  {
    step: "03",
    title: "Load the toppings",
    body: "Fruit, biscuits, nuts, and sweet treats. Guests build the slice they want.",
  },
  {
    step: "04",
    title: "Finish with glaze",
    body: "Chocolate drizzle, salted caramel, Biscoff, maple — the signature finish.",
  },
];

const barStations = [
  {
    title: "Fresh Banana Bread",
    items: ["Classic", "Chocolate"],
  },
  {
    title: "Frostings",
    items: ["Vanilla", "Chocolate"],
  },
  {
    title: "Fresh Fruit",
    items: ["Strawberries", "Blueberries", "Grapes", "Seasonal fruits"],
  },
  {
    title: "Biscuits & Crunch",
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
    title: "Glazes & Sauces",
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

function KartVideo({ className = "" }: { className?: string }) {
  return (
    <video
      className={className}
      src="/cozy-kart.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Cozy Kart banana bread bar in action"
    />
  );
}

export default function CozyKartClient() {
  const settings = useSiteSettings();
  const whatsappHref =
    settings.social.whatsappUrl || "https://api.whatsapp.com/message/QAOMJAY7KI7WP1";

  return (
    <>
      <div className="h-9 shrink-0" aria-hidden />
      <Navbar />
      <main className="editorial-shell">
        {/* Hero */}
        <section className="relative min-h-[calc(100vh-100px)] overflow-hidden">
          <KartVideo className="absolute inset-0 h-full w-full scale-105 object-cover motion-safe:animate-[cozy-kart-drift_28s_ease-in-out_infinite_alternate]" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#222222]/78 via-[#222222]/28 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
            <div className="motion-safe:animate-[cozy-kart-rise_0.9s_ease_both]">
              <p className="font-editorial text-[clamp(3.25rem,10vw,6.5rem)] leading-[0.9] tracking-[-0.045em] text-[#faf9f5]">
                Cozy Kart
              </p>
              <h1 className="mt-5 max-w-xl text-[clamp(1.25rem,2.8vw,1.85rem)] font-medium leading-snug text-[#faf9f5]/90">
                The Banana Bread Bar Experience
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-[#faf9f5]/72 sm:text-lg">
                Premium banana bread, built by your guests.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2F855A] px-7 py-3.5 font-semibold text-[#faf9f5] shadow-[0_16px_30px_rgba(34,34,34,0.18)] transition hover:bg-[#276749]"
                >
                  Book Cozy Kart
                </a>
                <a
                  href="#whats-on-the-bar"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#faf9f5]/30 bg-[#faf9f5]/10 px-7 py-3.5 font-semibold text-[#faf9f5] transition hover:bg-[#faf9f5] hover:text-[#222222]"
                >
                  See the bar
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Intro + portrait video return */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-medium text-[#bd6325]">Interactive dessert station</p>
            <h2 className="prototype-heading mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
              Guests don&apos;t just eat banana bread—they create their own.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5d6043]">
              Cozy Kart is Cozy Oven&apos;s interactive banana bread bar, designed to bring
              the joy of premium banana bread to weddings, birthdays, corporate events,
              church gatherings, festivals, and private celebrations.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#5d6043]">
              Guests start with a freshly baked slice and customise it with frostings,
              fruits, nuts, biscuits, sweets, and glazes — every serving personalised.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            <div className="soft-glow absolute inset-6 rounded-full opacity-80" aria-hidden />
            <div className="relative overflow-hidden rounded-[36px] border border-[rgba(34,34,34,0.1)] bg-[#222222] shadow-[0_26px_80px_rgba(34,34,34,0.16)]">
              <div className="relative aspect-[9/16] max-h-[min(72vh,640px)] w-full">
                <KartVideo className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Build flow */}
        <section className="border-y border-[rgba(34,34,34,0.08)] bg-[rgba(34,34,34,0.03)]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <h2 className="prototype-heading text-3xl sm:text-4xl">How guests build a slice</h2>
              <p className="mt-3 text-[#5d6043]">
                Four simple moves. Endless combinations.
              </p>
            </div>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {buildSteps.map((item) => (
                <li key={item.step} className="relative">
                  <span className="font-editorial text-4xl tracking-[-0.04em] text-[#b9aca2]">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#222222]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#5d6043]">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What's on the Bar */}
        <section
          id="whats-on-the-bar"
          className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="max-w-2xl">
            <h2 className="prototype-heading text-3xl sm:text-4xl lg:text-5xl">
              What&apos;s on the Bar?
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5d6043]">
              From classic loaves to signature glazes — a full station ready for guests to
              build their own.
            </p>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {barStations.map((station) => (
              <div key={station.title} className="border-t border-[rgba(34,34,34,0.14)] pt-6">
                <h3 className="font-editorial text-2xl tracking-[-0.03em] text-[#222222]">
                  {station.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {station.items.map((item) => (
                    <li
                      key={item}
                      className="text-base font-medium leading-6 text-[#5d6043]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tagline band */}
        <section className="bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-4 py-20 text-[#faf9f5] sm:px-6 lg:px-8 lg:py-28">
          <blockquote className="mx-auto max-w-4xl text-center">
            <p className="font-editorial text-[clamp(2rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.035em]">
              The Ultimate Banana Bread Experience.
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-[#faf9f5]/75 sm:text-lg sm:leading-8">
              Every serving is personalised — making Cozy Kart a memorable attraction at
              any event, and showcasing Cozy Oven&apos;s signature banana bread in a fun,
              interactive way.
            </p>
          </blockquote>
        </section>

        {/* Perfect For */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h2 className="prototype-heading text-center text-3xl sm:text-4xl">Perfect For</h2>
          <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5">
            {occasions.map((occasion, index) => (
              <li key={occasion} className="flex items-center gap-3 sm:gap-4">
                <span className="font-editorial text-xl tracking-[-0.02em] text-[#222222] sm:text-2xl lg:text-3xl">
                  {occasion}
                </span>
                {index < occasions.length - 1 ? (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b9aca2]"
                    aria-hidden
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-6 py-14 text-center text-[#faf9f5] shadow-[0_26px_80px_rgba(34,34,34,0.16)] sm:px-10 lg:px-16 lg:py-20">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#faf9f5]/10 blur-3xl"
              aria-hidden
            />
            <p className="relative font-editorial text-3xl tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Bring Cozy Kart to your next event
            </p>
            <p className="relative mx-auto mt-5 max-w-2xl text-base leading-7 text-[#faf9f5]/78 sm:text-lg">
              A premium dessert station that combines great taste, creativity, and
              entertainment — a standout feature guests will talk about.
            </p>
            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#faf9f5] px-8 py-3.5 font-semibold text-[#222222] transition hover:bg-[#b9aca2]"
              >
                Book on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#faf9f5]/30 px-8 py-3.5 font-semibold text-[#faf9f5] transition hover:bg-[#faf9f5]/10"
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
