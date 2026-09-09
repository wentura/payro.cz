/**
 * Email Service
 *
 * Handles sending emails via Resend
 * Supports verification, password reset, and invoice emails
 */

import { Resend } from "resend";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("⚠️  RESEND_API_KEY is not set. Email functionality will not work.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_ADDRESS = "FKTR.cz <noreply@fktr.cz>";

export function isEmailConfigured() {
  return Boolean(resend);
}

/**
 * Send email verification email with magic link
 * @param {Object} user - User object with id, name, contact_email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Result object with success/error
 */
export async function sendVerificationEmail(user, token) {
  try {
    if (!resend) {
      console.error("Resend client not initialized. RESEND_API_KEY is missing.");
      return {
        success: false,
        error: "Email služba není nakonfigurována. Kontaktujte administrátora.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email/${token}`;

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.contact_email,
      subject: "Potvrzení registrace - FKTR.cz",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-top: 0;">Vítejte v FKTR.cz!</h1>
            <p>Dobrý den ${user.name},</p>
            <p>Děkujeme za registraci v FKTR.cz. Pro dokončení registrace a aktivaci vašeho účtu prosím klikněte na odkaz níže:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Aktivovat účet</a>
            </div>
            <p>Nebo zkopírujte a vložte tento odkaz do prohlížeče:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationLink}</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <strong>Důležité:</strong> Tento odkaz je platný pouze 4 hodiny. Pokud odkaz vypršel, můžete požádat o nový aktivační email.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Pokud jste se neregistrovali, můžete tento email ignorovat.
            </p>
          </div>
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>© 2025 FKTR.cz - Fakturační systém</p>
          </div>
        </body>
        </html>
      `,
      text: `
Vítejte v FKTR.cz!

Dobrý den ${user.name},

Děkujeme za registraci v FKTR.cz. Pro dokončení registrace a aktivaci vašeho účtu prosím klikněte na odkaz:

${verificationLink}

Důležité: Tento odkaz je platný pouze 4 hodiny. Pokud odkaz vypršel, můžete požádat o nový aktivační email.

Pokud jste se neregistrovali, můžete tento email ignorovat.

© 2025 FKTR.cz - Fakturační systém
      `,
    });

    if (error) {
      console.error("[Email] verification failed");
      return {
        success: false,
        error: error.message || "Chyba při odesílání emailu",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("[Email] verification failed (exception)");
    return {
      success: false,
      error: "Neočekávaná chyba při odesílání emailu",
    };
  }
}

/**
 * Send password reset email with magic link
 * @param {Object} user - User object with id, name, contact_email
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Result object with success/error
 */
export async function sendPasswordResetEmail(user, token) {
  try {
    if (!resend) {
      console.error("Resend client not initialized. RESEND_API_KEY is missing.");
      return {
        success: false,
        error: "Email služba není nakonfigurována. Kontaktujte administrátora.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${token}`;

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.contact_email,
      subject: "Obnovení hesla - FKTR.cz",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-top: 0;">Obnovení hesla</h1>
            <p>Dobrý den ${user.name},</p>
            <p>Obdrželi jsme žádost o obnovení hesla pro váš účet v FKTR.cz. Pro nastavení nového hesla klikněte na odkaz níže:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Obnovit heslo</a>
            </div>
            <p>Nebo zkopírujte a vložte tento odkaz do prohlížeče:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <strong>Důležité:</strong> Tento odkaz je platný pouze 4 hodiny. Pokud jste o obnovení hesla nepožádali, můžete tento email ignorovat.
            </p>
          </div>
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>© 2025 FKTR.cz - Fakturační systém</p>
          </div>
        </body>
        </html>
      `,
      text: `
Obnovení hesla

Dobrý den ${user.name},

Obdrželi jsme žádost o obnovení hesla pro váš účet v FKTR.cz. Pro nastavení nového hesla klikněte na odkaz:

${resetLink}

Důležité: Tento odkaz je platný pouze 4 hodiny. Pokud jste o obnovení hesla nepožádali, můžete tento email ignorovat.

© 2025 FKTR.cz - Fakturační systém
      `,
    });

    if (error) {
      console.error("[Resend] Password reset email failed");
      return {
        success: false,
        error: error.message || "Chyba při odesílání emailu",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("[Resend] sendPasswordResetEmail exception");
    return {
      success: false,
      error: "Neočekávaná chyba při odesílání emailu",
    };
  }
}

/**
 * Send invoice email with PDF attachment
 * @param {Object} options
 * @param {string} options.to
 * @param {string|null} [options.cc]
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} options.text
 * @param {Buffer} options.pdfBuffer
 * @param {string} options.filename
 * @returns {Promise<Object>}
 */
export async function sendInvoiceEmail({
  to,
  cc = null,
  subject,
  html,
  text,
  pdfBuffer,
  filename,
}) {
  try {
    if (!resend) {
      console.error("Resend client not initialized. RESEND_API_KEY is missing.");
      return {
        success: false,
        error: "Email služba není nakonfigurována. Kontaktujte administrátora.",
        status: 503,
      };
    }

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      return {
        success: false,
        error: "PDF příloha chybí",
        status: 500,
      };
    }

    const payload = {
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    };

    if (cc) {
      payload.cc = cc;
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("[Email] invoice send failed");
      return {
        success: false,
        error: error.message || "Chyba při odesílání emailu",
        status: 502,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("[Email] invoice send exception");
    return {
      success: false,
      error: "Neočekávaná chyba při odesílání emailu",
      status: 500,
    };
  }
}


function subscriptionEmailShell({ title, greeting, bodyHtml, bodyText }) {
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fafafa; padding: 24px; border-radius: 8px; border: 1px solid #e7e5e4;">
          <h1 style="color: #0d9488; margin-top: 0; font-size: 22px;">${title}</h1>
          <p>${greeting}</p>
          ${bodyHtml}
        </div>
        <div style="text-align: center; color: #78716c; font-size: 12px; margin-top: 24px;">
          <p>© ${new Date().getFullYear()} FKTR.cz</p>
        </div>
      </body>
      </html>
    `,
    text: bodyText,
  };
}

async function sendSimpleEmail({ to, subject, title, greeting, bodyHtml, bodyText }) {
  try {
    if (!resend) {
      return { success: false, error: "Email služba není nakonfigurována." };
    }
    const content = subscriptionEmailShell({ title, greeting, bodyHtml, bodyText });
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html: content.html,
      text: content.text,
    });
    if (error) {
      console.error("[Email] subscription mail failed:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[Email] subscription mail exception");
    return { success: false, error: "Neočekávaná chyba při odesílání emailu" };
  }
}

/**
 * Notify user that pending subscription was activated
 */
export async function sendSubscriptionActivatedEmail(user, { planName, billingCycle, periodEnd }) {
  const cycleLabel = billingCycle === "yearly" ? "roční" : "měsíční";
  const periodLabel = periodEnd
    ? new Date(periodEnd).toLocaleDateString("cs-CZ")
    : "—";
  return sendSimpleEmail({
    to: user.contact_email,
    subject: "Předplatné aktivováno - FKTR.cz",
    title: "Předplatné aktivováno",
    greeting: `Dobrý den ${user.name || ""},`,
    bodyHtml: `
      <p>Vaše předplatné <strong>${planName}</strong> (${cycleLabel}) je aktivní.</p>
      <p>Období platí do: <strong>${periodLabel}</strong>.</p>
      <p>Děkujeme za podporu FKTR.cz.</p>
    `,
    bodyText: `Dobrý den ${user.name || ""},\n\nVaše předplatné ${planName} (${cycleLabel}) je aktivní.\nObdobí platí do: ${periodLabel}.\n\nDěkujeme za podporu FKTR.cz.`,
  });
}

/**
 * Notify user about plan change by admin
 */
export async function sendSubscriptionPlanChangedEmail(
  user,
  { oldPlanName, newPlanName, billingCycle }
) {
  const cycleLabel = billingCycle === "yearly" ? "roční" : "měsíční";
  return sendSimpleEmail({
    to: user.contact_email,
    subject: "Změna plánu - FKTR.cz",
    title: "Změna plánu",
    greeting: `Dobrý den ${user.name || ""},`,
    bodyHtml: `
      <p>Administrátor změnil váš plán z <strong>${oldPlanName || "—"}</strong> na <strong>${newPlanName}</strong> (${cycleLabel}).</p>
      <p>Změna je platná okamžitě.</p>
    `,
    bodyText: `Dobrý den ${user.name || ""},\n\nAdministrátor změnil váš plán z ${oldPlanName || "—"} na ${newPlanName} (${cycleLabel}).\nZměna je platná okamžitě.`,
  });
}

/**
 * Notify user subscription canceled / moved to Free
 */
export async function sendSubscriptionCanceledEmail(user, { previousPlanName }) {
  return sendSimpleEmail({
    to: user.contact_email,
    subject: "Předplatné zrušeno - FKTR.cz",
    title: "Předplatné zrušeno",
    greeting: `Dobrý den ${user.name || ""},`,
    bodyHtml: `
      <p>Vaše předplatné${previousPlanName ? ` <strong>${previousPlanName}</strong>` : ""} bylo zrušeno.</p>
      <p>Účet nyní běží na plánu <strong>Free</strong> (4 faktury měsíčně).</p>
    `,
    bodyText: `Dobrý den ${user.name || ""},\n\nVaše předplatné${previousPlanName ? ` ${previousPlanName}` : ""} bylo zrušeno.\nÚčet nyní běží na plánu Free (4 faktury měsíčně).`,
  });
}
