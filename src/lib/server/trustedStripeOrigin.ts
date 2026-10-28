// Stripe return URLs must only come from trusted server configuration.
// Never construct redirects from request Origin/Host headers.
export function trustedStripeOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (!configured) {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3000";
    }
    throw new Error("STRIPE_TRUSTED_ORIGIN_NOT_CONFIGURED");
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("STRIPE_TRUSTED_ORIGIN_INVALID");
  }

  if (
    parsed.username || parsed.password ||
    parsed.search || parsed.hash ||
    parsed.pathname !== "/"
  ) {
    throw new Error("STRIPE_TRUSTED_ORIGIN_INVALID");
  }

  const host = parsed.hostname.toLowerCase();
  const isLocal = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  const permitted = parsed.protocol === "https:" ||
    (process.env.NODE_ENV !== "production" && isLocal && parsed.protocol === "http:");

  if (!permitted) {
    throw new Error("STRIPE_TRUSTED_ORIGIN_INSECURE");
  }

  return parsed.origin;
}
