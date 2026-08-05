"use client";

import { Loading03Icon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { CampaignSkin } from "../../services/marketingService";

type SkinSelectStepProps = {
  skins: CampaignSkin[];
  loading: boolean;
  skinId: string;
  onSelect: (id: string) => void;
};

export default function SkinSelectStep({
  skins,
  loading,
  skinId,
  onSelect,
}: SkinSelectStepProps) {
  return (
    <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
          <AdminIcon icon={PaintBoardIcon} size={20} />
          Choose an email skin
        </h2>
        <p className="text-sm text-[#5d6043]">
          Skins are campaign-only designs for holidays and promos — separate from Notifications
          transactional layouts.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#5d6043]">
          <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Loading skins...
        </div>
      ) : skins.length === 0 ? (
        <p className="text-sm text-[#5d6043]">No skins available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skins.map((skin) => {
            const active = skin.id === skinId;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => onSelect(skin.id)}
                className={`rounded-lg border bg-white p-4 text-left transition ${
                  active
                    ? "border-[#5d6043] ring-2 ring-[#5d6043]/25"
                    : "border-[#b9aca2]/60 hover:border-[#5d6043]/50"
                }`}
              >
                <div className="mb-3 flex gap-1.5">
                  {skin.swatch.map((color) => (
                    <span
                      key={`${skin.id}-${color}`}
                      className="h-7 w-7 rounded-md border border-black/10"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <p className="font-semibold text-[#222222]">{skin.name}</p>
                <p className="mt-1 text-sm text-[#5d6043]">{skin.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skin.themes.map((theme) => (
                    <span
                      key={`${skin.id}-${theme}`}
                      className="rounded-full bg-[#b9aca2]/35 px-2 py-0.5 text-[11px] font-medium text-[#5d6043]"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
                {active ? (
                  <p className="mt-3 text-xs font-semibold text-[#5d6043]">Selected</p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
