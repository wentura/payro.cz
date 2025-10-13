/**
 * Units API Route
 *
 * Returns available measurement units
 */

import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching units:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání jednotek" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in GET /api/units:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
