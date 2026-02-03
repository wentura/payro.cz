import { supabase } from "@/app/lib/supabase";

export function getRequestIp(request) {
  const forwardedFor = request?.headers?.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request?.headers?.get("x-real-ip") || "unknown";
}

export async function rateLimit({ key, limit, windowSeconds }) {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      key_name: key,
      max_limit: limit,
      window_seconds: windowSeconds,
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      return { allowed: true, remaining: null, resetAt: null };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return {
      allowed: result?.allowed ?? true,
      remaining: result?.remaining ?? null,
      resetAt: result?.reset_at ?? null,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: null, resetAt: null };
  }
}
