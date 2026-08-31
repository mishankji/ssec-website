import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitForm6 } from "@/lib/google-sheets";
import { validateForm6Body, shapeForm6Submission, type SubmitBodyInput } from "@/lib/form6-validation";
import { notifyApproversOfNewSubmission } from "@/lib/notify-approvers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: SubmitBodyInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validationError = validateForm6Body(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const { submissionId } = await submitForm6({
      ...shapeForm6Submission(body),
      submittedBy: user.email ?? "unknown",
    });

    // Best-effort -- the submission already saved successfully, so a
    // notification failure shouldn't turn into an error the employee sees.
    notifyApproversOfNewSubmission({
      senderName: body.senderName!.trim(),
      manifestDocNo: body.manifestDocNo!.trim(),
      submittedBy: user.email ?? "unknown",
    }).catch((err) => console.error("Approver notification failed:", err));

    return NextResponse.json({ submissionId });
  } catch (err) {
    console.error("Form-6 submission failed:", err);
    // TEMP: surfacing the real error message to the client while we debug
    // the first live run (GOOGLE_SHEETS_FORM6_ID / tab names / OAuth scope).
    // Dial this back to a generic message once submissions are working
    // reliably -- an internal error string isn't something end users should
    // normally see, even on an employee-only page.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Something went wrong saving to Google Sheets: ${detail}` },
      { status: 502 }
    );
  }
}
