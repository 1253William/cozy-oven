const CHECKOUT_RECOVERY_KEY = "cozyCheckoutResumeToken";

export const saveCheckoutResumeToken = (token?: string | null) => {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(CHECKOUT_RECOVERY_KEY, token);
};

export const getCheckoutResumeToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHECKOUT_RECOVERY_KEY);
};

export const clearCheckoutResumeToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHECKOUT_RECOVERY_KEY);
};
