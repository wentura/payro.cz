/**
 * Registration API Route
 *
 * Handles user registration requests
 * Creates user account and sends verification email
 */

import { registerUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { parseWithSchema } from "@/app/lib/api-validation";
import { sendVerificationEmail } from "@/app/lib/email";
import { getRequestIp, rateLimit } from "@/app/lib/rate-limit";
import { registerSchema } from "@/app/lib/validations";
import { NextResponse } from "next/server";

// Anti-bot checks happen before schema validation
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      contact_email,
      password,
      password_confirm,
      company_id,
      my_name, // Honeypot field
      math_answer, // Math question answer
      math_num1, // Math question number 1
      math_num2, // Math question number 2
    } = body;

    const ip = getRequestIp(request);
    const rate = await rateLimit({
      key: `auth:register:${ip}`,
      limit: 5,
      windowSeconds: 3600,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Příliš mnoho pokusů. Zkuste to později." },
        { status: 429 }
      );
    }

    // Anti-bot validation: Check honeypot field FIRST (before any DB operations)
    if (my_name && my_name.trim() !== "") {
      // Bot detected - fake positive response (no logging of PII)
      return NextResponse.json({
        success: true,
        message: "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu.",
        user: {
          id: null,
          name: name || "",
          contact_email: contact_email || "",
        },
        emailSent: false,
      });
    }

    // Anti-bot validation: Check math answer — wrong answer is an error (humans make mistakes)
    const userAnswer = parseInt(math_answer, 10);
    const correctAnswer = parseInt(math_num1, 10) + parseInt(math_num2, 10);
    if (
      !math_num1 ||
      !math_num2 ||
      isNaN(userAnswer) ||
      isNaN(correctAnswer) ||
      userAnswer !== correctAnswer
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Nesprávná odpověď na kontrolní otázku. Zkuste to znovu.",
        },
        { status: 400 }
      );
    }

    // Validate input
    const parsed = parseWithSchema(registerSchema, {
      name,
      contact_email,
      password,
      password_confirm,
      company_id,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    // Attempt registration
    const result = await registerUser({
      name: parsed.data.name,
      contact_email: parsed.data.contact_email,
      password: parsed.data.password,
      company_id: parsed.data.company_id || null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    await logAuditEvent({
      userId: result.user.id,
      action: "auth.register",
      entityType: "user",
      entityId: result.user.id,
      request,
    });

    // Send verification email if token was created
    let emailSent = false;
    if (result.token) {
      const emailResult = await sendVerificationEmail(
        {
          id: result.user.id,
          name: result.user.name,
          contact_email: result.user.contact_email,
        },
        result.token
      );

      if (!emailResult.success) {
        console.error("[Email] register verification failed");
        return NextResponse.json({
          success: true,
          message:
            "Účet byl vytvořen, ale aktivační e-mail se nepodařilo odeslat. Použijte „Znovu poslat aktivační email“.",
          user: {
            id: result.user.id,
            name: result.user.name,
            contact_email: result.user.contact_email,
          },
          emailSent: false,
          warning: "EMAIL_SEND_FAILED",
        });
      }
      emailSent = true;
    }

    return NextResponse.json({
      success: true,
      message:
        "Registrace proběhla úspěšně. Zkontrolujte svůj email pro aktivaci účtu.",
      user: {
        id: result.user.id,
        name: result.user.name,
        contact_email: result.user.contact_email,
      },
      emailSent,
      warning: result.warning || null,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
