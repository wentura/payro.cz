import { supabase } from "@/app/lib/supabase";

export async function logAuditEvent({
  userId,
  action,
  entityType = null,
  entityId = null,
  metadata = null,
  request = null,
}) {
  if (!userId || !action) {
    return;
  }

  const ipAddress =
    request?.headers?.get("x-forwarded-for") ||
    request?.headers?.get("x-real-ip") ||
    null;
  const userAgent = request?.headers?.get("user-agent") || null;

  try {
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("Audit log insert failed:", error);
  }
}
