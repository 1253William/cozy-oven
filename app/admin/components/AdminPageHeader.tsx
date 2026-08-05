"use client";

import type { ReactNode } from "react";

export type AdminPageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-[#222222]">{title}</h1>
        {description != null && description !== "" ? (
          <div className="mt-1 text-[#5d6043]">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
