/**
 * Email Verification Page
 *
 * Verifies token and creates session in this request (cookie must stick).
 */

import { createSession, verifyEmailToken } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ověření emailu",
  robots: {
    index: false,
    follow: false,
  },
};

async function activateFromToken(token) {
  const tokenResult = await verifyEmailToken(token);

  if (!tokenResult.success) {
    return { success: false, error: tokenResult.error };
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, contact_email, activated_at")
    .eq("id", tokenResult.userId)
    .single();

  if (userError || !user) {
    return { success: false, error: "Uživatel nenalezen" };
  }

  if (!user.activated_at) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ activated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error activating user:", updateError);
      return { success: false, error: "Chyba při aktivaci účtu" };
    }

    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", user.id);
  }

  await createSession(user.id, user.contact_email);

  await logAuditEvent({
    userId: user.id,
    action: "auth.email_verified",
    entityType: "user",
    entityId: user.id,
    metadata: { alreadyActivated: Boolean(user.activated_at) },
  });

  return { success: true };
}

export default async function VerifyEmailPage({ params }) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white py-16 px-4">
        <div className="max-w-md w-full border border-fktr-border rounded-lg p-8">
          <h1 className="text-lg font-medium text-fktr-fg mb-2">Neplatný odkaz</h1>
          <p className="text-sm text-fktr-muted mb-6">
            Chybí verifikační token v odkazu.
          </p>
          <Link
            href="/login"
            className="text-sm font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Přejít na přihlášení
          </Link>
        </div>
      </div>
    );
  }

  const result = await activateFromToken(token);

  if (result.success) {
    redirect("/dashboard?verified=true");
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-white py-16 px-4">
      <div className="max-w-md w-full border border-fktr-border rounded-lg p-8">
        <h1 className="text-lg font-medium text-fktr-fg mb-2">
          Aktivace se nezdařila
        </h1>
        <p className="text-sm text-fktr-muted mb-4">
          {result.error || "Nastala chyba při aktivaci účtu."}
        </p>
        <ul className="list-disc list-inside text-sm text-fktr-muted space-y-1 mb-6">
          <li>Odkaz již vypršel (platnost 4 hodiny)</li>
          <li>Odkaz byl již použit</li>
          <li>Neplatný nebo poškozený odkaz</li>
        </ul>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/resend-verification"
            className="font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Znovu poslat aktivační email
          </Link>
          <Link
            href="/login"
            className="font-medium text-fktr-accent hover:text-fktr-accent-hover"
          >
            Přejít na přihlášení
          </Link>
        </div>
      </div>
    </div>
  );
}
