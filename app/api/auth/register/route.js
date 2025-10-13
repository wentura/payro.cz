/**
 * Registration API Route
 *
 * Handles user registration requests
 */

import { registerUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

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

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        contact_email: result.user.contact_email,
      },
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
