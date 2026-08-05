"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

type AdminIconProps = {
  icon: IconSvgElement;
  size?: number;
  className?: string;
};

export default function AdminIcon({
  icon,
  size = 20,
  className,
}: AdminIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={1.5}
      color="currentColor"
      className={className}
    />
  );
}
