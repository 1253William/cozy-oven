"use client";

import {
  Bookmark01Icon,
  BookmarkOff01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "./AdminIcon";
import { filterCommandPaletteItems } from "./commandPalette";
import { menuItems } from "./navConfig";
import { isFavorite, MAX_NAV_FAVORITES } from "./navFavorites";

export type AdminCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  favoriteHrefs: string[];
  onToggleFavorite: (href: string) => void;
};

export default function AdminCommandPalette({
  open,
  onClose,
  favoriteHrefs,
  onToggleFavorite,
}: AdminCommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = filterCommandPaletteItems(menuItems, query, favoriteHrefs);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) navigateTo(target.href);
    }
  };

  const atFavoriteLimit = favoriteHrefs.length >= MAX_NAV_FAVORITES;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[#b9aca2]/60 bg-[#faf9f5] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[#b9aca2]/60 px-3 py-2.5">
          <AdminIcon
            icon={Search01Icon}
            size={18}
            className="shrink-0 text-[#5d6043]/70"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            aria-controls={listId}
            aria-activedescendant={
              results[activeIndex]
                ? `${listId}-option-${activeIndex}`
                : undefined
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-[#222222] outline-none placeholder:text-[#5d6043]/50"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#5d6043] hover:bg-[#b9aca2]/40"
            aria-label="Close"
          >
            <AdminIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <ul
          id={listId}
          role="listbox"
          className="max-h-[min(22rem,50vh)] overflow-y-auto py-1"
        >
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-[#5d6043]/70">
              No matching pages
            </li>
          ) : (
            results.map((item, index) => {
              const favorited = isFavorite(item.href, favoriteHrefs);
              const active = index === activeIndex;
              return (
                <li
                  key={item.href}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={active}
                  className={`flex items-center gap-1 px-2 ${
                    active ? "bg-[#b9aca2]/50" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <button
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[#5d6043]"
                  >
                    <AdminIcon icon={item.icon} size={18} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#222222]">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-[#5d6043]/70">
                        {item.section}
                      </span>
                    </span>
                    {favorited ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#5d6043]/60">
                        Pinned
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.href)}
                    disabled={!favorited && atFavoriteLimit}
                    title={
                      favorited
                        ? "Unpin"
                        : atFavoriteLimit
                          ? `Maximum ${MAX_NAV_FAVORITES} favorites`
                          : "Pin favorite"
                    }
                    aria-label={
                      favorited ? `Unpin ${item.name}` : `Pin ${item.name}`
                    }
                    className="shrink-0 rounded-md p-2 text-[#5d6043] hover:bg-[#b9aca2]/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <AdminIcon
                      icon={favorited ? BookmarkOff01Icon : Bookmark01Icon}
                      size={16}
                    />
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center gap-3 border-t border-[#b9aca2]/60 px-4 py-2 text-[11px] text-[#5d6043]/60">
          <span>
            <kbd className="rounded border border-[#b9aca2]/60 px-1">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-[#b9aca2]/60 px-1">Enter</kbd>{" "}
            open
          </span>
          <span>
            <kbd className="rounded border border-[#b9aca2]/60 px-1">Esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
