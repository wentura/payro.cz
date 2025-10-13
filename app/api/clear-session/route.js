/**
 * Clear Session API Route
 *
 * Clears invalid session cookies
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("payro_session");

    return NextResponse.json({ success: true, message: "Cookie cleared" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
