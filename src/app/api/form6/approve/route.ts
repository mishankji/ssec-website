import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { approveForm6 } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isApprover(user.email)) {
    return NextResponse.json({ error: "Only approvers can approve submissions." }, { status: 403 });
  }

  let body: { submissionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.submissionId?.trim()) {
    return NextResponse.json({ error: "Missing submission ID." }, { status: 400 });
  }

  try {
    const updated = await approveForm6(body.submissionId.trim());
    return NextResponse.json({ submission: toClientSubmission(updated) });
  } catch (err) {
    console.error("Form-6 approval failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Something went wrong: ${detail}` }, { status: 502 });
  }
}
