import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "cozy_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60; // 1 hour — matches backend JWT

export function getAuthCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE_NAME)?.value;
}

export function getBackendApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cozy-oven-bakery-backend-t8x2.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");
}

export function getJwtSecret(): string {
  const secret =
    process.env.AUTH_JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || "";
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET (or ACCESS_TOKEN_SECRET) is not configured");
  }
  return secret;
}
