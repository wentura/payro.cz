/**
 * Registration API Route
 *
 * Handles user registration requests
 * Creates user account and sends verification email
 */

import { registerUser } from "@/app/lib/auth";
import { sendVerificationEmail } from "@/app/lib/email";
import { NextResponse } from "next/server";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, contact_email, password, password_confirm, company_id } =
      body;

    // Validate input
    if (!name || !contact_email || !password) {
      return NextResponse.json(
        { success: false, error: "Všechna povinná pole musí být vyplněna" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(contact_email)) {
      return NextResponse.json(
        { success: false, error: "Neplatný formát emailové adresy" },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (password !== password_confirm) {
      return NextResponse.json(
        { success: false, error: "Hesla se neshodují" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Heslo musí mít alespoň 8 znaků" },
        { status: 400 }
      );
    }

    // Attempt registration
    const result = await registerUser({
      name,
      contact_email,
      password,
      company_id: company_id || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Send verification email if token was created
    if (result.token) {
      const emailResult = await sendVerificationEmail(
        {
          id: result.user.id,
          name: result.user.name,
          contact_email: result.user.contact_email,
        },
        result.token
      );

      if (!emailResult.success) {
        // User was created but email failed
        // Log error but don't fail registration
        console.error("Failed to send verification email:", emailResult.error);
        // Continue - user can request resend later
      }
    }

    // Return success (no session created)
    return NextResponse.json({
      success: true,
      message: "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu.",
      user: {
        id: result.user.id,
        name: result.user.name,
        contact_email: result.user.contact_email,
      },
      emailSent: !!result.token,
      warning: result.warning || null,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
