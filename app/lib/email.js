/**
 * Email Service
 *
 * Handles sending emails via Resend
 * Supports verification emails and password reset emails
 */

import { Resend } from "resend";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("⚠️  RESEND_API_KEY is not set. Email functionality will not work.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
      from: "FKTR.cz <noreply@fktr.cz>", // TODO: Update with your verified domain
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
              <strong>Důležité:</strong> Tento odkaz je platný pouze 1 hodinu. Pokud odkaz vypršel, můžete požádat o nový aktivační email.
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

Důležité: Tento odkaz je platný pouze 1 hodinu. Pokud odkaz vypršel, můžete požádat o nový aktivační email.

Pokud jste se neregistrovali, můžete tento email ignorovat.

© 2025 FKTR.cz - Fakturační systém
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
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
    console.error("Error in sendVerificationEmail:", error);
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
      from: "FKTR.cz <noreply@fktr.cz>", // TODO: Update with your verified domain
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
              <strong>Důležité:</strong> Tento odkaz je platný pouze 1 hodinu. Pokud jste o obnovení hesla nepožádali, můžete tento email ignorovat.
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

Důležité: Tento odkaz je platný pouze 1 hodinu. Pokud jste o obnovení hesla nepožádali, můžete tento email ignorovat.

© 2025 FKTR.cz - Fakturační systém
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
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
    console.error("Error in sendPasswordResetEmail:", error);
    return {
      success: false,
      error: "Neočekávaná chyba při odesílání emailu",
    };
  }
}

