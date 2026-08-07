"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const revealSelector = [
  ".editorial-shell section",
  ".editorial-card",
  ".prototype-card",
  "[data-reveal]",
].join(",");

export default function StorefrontMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add("in-view"));
      return;
    }

    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0: reveal as soon as any pixel enters the viewport.
      // A 0.16 threshold breaks mobile shop — single-column category
      // sections are taller than the viewport, so they never reach 16% visible.
      { threshold: 0, rootMargin: "64px 0px 64px 0px" }
    );

    const observeElement = (element: HTMLElement) => {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add("reveal");
      observer.observe(element);
    };

    elements.forEach(observeElement);

    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(revealSelector).forEach(observeElement);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
