import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateForm6 } from "@/lib/google-sheets";
import { validateForm6Body, shapeForm6Submission, type SubmitBodyInput } from "@/lib/form6-validation";
import { toClientSubmission } from "@/lib/form6-client";

// Handles both cases the employee-facing form needs: editing a Rejected
// submission (flips it back to Pending -- see updateForm6 in
// google-sheets.ts) and editing an already-Approved one (stays Approved,
// no re-approval). Same request shape as /api/form6/submit, plus the
// submissionId of the row being edited.
interface UpdateBody extends SubmitBodyInput {
  submissionId?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.submissionId?.trim()) {
    return NextResponse.json({ error: "Missing submission ID." }, { status: 400 });
  }

  const validationError = validateForm6Body(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const updated = await updateForm6(
      body.submissionId.trim(),
      user.email ?? "unknown",
      shapeForm6Submission(body)
    );
    return NextResponse.json({ submission: toClientSubmission(updated) });
  } catch (err) {
    console.error("Form-6 update failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Something went wrong: ${detail}` }, { status: 502 });
  }
}
