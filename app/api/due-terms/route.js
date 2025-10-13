/**
 * Due Terms API Route
 *
 * Returns available payment due terms
 */

import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("due_terms")
      .select("*")
      .order("days_count", { ascending: true });

    if (error) {
      console.error("Error fetching due terms:", error);
      return NextResponse.json(
        { success: false, error: "Chyba při načítání splatností" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in GET /api/due-terms:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
