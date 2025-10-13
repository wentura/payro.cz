/**
 * Test Database Connection
 * 
 * Diagnostic endpoint to check if database schema is set up correctly
 */

import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const results = {
    connection: false,
    tables: {},
    errors: [],
  };

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      results.errors.push({ table: "users", error: testError.message });
    } else {
      results.connection = true;
      results.tables.users = "✓ exists";
    }

    // Check other tables
    const tables = [
      "clients",
      "invoices",
      "invoice_items",
      "invoice_statuses",
      "payment_types",
      "due_terms",
      "units",
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);

        if (error) {
          results.tables[table] = `✗ ${error.message}`;
          results.errors.push({ table, error: error.message });
        } else {
          results.tables[table] = "✓ exists";
        }
      } catch (err) {
        results.tables[table] = `✗ ${err.message}`;
        results.errors.push({ table, error: err.message });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        ...results,
        errors: [...results.errors, { general: error.message }],
      },
      { status: 500 }
    );
  }
}

