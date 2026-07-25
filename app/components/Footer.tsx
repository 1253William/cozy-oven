"use client";

import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function Footer() {
  const settings = useSiteSettings();
  const phone = settings.footer.phone || "0249612035";
  const email = settings.footer.email || "info@cozyoven.store";
  const exploreLinks = settings.footer.exploreLinks?.length
    ? settings.footer.exploreLinks
    : [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "Our Story", href: "/about" },
        { label: "Contact", href: "/contact" },
      ];

  return (
    <footer className="editorial-shell border-t border-[rgba(34,34,34,0.12)]">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Cozy Oven home">
            <Image
              src="/cozy3.png"
              alt="Cozy Oven"
              width={58}
              height={58}
              className="rounded-full"
            />
            <span>
              <strong className="block leading-none text-[#222222]">Cozy Oven</strong>
              <small className="mt-1 block text-xs text-[#5d6043]">
                {settings.footer.tagline || "Fresh banana bread & gift boxes"}
              </small>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-[#5d6043]">
            {settings.footer.blurb ||
              "Handcrafted banana bread, yoghurt, and gift-ready packages made fresh with care in Tema."}
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold text-[#222222]">Explore</h3>
          <div className="grid gap-3 text-sm font-black text-[#5d6043]">
            {exploreLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="min-h-11 py-2 hover:text-[#bd6325] sm:min-h-0 sm:py-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold text-[#222222]">Contact</h3>
          <div className="grid gap-3 text-sm text-[#5d6043]">
            <a
              href={`mailto:${email}`}
              className="min-h-11 py-2 font-black text-[#5d6043] hover:text-[#bd6325] sm:min-h-0 sm:py-0"
            >
              {email}
            </a>
            <a
              href={`tel:${phone}`}
              className="min-h-11 py-2 font-black text-[#5d6043] hover:text-[#bd6325] sm:min-h-0 sm:py-0"
            >
              {phone}
            </a>
            <p>{settings.footer.address || "Tema Community 22, Nhmf Estates"}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={`tel:${phone}`}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#faf9f5] text-[#222222] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.09)] transition hover:text-[#bd6325]"
                aria-label="Call Cozy Oven"
              >
                <Phone className="h-5 w-5" />
              </a>
              {settings.social.whatsappUrl ? (
                <a
                  href={settings.social.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#2F855A] text-[#faf9f5] shadow-[0_8px_20px_rgba(47,133,90,0.28)] transition hover:bg-[#276749]"
                  aria-label="WhatsApp Cozy Oven"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              ) : null}
              {settings.social.tiktokUrl ? (
                <a
                  href={settings.social.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#faf9f5] text-[#222222] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.09)] transition hover:text-[#bd6325]"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              ) : null}
              {settings.social.instagramUrl ? (
                <a
                  href={settings.social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#faf9f5] text-[#222222] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.09)] transition hover:text-[#bd6325]"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
              <a
                href={`mailto:${email}`}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#faf9f5] text-[#222222] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.09)] transition hover:text-[#bd6325]"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(34,34,34,0.1)] px-4 py-5 text-center text-xs text-[#5d6043]">
        Copyright {new Date().getFullYear()} Cozy Oven. All rights reserved.
      </div>
    </footer>
  );
}
