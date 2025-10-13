/**
 * Payment Types API Route
 *
 * Returns available payment types
 */

import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("payment_types")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching payment types:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání typů plateb" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in GET /api/payment-types:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
