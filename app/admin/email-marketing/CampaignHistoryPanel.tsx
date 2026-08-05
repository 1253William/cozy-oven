"use client";

import { Clock01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { Campaign } from "../../services/marketingService";

type CampaignHistoryPanelProps = {
  campaigns: Campaign[];
  loading: boolean;
};

export default function CampaignHistoryPanel({
  campaigns,
  loading,
}: CampaignHistoryPanelProps) {
  return (
    <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#222222]">
        <AdminIcon icon={Clock01Icon} size={20} />
        Campaign history
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#5d6043]">
          <AdminIcon icon={Loading03Icon} size={16} className="animate-spin" />
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-[#5d6043]">No campaigns sent yet.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="rounded-lg border border-[#b9aca2]/60 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#222222]">{campaign.subject}</p>
                  <p className="text-xs text-[#5d6043]">
                    {new Date(campaign.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-[#b9aca2]/50 px-2 py-1 text-xs capitalize text-[#5d6043]">
                  {campaign.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-[#faf9f5] p-2">
                  <p className="font-bold text-[#222222]">
                    {campaign.recipientCount ?? campaign.recipients?.length ?? 0}
                  </p>
                  <p className="text-[#5d6043]">Recipients</p>
                </div>
                <div className="rounded bg-green-50 p-2">
                  <p className="font-bold text-green-700">{campaign.sentCount}</p>
                  <p className="text-green-700">Sent</p>
                </div>
                <div className="rounded bg-red-50 p-2">
                  <p className="font-bold text-red-700">{campaign.failedCount}</p>
                  <p className="text-red-700">Failed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
