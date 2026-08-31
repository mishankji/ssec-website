import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findLatestSubmissionForUser } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";

// Returns the signed-in employee's single most recent submission (or null
// if they've never submitted one), for the "New Form-6 Manifest" click
// handler to refresh against after starting a fresh one. The initial page
// load gets this server-side instead (see dashboard/page.tsx) so there's
// no client-side fetch-on-mount effect.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const record = await findLatestSubmissionForUser(user.email ?? "");
    return NextResponse.json({ submission: record ? toClientSubmission(record) : null });
  } catch (err) {
    console.error("Failed to read the employee's latest Form-6 submission:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Couldn't load your submission status from Google Sheets: ${detail}` },
      { status: 502 }
    );
  }
}
