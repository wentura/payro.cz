/**
 * Clients API Route
 *
 * Handles CRUD operations for clients
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET all clients for current user
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

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání klientů" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in GET /api/clients:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new client
 */
export async function POST(request) {
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
      note,
      street,
      house_number,
      city,
      zip,
      country,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Název je povinný" },
        { status: 400 }
      );
    }

    // Create address object
    const address = {
      street: street || "",
      house_number: house_number || "",
      city: city || "",
      zip: zip || "",
      country: country || "Česká republika",
    };

    // Insert client
    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name,
        company_id: company_id || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        note: note || null,
        address,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při vytváření klienta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in POST /api/clients:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
