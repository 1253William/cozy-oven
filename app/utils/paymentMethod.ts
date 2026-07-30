export const formatPaymentMethod = (method?: string): string => {
  if (!method) return "Unknown";

  return method
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
