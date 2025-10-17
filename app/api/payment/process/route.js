/**
 * Payment Processing API
 *
 * Handles payment processing for subscription upgrades
 */

import { getCurrentUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET /api/payment/process
 * Process payment for subscription upgrade
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscription_id");
    const amount = searchParams.get("amount");

    if (!subscriptionId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans!inner(*)
      `
      )
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    // In a real implementation, you would:
    // 1. Create a payment session with your payment processor
    // 2. Handle payment methods (cards, bank transfer, etc.)
    // 3. Process the payment
    // 4. Handle success/failure scenarios

    // For now, we'll simulate a successful payment
    // TODO: Replace with actual payment processing (Stripe, Gopay, etc.)

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update subscription status to active
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to activate subscription" },
        { status: 500 }
      );
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from("subscription_payments")
      .insert({
        subscription_id: subscriptionId,
        amount: parseFloat(amount),
        currency: "CZK",
        status: "completed",
        payment_method: "card", // In real implementation, get from payment processor
        transaction_id: `txn_${Date.now()}`, // In real implementation, get from payment processor
        processed_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Don't fail the request if payment record creation fails
    }

    // Redirect to success page with payment details
    const successUrl = `/payment/success?plan_name=${subscription.subscription_plans.name}&billing_cycle=${subscription.billing_cycle}&amount=${amount}`;

    return NextResponse.redirect(successUrl);
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
export async function POST(request) {
  try {
    // This would handle webhooks from payment processors
    // like Stripe, PayPal, or Czech payment gateways

    const body = await request.json();

    // Verify webhook signature (important for security)
    // const signature = request.headers.get('stripe-signature');
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Handle different webhook events
    switch (body.type) {
      case "payment.succeeded":
        await handlePaymentSuccess(body.data);
        break;
      case "payment.failed":
        await handlePaymentFailure(body.data);
        break;
      default:
        console.log("Unhandled webhook event:", body.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment webhook
 */
async function handlePaymentSuccess(paymentData) {
  try {
    // Update subscription status to active
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentData.subscription_id);

    if (error) {
      console.error("Error activating subscription:", error);
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

/**
 * Handle failed payment webhook
 */
async function handlePaymentFailure(paymentData) {
  try {
    // Update subscription status to failed
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "payment_failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentData.subscription_id);

    if (error) {
      console.error("Error updating subscription status:", error);
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
