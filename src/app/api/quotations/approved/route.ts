import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { listApprovedQuotations } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";

// Approver-only: a page of approved quotations, newest first, for the
// "Approved Quotations" download panel -- see listApprovedQuotations() in
// quotations.ts for the search/pagination shape this passes through.
//
// `search` (quotation number or customer name, case-insensitive/partial)
// and `offset` (how many rows to skip) are both optional query params;
// omitting both reproduces the original "25 most recent, no filter"
// behavior. `limit` isn't exposed here -- the panel always uses the
// library's default page size (25).
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isApprover(user.email)) {
    return NextResponse.json({ error: "Only approvers can view approved quotations." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const offsetParam = searchParams.get("offset");
  const parsedOffset = offsetParam ? parseInt(offsetParam, 10) : 0;
  const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;

  try {
    const { quotations: rows, hasMore } = await listApprovedQuotations(supabase, { search, offset });
    return NextResponse.json({ quotations: rows.map(toClientQuotation), hasMore });
  } catch (err) {
    console.error("Failed to list approved quotations:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Couldn't load approved quotations: ${detail}` }, { status: 502 });
  }
}
