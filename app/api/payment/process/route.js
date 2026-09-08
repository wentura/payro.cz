/**
 * Payment Processing API
 *
 * Handles payment processing for subscription upgrades
 */

import { getCurrentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/payment/process
 * Process payment for subscription upgrade
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Online subscription payments are intentionally disabled.
    // Subscription activation is handled manually by admin endpoints.
    return NextResponse.json(
      {
        success: false,
        error:
          "Online platby předplatného jsou vypnuté. Platba je ověřována ručně administrátorem.",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment/process
 * Handle payment webhook (for real payment processors)
 */
export async function POST() {
  try {
    return NextResponse.json(
      {
        success: false,
        error:
          "Webhook pro online platby je vypnutý. Aktivace probíhá pouze přes admin endpointy.",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Intentionally left without webhook handlers: online payment integration is disabled.
