import { getCurrentUser } from "@/app/lib/auth";
import { logAuditEvent } from "@/app/lib/audit";
import { getUserExportData } from "@/app/lib/gdpr";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nepřihlášen" },
        { status: 401 }
      );
    }

    const data = await getUserExportData(user.id);
    const generatedAt = new Date().toISOString();
    const filename = `gdpr-export-${user.id}-${generatedAt.slice(0, 10)}.json`;

    await logAuditEvent({
      userId: user.id,
      action: "gdpr.export",
      entityType: "user",
      entityId: user.id,
      request,
    });

    return new NextResponse(
      JSON.stringify({ generated_at: generatedAt, data }, null, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/user/gdpr/export:", error);
    return NextResponse.json(
      { success: false, error: "Neočekávaná chyba serveru" },
      { status: 500 }
    );
  }
}
