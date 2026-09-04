import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { listPendingQuotations } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";

// Approver-only: full details of every Pending quotation, oldest first,
// for the dashboard's "Pending Quotations" panel. Mirrors
// src/app/api/form6/pending/route.ts.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isApprover(user.email)) {
    return NextResponse.json({ error: "Only approvers can view pending quotations." }, { status: 403 });
  }

  try {
    const rows = await listPendingQuotations(supabase);
    return NextResponse.json({ quotations: rows.map(toClientQuotation) });
  } catch (err) {
    console.error("Failed to list pending quotations:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Couldn't load pending quotations: ${detail}` }, { status: 502 });
  }
}
