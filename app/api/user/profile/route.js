/**
 * User Profile API Route
 *
 * Handles user profile GET and UPDATE
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET user profile
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update user profile
 */
export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      company_id,
      contact_email,
      contact_phone,
      contact_website,
      bank_account,
      street,
      house_number,
      city,
      zip,
      country,
    } = body;

    // Validate required fields
    if (!name || !contact_email) {
      return NextResponse.json(
        { success: false, error: "Jméno a email jsou povinné" },
        { status: 400 }
      );
    }

    // Check if email is already used by another user
    if (contact_email !== user.contact_email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("contact_email", contact_email)
        .neq("id", user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email je již používán jiným uživatelem" },
          { status: 400 }
        );
      }
    }

    // Create billing details object
    const billing_details = {
      street: street || "",
      house_number: house_number || "",
      city: city || "",
      zip: zip || "",
      country: country || "Česká republika",
    };

    // Update user
    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        company_id: company_id || null,
        contact_email,
        contact_phone: contact_phone || null,
        contact_website: contact_website || null,
        bank_account: bank_account || null,
        billing_details,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci profilu" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
