import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import {
  fetchGoogleSheetCsv,
  getAccountGoogleAccessToken,
  listUserGoogleSheets,
} from "@/lib/gdrive/sheets";
import { parseContactCsv } from "@/lib/contacts/parse-contact-csv";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/google-sheets
 * List the user's Google Spreadsheets from their connected Google Drive
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const accessToken = await getAccountGoogleAccessToken(supabase, accountId);

    if (!accessToken) {
      return NextResponse.json({
        connected: false,
        sheets: [],
        message: "Google Drive not connected. Please connect Google Drive in Settings -> Integrations.",
      });
    }

    const sheets = await listUserGoogleSheets(accessToken);
    return NextResponse.json({
      connected: true,
      sheets,
    });
  } catch (err) {
    console.error("[google-sheets GET] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list Google Sheets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/google-sheets
 * Fetch and stream a Google Sheet by URL or ID into memory
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId } = await getCurrentAccount();
    const body = await request.json().catch(() => ({}));
    const sheetUrlOrId = typeof body.sheetUrlOrId === "string" ? body.sheetUrlOrId.trim() : "";

    if (!sheetUrlOrId) {
      return NextResponse.json({ error: "Please provide a Google Sheet link or ID." }, { status: 400 });
    }

    // Try getting user's Google Drive OAuth token for private sheets
    const accessToken = await getAccountGoogleAccessToken(supabase, accountId);

    const csvText = await fetchGoogleSheetCsv({
      sheetUrlOrId,
      accessToken,
    });

    // Parse the live CSV content in-memory
    const { rows, hasPhoneColumn, hasTagsColumn, hasCompanyColumn } = parseContactCsv(csvText);

    return NextResponse.json({
      success: true,
      csvText,
      totalRows: rows.length,
      preview: rows.slice(0, 5),
      hasPhoneColumn,
      hasTagsColumn,
      hasCompanyColumn,
    });
  } catch (err) {
    console.error("[google-sheets POST] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Google Sheet." },
      { status: 500 }
    );
  }
}
