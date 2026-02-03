import crypto from "crypto";
import { hashPassword } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";

function getEmptyAddress() {
  return {
    street: "",
    house_number: "",
    city: "",
    zip: "",
    country: "Česká republika",
  };
}

export async function getUserExportData(userId) {
  const { data: user } = await supabase
    .from("users")
    .select(
      "id, name, company_id, billing_details, contact_website, contact_phone, contact_email, bank_account, default_settings, last_login, created_at, activated_at, deactivated_at, deletion_requested_at, deleted_at"
    )
    .eq("id", userId)
    .single();

  const [
    { data: clients },
    { data: invoices },
    { data: passwordResetTokens },
    { data: emailVerificationTokens },
    { data: userSubscriptions },
    { data: invoiceUsage },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", userId),
    supabase.from("invoices").select("*").eq("user_id", userId),
    supabase.from("password_reset_tokens").select("*").eq("user_id", userId),
    supabase.from("email_verification_tokens").select("*").eq("user_id", userId),
    supabase.from("user_subscriptions").select("*").eq("user_id", userId),
    supabase.from("invoice_usage").select("*").eq("user_id", userId),
  ]);

  const invoiceIds = (invoices || []).map((invoice) => invoice.id);
  const subscriptionIds = (userSubscriptions || []).map(
    (subscription) => subscription.id
  );

  const [{ data: invoiceItems }, { data: subscriptionPayments }, { data: subscriptionStatusHistory }] =
    await Promise.all([
      invoiceIds.length
        ? supabase.from("invoice_items").select("*").in("invoice_id", invoiceIds)
        : Promise.resolve({ data: [] }),
      subscriptionIds.length
        ? supabase
            .from("subscription_payments")
            .select("*")
            .in("subscription_id", subscriptionIds)
        : Promise.resolve({ data: [] }),
      subscriptionIds.length
        ? supabase
            .from("subscription_status_history")
            .select("*")
            .in("subscription_id", subscriptionIds)
        : Promise.resolve({ data: [] }),
    ]);

  return {
    user: user || null,
    clients: clients || [],
    invoices: invoices || [],
    invoice_items: invoiceItems || [],
    password_reset_tokens: passwordResetTokens || [],
    email_verification_tokens: emailVerificationTokens || [],
    subscriptions: {
      user_subscriptions: userSubscriptions || [],
      invoice_usage: invoiceUsage || [],
      subscription_payments: subscriptionPayments || [],
      subscription_status_history: subscriptionStatusHistory || [],
    },
  };
}

export async function purgeUserData(userId) {
  const now = new Date().toISOString();
  const anonymizedEmail = `deleted+${userId}@example.invalid`;
  const randomPassword = crypto.randomUUID();
  const passwordHash = await hashPassword(randomPassword);

  await supabase.from("password_reset_tokens").delete().eq("user_id", userId);
  await supabase
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", userId);
  await supabase.from("user_subscriptions").delete().eq("user_id", userId);
  await supabase.from("invoice_usage").delete().eq("user_id", userId);

  await supabase
    .from("clients")
    .update({
      name: "Smazaný klient",
      company_id: null,
      vat_number: null,
      contact_email: null,
      contact_phone: null,
      note: null,
      address: getEmptyAddress(),
    })
    .eq("user_id", userId);

  await supabase
    .from("invoices")
    .update({ note: null })
    .eq("user_id", userId);

  await supabase
    .from("users")
    .update({
      name: "Smazaný účet",
      company_id: null,
      billing_details: getEmptyAddress(),
      contact_website: null,
      contact_phone: null,
      contact_email: anonymizedEmail,
      bank_account: null,
      password_hash: passwordHash,
      deactivated_at: now,
      deletion_requested_at: now,
      deleted_at: now,
    })
    .eq("id", userId);
}
