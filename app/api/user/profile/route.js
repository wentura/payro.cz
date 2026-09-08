/**
 * User Profile API Route
 *
 * Handles user profile GET and UPDATE
 */

import { ADMIN_EMAIL, getCurrentUser, normalizeEmail } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { parseWithSchema } from "@/app/lib/api-validation";
import { supabase } from "@/app/lib/supabase";
import { USER_PUBLIC_COLUMNS, sanitizeUser } from "@/app/lib/user-public";
import { profileUpdateSchema } from "@/app/lib/validations";
import { NextResponse } from "next/server";

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
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const parsed = parseWithSchema(profileUpdateSchema, await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

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
    } = parsed.data;

    const nextEmail = normalizeEmail(contact_email);
    const isCurrentAdmin = user.contact_email === ADMIN_EMAIL;

    if (nextEmail === ADMIN_EMAIL && !isCurrentAdmin) {
      return NextResponse.json(
        { success: false, error: "Tento email nelze použít" },
        { status: 400 }
      );
    }

    if (isCurrentAdmin && nextEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: "Administrátorský email nelze změnit" },
        { status: 400 }
      );
    }

    if (nextEmail !== user.contact_email) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("contact_email", nextEmail)
        .neq("id", user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email je již používán jiným uživatelem" },
          { status: 400 }
        );
      }
    }

    const billing_details = {
      street: street || "",
      house_number: house_number || "",
      city: city || "",
      zip: zip || "",
      country: country || "Česká republika",
    };

    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        company_id: company_id || null,
        contact_email: nextEmail,
        contact_phone: contact_phone || null,
        contact_website: contact_website || null,
        bank_account: bank_account || null,
        billing_details,
      })
      .eq("id", user.id)
      .select(USER_PUBLIC_COLUMNS)
      .single();

    if (error || !data) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci profilu" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "user.profile_updated",
      entityType: "user",
      entityId: user.id,
      request,
    });

    return NextResponse.json({
      success: true,
      data: sanitizeUser(data),
    });
  } catch (error) {
    console.error("Error in PUT /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
