/**
 * User columns that are safe to return to the browser.
 * Never include password_hash.
 */
export const USER_PUBLIC_COLUMNS =
  "id, name, company_id, contact_email, contact_phone, contact_website, bank_account, billing_details, default_settings, created_at, activated_at, deactivated_at, deleted_at";

export function sanitizeUser(user) {
  if (!user || typeof user !== "object") {
    return user;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}
