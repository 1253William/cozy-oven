"use client";

import { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import EditorialProductCard from "./EditorialProductCard";
import { testimonials } from "../data/testimonials";
import useCustomerProducts from "../hooks/useCustomerProducts";
import faqService, { Faq } from "../services/faqService";
import { Product } from "../services/productService";
import subscriberService from "../services/subscriberService";
import type { HomepageSection } from "../services/cmsService";
import { fallbackHomepageSections } from "../lib/homeData";

type HomeClientProps = {
  initialProducts?: Product[];
  initialFaqs?: Faq[];
  initialHomepageSections?: HomepageSection[];
};

export default function HomeClient({
  initialProducts = [],
  initialFaqs = [],
  initialHomepageSections,
}: HomeClientProps) {
  const { products, loading, error } = useCustomerProducts({
    limit: 100,
    autoFetch: initialProducts.length === 0,
  });
  const resolvedProducts = products.length > 0 ? products : initialProducts;
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const homepageSections = (
    initialHomepageSections?.length
      ? initialHomepageSections
      : fallbackHomepageSections()
  )
    .filter((section) => section.enabled !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sectionByType = (type: HomepageSection["type"]) =>
    homepageSections.find((section) => section.type === type);

  const hero = sectionByType("hero");
  const signatureSection = sectionByType("signature");
  const productStrip = sectionByType("productStrip");
  const giftCta = sectionByType("giftCta");
  const faqSection = sectionByType("faq");
  const newsletter = sectionByType("newsletter");

  const categoryFilter = productStrip?.content?.categoryFilter?.trim() || "";
  const signatureProductId = signatureSection?.content?.productId?.trim() || "";

  const filteredForStrip = categoryFilter
    ? resolvedProducts.filter((product) =>
        product.productCategory?.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    : resolvedProducts;
  const bestSellers = (filteredForStrip.length ? filteredForStrip : resolvedProducts).slice(0, 4);
  const bananaProducts = resolvedProducts.filter((product) =>
    product.productCategory?.toLowerCase().includes("banana")
  );
  const yogurtProducts = resolvedProducts.filter((product) =>
    product.productCategory?.toLowerCase().includes("yog")
  );
  const packageProducts = resolvedProducts.filter((product) => {
    const category = product.productCategory?.toLowerCase() || "";
    return (
      product.productType === "package" ||
      category.includes("package") ||
      category.includes("gift") ||
      category.includes("flight")
    );
  });
  const signatureFromCms = signatureProductId
    ? resolvedProducts.find((product) => String(product.id) === signatureProductId)
    : undefined;
  const signature = signatureFromCms || bananaProducts[0] || resolvedProducts[0];
  const giftPackage =
    packageProducts.find((product) =>
      product.packageConfig?.groups?.some((group) => group.type === "selection")
    ) || packageProducts[0];
  const heroImage =
    hero?.content?.imageUrl ||
    signatureSection?.content?.imageUrl ||
    "https://res.cloudinary.com/daljxj4yl/image/upload/v1782461961/cozyoven/products_thumbnails/urzdqfzt92jqdnhx0mef.jpg";
  const giftImage = giftCta?.content?.imageUrl || giftPackage?.thumbnail || "/gift.png";
  const previewFaqs = faqs.slice(0, 4);

  useEffect(() => {
    if (initialFaqs.length > 0) return;
    faqService.getPublicFaqs().then(setFaqs);
  }, [initialFaqs.length]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus(null);
    try {
      const fullName = newsletterEmail.split("@")[0] || "Subscriber";
      await subscriberService.addSubscriber({
        fullName,
        email: newsletterEmail.trim(),
      });
      setNewsletterStatus("Thanks for subscribing!");
      setNewsletterEmail("");
    } catch (err: unknown) {
      const typed = err as { response?: { data?: { message?: string } } };
      setNewsletterStatus(
        typed.response?.data?.message || "Could not subscribe. Please try again."
      );
    }
  };

  return (
    <>
      <Navbar />
      <main className="editorial-shell">
        {homepageSections.map((section) => {
          if (section.type === "promoBanner" && section.content?.message) {
            return (
              <div
                key={section.id}
                className="bg-[#222222] px-4 py-3 text-center text-sm text-[#faf9f5]"
              >
                <span>{section.content.message}</span>
                {section.content.ctaHref ? (
                  <Link
                    href={section.content.ctaHref}
                    className="ml-3 font-semibold underline underline-offset-2"
                  >
                    {section.content.ctaLabel || "Shop"}
                  </Link>
                ) : null}
              </div>
            );
          }

          if (section.type === "hero" && hero) {
            return (
              <Fragment key={section.id}>
                <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:min-h-[calc(100vh-100px)] lg:grid-cols-[0.95fr_1fr] lg:gap-12 lg:px-8 lg:py-20">
                  <div className="flex flex-col justify-center">
                    <p className="mb-4 text-sm font-medium text-[#bd6325]">
                      {hero.content.eyebrow || "Tema-baked · Ghana-loved · Gift-ready"}
                    </p>
                    <h1 className="prototype-heading max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] text-[#222222]">
                      {hero.content.headline || "Moist banana bread, freshly baked."}
                    </h1>
                    <p className="mt-5 max-w-xl text-[clamp(1.15rem,2.4vw,1.65rem)] font-medium leading-snug text-[#5d6043]">
                      {hero.content.body ||
                        "Homemade loaves and gift boxes for cravings, family tables, and moments worth remembering."}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href={hero.content.ctaHref || "/shop"}
                        className="editorial-button px-7 py-3.5"
                      >
                        {hero.content.ctaLabel || "Shop now"}
                      </Link>
                      <Link
                        href={
                          hero.content.secondaryCtaHref ||
                          (giftPackage ? `/product/${giftPackage.id}` : "/shop#package")
                        }
                        className="editorial-button-outline px-7 py-3.5"
                      >
                        {hero.content.secondaryCtaLabel || "Send a gift box"}
                      </Link>
                    </div>
                  </div>

                  <div className="relative grid min-h-[480px] place-items-center sm:min-h-[560px] lg:min-h-[620px] lg:-translate-y-6">
                    <div className="soft-glow absolute h-[88%] w-[88%] rounded-full" />
                    <article className="float-card relative w-[min(440px,88vw)] overflow-hidden rounded-[44px] border border-[rgba(34,34,34,0.1)] bg-gradient-to-b from-[#faf9f5]/95 to-[#b9aca2]/95 p-5 shadow-[0_26px_80px_rgba(34,34,34,0.16)]">
                      <span className="absolute left-6 top-6 z-10 rounded-full bg-[#222222] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#faf9f5]">
                        {signatureSection?.content?.eyebrow || "Best seller"}
                      </span>
                      <div className="relative h-[300px] overflow-hidden rounded-[34px] sm:h-[360px]">
                        <Image
                          src={heroImage}
                          alt={
                            signatureSection?.content?.headline ||
                            signature?.productName ||
                            "Cozy Oven banana bread"
                          }
                          fill
                          priority
                          className="scale-[1.08] object-cover drop-shadow-[0_34px_34px_rgba(34,34,34,0.3)]"
                          sizes="(max-width: 1024px) 88vw, 440px"
                        />
                      </div>
                      <div className="px-2 pb-2 pt-4">
                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#222222] sm:text-2xl">
                          {signatureSection?.content?.headline ||
                            signature?.productName ||
                            "Chocolate Banana Bread"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#5d6043]">
                          {signatureSection?.content?.body ||
                            "Soft, rich, moist and baked in small batches."}
                        </p>
                        <Link
                          href={
                            signatureSection?.content?.ctaHref ||
                            (signature ? `/product/${signature.id}` : "/shop")
                          }
                          className="mt-5 inline-flex rounded-full bg-[#bd6325] px-5 py-3 font-semibold text-[#faf9f5] transition hover:bg-[#222222]"
                        >
                          {signatureSection?.content?.ctaLabel || "Shop now"}
                        </Link>
                      </div>
                    </article>
                    <aside className="absolute right-0 top-14 hidden max-w-[220px] rounded-[22px_22px_22px_6px] border border-[rgba(34,34,34,0.08)] bg-[#faf9f5] p-4 shadow-[0_12px_40px_rgba(34,34,34,0.10)] md:block">
                      <strong className="block text-sm leading-5 text-[#222222]">
                        &quot;The bread melts in your mouth.&quot;
                      </strong>
                      <span className="mt-2 block text-xs text-[#5d6043]">Family order review</span>
                    </aside>
                    <aside className="absolute bottom-40 left-0 hidden max-w-[220px] rounded-[22px_22px_22px_6px] border border-[rgba(34,34,34,0.08)] bg-[#faf9f5] p-4 shadow-[0_12px_40px_rgba(34,34,34,0.10)] md:block lg:bottom-48">
                      <strong className="block text-sm leading-5 text-[#222222]">
                        &quot;Saved the day, Anita.&quot;
                      </strong>
                      <span className="mt-2 block text-xs text-[#5d6043]">Customer message</span>
                    </aside>
                  </div>
                </section>
              </Fragment>
            );
          }

          if (section.type === "signature") {
            return null;
          }

          if (section.type === "productStrip" && productStrip) {
            return (
              <section
                key={section.id}
                className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
              >
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="prototype-heading text-3xl sm:text-4xl">
                      {productStrip.content.headline || "Customer favourites, freshly baked."}
                    </h2>
                    <p className="mt-3 text-[#5d6043]">
                      {productStrip.content.body ||
                        "Shop our most loved loaves, boxes, and creamy yoghurt treats."}
                    </p>
                  </div>
                  <Link
                    href={productStrip.content.ctaHref || "/shop"}
                    className="editorial-button-outline px-5 py-2.5 text-sm"
                  >
                    {productStrip.content.ctaLabel || "View all"}
                  </Link>
                </div>
                {loading ? (
                  <div className="editorial-card p-10 text-center text-[#5d6043]">
                    Loading products...
                  </div>
                ) : error ? (
                  <div className="editorial-card p-10 text-center text-[#bd6325]">{error}</div>
                ) : bestSellers.length === 0 ? (
                  <div className="editorial-card p-10 text-center text-[#5d6043]">
                    No products are available right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                    {bestSellers.map((product) => (
                      <EditorialProductCard key={product.id} product={product} compact />
                    ))}
                  </div>
                )}
              </section>
            );
          }

          if (section.type === "giftCta" && giftCta) {
            return (
              <Fragment key={section.id}>
                <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                  <div className="relative grid overflow-hidden rounded-[36px] bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] text-[#faf9f5] shadow-[0_26px_80px_rgba(34,34,34,0.16)] md:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative z-10 p-7 md:p-12 lg:p-14">
                      <h2 className="prototype-heading text-3xl sm:text-4xl">
                        {giftCta.content.headline || "Send a Cozy Oven gift box."}
                      </h2>
                      <p className="mt-4 max-w-xl text-base leading-7 text-[#faf9f5]/82">
                        {giftCta.content.body ||
                          "Build a warm gift for birthdays, thank-yous, office teams, and just-because surprises."}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {["Birthday", "Thank you", "Office treat", "Get well soon"].map(
                          (occasion) => (
                            <span
                              key={occasion}
                              className="rounded-full border border-[#faf9f5]/20 bg-[#faf9f5]/10 px-4 py-2 text-sm font-medium text-[#faf9f5]"
                            >
                              {occasion}
                            </span>
                          )
                        )}
                      </div>
                      <Link
                        href={
                          giftCta.content.ctaHref ||
                          (giftPackage ? `/product/${giftPackage.id}` : "/shop#package")
                        }
                        className="mt-8 inline-flex rounded-full bg-[#faf9f5] px-7 py-3.5 font-semibold text-[#222222] shadow-[0_16px_30px_rgba(34,34,34,0.18)] transition hover:-translate-y-0.5"
                      >
                        {giftCta.content.ctaLabel ||
                          (giftPackage ? "Build a gift box" : "Shop packages")}
                      </Link>
                    </div>
                    <div className="relative min-h-[280px] md:min-h-full">
                      <Image
                        src={giftImage}
                        alt={giftPackage?.productName || "Cozy Oven gift box"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 45vw"
                      />
                    </div>
                  </div>
                </section>

                {(yogurtProducts.length > 0 || resolvedProducts.length > 0) && (
                  <section className="border-y border-[rgba(34,34,34,0.1)] bg-[#faf9f5]/60">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                      <div>
                        <h2 className="prototype-heading text-3xl sm:text-4xl">Yoghurt</h2>
                        <p className="mt-4 leading-7 text-[#5d6043]">
                          Made with real fruit, live cultures and absolutely no preservatives.
                        </p>
                        <Link href="/shop" className="editorial-button-outline mt-6 px-6 py-3">
                          Shop Yoghurt
                        </Link>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(yogurtProducts.length
                          ? yogurtProducts.slice(0, 2)
                          : resolvedProducts.slice(0, 2)
                        ).map((product) => (
                          <EditorialProductCard key={product.id} product={product} compact />
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                  <div className="mb-8 max-w-2xl">
                    <h2 className="prototype-heading text-3xl sm:text-4xl">
                      WhatsApp praise from Tema and beyond.
                    </h2>
                    <p className="mt-3 text-[#5d6043]">
                      1,300+ deliveries, quick drop-offs, and messages that keep us baking.
                    </p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-[36px] bg-[#222222] p-5 shadow-[0_26px_80px_rgba(34,34,34,0.16)]">
                      <div className="flex items-center gap-3 px-3 pb-4 text-[#faf9f5]">
                        <span className="h-3 w-3 rounded-full bg-[#20C05C]" />
                        <strong className="font-semibold">Cozy Oven reviews</strong>
                      </div>
                      <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#b9aca2] p-5">
                        <div className="whatsapp-review-track space-y-4">
                          {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map(
                            (testimonial, index) => (
                              <p
                                key={`${testimonial.id}-${index}`}
                                className={`max-w-[86%] rounded-[20px] px-4 py-3 leading-6 text-[#222222] shadow-[0_10px_24px_rgba(34,34,34,0.08)] ${
                                  index % 2 === 0
                                    ? "rounded-bl-md bg-[#faf9f5]"
                                    : "ml-auto rounded-br-md bg-[#DFF5D7]"
                                }`}
                              >
                                {testimonial.message}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid content-start gap-4">
                      {testimonials.slice(0, 3).map((testimonial) => (
                        <article
                          key={testimonial.id}
                          className="rounded-[28px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/80 p-6 shadow-[0_12px_40px_rgba(34,34,34,0.10)]"
                        >
                          <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em] text-[#222222] sm:text-2xl">
                            &quot;{testimonial.message}&quot;
                          </h3>
                        </article>
                      ))}
                      <a
                        href="https://api.whatsapp.com/message/QAOMJAY7KI7WP1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[#2F855A] px-6 py-3.5 font-semibold text-[#faf9f5] shadow-[0_16px_30px_rgba(34,34,34,0.18)] transition hover:-translate-y-0.5"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Reach out on WhatsApp
                      </a>
                    </div>
                  </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                  <div className="grid items-center gap-8 rounded-[36px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/78 p-7 shadow-[0_12px_40px_rgba(34,34,34,0.10)] md:grid-cols-[260px_1fr] md:p-10">
                    <div className="grid aspect-square w-full max-w-[220px] place-items-center rounded-[32px] bg-gradient-to-br from-[#b9aca2] via-[#73765a] to-[#5d6043] shadow-[0_26px_80px_rgba(34,34,34,0.16)] md:-rotate-2">
                      <Heart
                        className="h-16 w-16 fill-[#faf9f5] text-[#faf9f5]"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h2 className="prototype-heading text-3xl sm:text-4xl">
                        Baked with love, trusted by repeat customers.
                      </h2>
                      <p className="mt-4 max-w-3xl leading-7 text-[#5d6043]">
                        A small Tema team — warm, creative, and committed to fresh banana bread that
                        makes the day better.
                      </p>
                      <Link href="/about" className="editorial-button-outline mt-6 px-6 py-3">
                        Our story
                      </Link>
                    </div>
                  </div>
                </section>
              </Fragment>
            );
          }

          if (section.type === "faq" && faqSection && previewFaqs.length > 0) {
            return (
              <section
                key={section.id}
                className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
              >
                <div className="mb-6 max-w-2xl">
                  <h2 className="prototype-heading text-3xl sm:text-4xl">
                    {faqSection.content.headline || "Delivery, freshness and gifting."}
                  </h2>
                </div>
                <div className="grid max-w-3xl gap-3">
                  {previewFaqs.map((faq, index) => (
                    <details
                      key={faq.id}
                      open={index === 0}
                      className="rounded-[22px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/78 p-5 shadow-[0_12px_40px_rgba(34,34,34,0.10)]"
                    >
                      <summary className="cursor-pointer text-base font-semibold text-[#222222]">
                        {faq.question}
                      </summary>
                      <p className="mt-3 whitespace-pre-line leading-7 text-[#5d6043]">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === "newsletter" && newsletter) {
            return (
              <section
                key={section.id}
                className="bg-gradient-to-br from-[#222222] via-[#5d6043] to-[#73765a] px-4 py-16 text-[#faf9f5] sm:px-6 lg:px-8"
              >
                <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
                  <h2 className="prototype-heading text-3xl sm:text-4xl">
                    {newsletter.content.headline ||
                      "New flavours, fresh bakes and special offers."}
                  </h2>
                  <form
                    onSubmit={handleNewsletter}
                    className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
                  >
                    <label htmlFor="home-newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="home-newsletter-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      className="min-h-12 flex-1 rounded-full border border-[#faf9f5]/15 bg-[#faf9f5]/10 px-5 text-[#faf9f5] outline-none placeholder:text-[#b9aca2]/70 focus:border-[#b9aca2]"
                    />
                    <button type="submit" className="editorial-button min-h-12 px-8">
                      {newsletter.content.ctaLabel || "Subscribe"}
                    </button>
                  </form>
                  {newsletterStatus && (
                    <p className="text-sm text-[#faf9f5]/85" role="status" aria-live="polite">
                      {newsletterStatus}
                    </p>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}

        {!giftCta && (
          <>
            {(yogurtProducts.length > 0 || resolvedProducts.length > 0) && (
              <section className="border-y border-[rgba(34,34,34,0.1)] bg-[#faf9f5]/60">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
                  <div>
                    <h2 className="prototype-heading text-3xl sm:text-4xl">Yoghurt</h2>
                    <p className="mt-4 leading-7 text-[#5d6043]">
                      Made with real fruit, live cultures and absolutely no preservatives.
                    </p>
                    <Link href="/shop" className="editorial-button-outline mt-6 px-6 py-3">
                      Shop Yoghurt
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(yogurtProducts.length
                      ? yogurtProducts.slice(0, 2)
                      : resolvedProducts.slice(0, 2)
                    ).map((product) => (
                      <EditorialProductCard key={product.id} product={product} compact />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="mb-8 max-w-2xl">
                <h2 className="prototype-heading text-3xl sm:text-4xl">
                  WhatsApp praise from Tema and beyond.
                </h2>
                <p className="mt-3 text-[#5d6043]">
                  1,300+ deliveries, quick drop-offs, and messages that keep us baking.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[36px] bg-[#222222] p-5 shadow-[0_26px_80px_rgba(34,34,34,0.16)]">
                  <div className="flex items-center gap-3 px-3 pb-4 text-[#faf9f5]">
                    <span className="h-3 w-3 rounded-full bg-[#20C05C]" />
                    <strong className="font-semibold">Cozy Oven reviews</strong>
                  </div>
                  <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#b9aca2] p-5">
                    <div className="whatsapp-review-track space-y-4">
                      {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map(
                        (testimonial, index) => (
                          <p
                            key={`${testimonial.id}-${index}`}
                            className={`max-w-[86%] rounded-[20px] px-4 py-3 leading-6 text-[#222222] shadow-[0_10px_24px_rgba(34,34,34,0.08)] ${
                              index % 2 === 0
                                ? "rounded-bl-md bg-[#faf9f5]"
                                : "ml-auto rounded-br-md bg-[#DFF5D7]"
                            }`}
                          >
                            {testimonial.message}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid content-start gap-4">
                  {testimonials.slice(0, 3).map((testimonial) => (
                    <article
                      key={testimonial.id}
                      className="rounded-[28px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/80 p-6 shadow-[0_12px_40px_rgba(34,34,34,0.10)]"
                    >
                      <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em] text-[#222222] sm:text-2xl">
                        &quot;{testimonial.message}&quot;
                      </h3>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
              <div className="grid items-center gap-8 rounded-[36px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5]/78 p-7 shadow-[0_12px_40px_rgba(34,34,34,0.10)] md:grid-cols-[260px_1fr] md:p-10">
                <div className="grid aspect-square w-full max-w-[220px] place-items-center rounded-[32px] bg-gradient-to-br from-[#b9aca2] via-[#73765a] to-[#5d6043] shadow-[0_26px_80px_rgba(34,34,34,0.16)] md:-rotate-2">
                  <Heart className="h-16 w-16 fill-[#faf9f5] text-[#faf9f5]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="prototype-heading text-3xl sm:text-4xl">
                    Baked with love, trusted by repeat customers.
                  </h2>
                  <p className="mt-4 max-w-3xl leading-7 text-[#5d6043]">
                    A small Tema team — warm, creative, and committed to fresh banana bread that
                    makes the day better.
                  </p>
                  <Link href="/about" className="editorial-button-outline mt-6 px-6 py-3">
                    Our story
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
