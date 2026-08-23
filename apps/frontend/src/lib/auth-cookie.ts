export const SELLER_SESSION_COOKIE = "hustlr_session";

/**
 * Sets the seller session cookie on the client so that the Next.js Edge proxy
 * and server-side route guards can detect the active session.
 */
export function setAuthCookie(token: string): void {
  if (typeof document === "undefined" || !token) return;
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `${SELLER_SESSION_COOKIE}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clears the seller session cookie on the client.
 */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SELLER_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Reads the session cookie value on the client if present.
 */
export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SELLER_SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
