/**
 * Allow only same-origin relative paths for post-login redirects.
 * Blocks protocol-relative and absolute URLs (open redirect).
 */
export function getSafeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") {
    return fallback;
  }

  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }

  if (path.includes("://")) {
    return fallback;
  }

  return path;
}
