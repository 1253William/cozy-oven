"use client";

import {
  CheckmarkSquare02Icon,
  Delete02Icon,
  Loading03Icon,
  Search01Icon,
  SquareIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";
import type { MarketingRecipient } from "../../services/marketingService";
import {
  field,
  recipientKey,
  type RecipientSourceFilter,
} from "./emailMarketingUtils";

type AudiencePanelProps = {
  recipients: MarketingRecipient[];
  filteredRecipients: MarketingRecipient[];
  selectedRecipients: MarketingRecipient[];
  selectedEmailSet: Set<string>;
  allFilteredSelected: boolean;
  sourceFilter: RecipientSourceFilter;
  searchQuery: string;
  manualEmails: string;
  invalidManualEmails: string[];
  loadingRecipients: boolean;
  onSourceFilterChange: (value: RecipientSourceFilter) => void;
  onSearchQueryChange: (value: string) => void;
  onManualEmailsChange: (value: string) => void;
  onToggleRecipient: (recipient: MarketingRecipient) => void;
  onToggleAllFiltered: () => void;
  onClearSelected: () => void;
  onAddManualRecipients: () => void;
};

export default function AudiencePanel({
  recipients,
  filteredRecipients,
  selectedRecipients,
  selectedEmailSet,
  allFilteredSelected,
  sourceFilter,
  searchQuery,
  manualEmails,
  invalidManualEmails,
  loadingRecipients,
  onSourceFilterChange,
  onSearchQueryChange,
  onManualEmailsChange,
  onToggleRecipient,
  onToggleAllFiltered,
  onClearSelected,
  onAddManualRecipients,
}: AudiencePanelProps) {
  return (
    <section className="rounded-lg bg-[#faf9f5] p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#222222]">
            <AdminIcon icon={UserMultiple02Icon} size={20} />
            Who should receive this campaign?
          </h2>
          <p className="text-sm text-[#5d6043]">
            {selectedRecipients.length} selected from {recipients.length} available. Add manual
            emails if needed, then continue.
          </p>
        </div>
        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2">
          <select
            value={sourceFilter}
            onChange={(event) =>
              onSourceFilterChange(event.target.value as RecipientSourceFilter)
            }
            className="w-full min-w-0 rounded-lg border border-[#b9aca2] px-3 py-2 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20"
          >
            <option value="all">Customers + subscribers</option>
            <option value="customers">Customers only</option>
            <option value="subscribers">Subscribers only</option>
          </select>
          <div className="relative min-w-0">
            <AdminIcon
              icon={Search01Icon}
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b9aca2]"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search recipients..."
              className="w-full min-w-0 rounded-lg border border-[#b9aca2] py-2 pl-9 pr-3 text-sm focus:border-[#5d6043] focus:outline-none focus:ring-2 focus:ring-[#5d6043]/20"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggleAllFiltered}
          disabled={filteredRecipients.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5d6043] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:bg-[#222222] disabled:opacity-50"
        >
          {allFilteredSelected ? (
            <AdminIcon icon={CheckmarkSquare02Icon} size={16} />
          ) : (
            <AdminIcon icon={SquareIcon} size={16} />
          )}
          {allFilteredSelected ? "Unselect visible" : "Select visible"}
        </button>
        <button
          type="button"
          onClick={onClearSelected}
          disabled={selectedRecipients.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-[#b9aca2] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#eeeae0] disabled:opacity-50"
        >
          <AdminIcon icon={Delete02Icon} size={16} />
          Clear selected
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-[#b9aca2]/60 bg-white p-4">
        <label className="mb-2 block text-sm font-semibold text-[#5d6043]">
          Add manual recipients
        </label>
        <textarea
          value={manualEmails}
          onChange={(event) => onManualEmailsChange(event.target.value)}
          rows={3}
          placeholder="name@example.com, second@example.com"
          className={`${field} resize-none`}
        />
        {invalidManualEmails.length > 0 && (
          <p className="mt-2 text-xs text-red-600">
            Invalid: {invalidManualEmails.join(", ")}
          </p>
        )}
        <button
          type="button"
          onClick={onAddManualRecipients}
          className="mt-3 rounded-lg border border-[#b9aca2] bg-[#faf9f5] px-4 py-2 text-sm font-semibold text-[#5d6043] hover:bg-[#eeeae0]"
        >
          Add emails to audience
        </button>
      </div>

      <div className="max-h-[min(560px,60vh)] overflow-y-auto rounded-lg border border-[#b9aca2]/60">
        {loadingRecipients ? (
          <div className="flex items-center justify-center gap-2 p-10 text-[#5d6043]">
            <AdminIcon icon={Loading03Icon} size={20} className="animate-spin" />
            Loading recipients...
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5d6043]">No recipients found.</div>
        ) : (
          filteredRecipients.map((recipient) => {
            const isSelected = selectedEmailSet.has(recipientKey(recipient));
            return (
              <button
                key={`${recipient.source}-${recipient.email}`}
                type="button"
                onClick={() => onToggleRecipient(recipient)}
                className="flex w-full items-center gap-3 border-b border-[#b9aca2]/40 px-4 py-3 text-left last:border-b-0 hover:bg-white"
              >
                {isSelected ? (
                  <AdminIcon
                    icon={CheckmarkSquare02Icon}
                    size={20}
                    className="text-[#5d6043]"
                  />
                ) : (
                  <AdminIcon icon={SquareIcon} size={20} className="text-[#b9aca2]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#222222]">
                    {recipient.name}
                  </p>
                  <p className="truncate text-xs text-[#5d6043]">{recipient.email}</p>
                </div>
                <span className="rounded-full bg-[#b9aca2]/50 px-2 py-1 text-xs capitalize text-[#5d6043]">
                  {recipient.source}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
