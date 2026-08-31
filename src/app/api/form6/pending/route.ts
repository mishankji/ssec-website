import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { listPendingSubmissions } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";

// Approver-only: full details of every Pending submission, oldest first,
// for the dashboard's "Pending Approvals" panel.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isApprover(user.email)) {
    return NextResponse.json({ error: "Only approvers can view pending submissions." }, { status: 403 });
  }

  try {
    const records = await listPendingSubmissions();
    return NextResponse.json({ submissions: records.map(toClientSubmission) });
  } catch (err) {
    console.error("Failed to list pending Form-6 submissions:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Couldn't load pending submissions from Google Sheets: ${detail}` },
      { status: 502 }
    );
  }
}
