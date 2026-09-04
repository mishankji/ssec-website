import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { approveQuotation } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";

// Mirrors src/app/api/form6/approve/route.ts: same auth pattern, same
// approver gate. No PDF generation or Sheets logging here -- just flips
// status and stamps approver info (per the brief for this step).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isApprover(user.email)) {
    return NextResponse.json({ error: "Only approvers can approve quotations." }, { status: 403 });
  }

  let body: { quotationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.quotationId?.trim()) {
    return NextResponse.json({ error: "Missing quotation ID." }, { status: 400 });
  }

  try {
    const updated = await approveQuotation(supabase, body.quotationId.trim(), user.email ?? "unknown");
    return NextResponse.json({ quotation: toClientQuotation(updated) });
  } catch (err) {
    console.error("Quotation approval failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Something went wrong: ${detail}` }, { status: 502 });
  }
}
