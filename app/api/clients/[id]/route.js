/**
 * Single Client API Route
 *
 * Handles GET, PUT, DELETE for a single client
 */

import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET single client
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const { id } = await params;

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Klient nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in GET /api/clients/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update client
 */
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const { id } = await params;

    const body = await request.json();
    const {
      name,
      company_id,
      vat_number,
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

    // Update client
    const { data, error } = await supabase
      .from("clients")
      .update({
        name,
        company_id: company_id || null,
        vat_number: vat_number || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        note: note || null,
        address,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating client:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při aktualizaci klienta" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "client.updated",
      entityType: "client",
      entityId: data.id,
      request,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in PUT /api/clients/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete client
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Check if client has invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id")
      .eq("client_id", id)
      .limit(1);

    if (invoices && invoices.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nelze smazat klienta s existujícími fakturami",
        },
        { status: 400 }
      );
    }

    // Delete client
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting client:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při mazání klienta" },
        { status: 500 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      action: "client.deleted",
      entityType: "client",
      entityId: id,
      request,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/clients/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
