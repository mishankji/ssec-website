import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateQuotationBody, type QuotationSubmitBodyInput } from "@/lib/quotation-validation";
import { getQuotationById, resubmitQuotation } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";

// Mirrors src/app/api/quotations/submit/route.ts's shape (auth, parse,
// validate, call the lib function, respond), but for correcting and
// resubmitting a Rejected quotation instead of creating a new one --
// same role /api/form6/update/route.ts plays for Form-6's resubmit flow.
//
// The quotation number isn't part of the request body here (it doesn't
// change on resubmit -- see resubmitQuotation's doc comment in
// quotations.ts), so validateQuotationBody is given the existing
// quotation's number just to satisfy its "is a number present" check;
// it's never written back.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: Omit<QuotationSubmitBodyInput, "quotationNumberSuffix" | "force">;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let existing;
  try {
    existing = await getQuotationById(supabase, id);
  } catch (err) {
    console.error("Failed to load quotation for resubmit:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Couldn't load quotation: ${detail}` }, { status: 502 });
  }

  if (!existing) {
    return NextResponse.json({ error: "That quotation no longer exists." }, { status: 404 });
  }

  const isOwner = existing.created_by.trim().toLowerCase() === (user.email ?? "").trim().toLowerCase();
  if (!isOwner) {
    return NextResponse.json({ error: "You can only resubmit your own quotation." }, { status: 403 });
  }
  if (existing.status !== "rejected") {
    return NextResponse.json({ error: "Only a rejected quotation can be resubmitted." }, { status: 400 });
  }

  const validationError = validateQuotationBody({
    quotationNumberSuffix: existing.quotation_number,
    customerName: body.customerName,
    rateOnly: body.rateOnly,
    items: body.items,
  });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const updated = await resubmitQuotation(supabase, id, user.email ?? "unknown", {
      customerName: body.customerName!.trim(),
      customerContact: (body.customerContact ?? "").trim(),
      customerAddress: (body.customerAddress ?? "").trim(),
      rateOnly: Boolean(body.rateOnly),
      items: body.items!,
    });
    return NextResponse.json({ quotation: toClientQuotation(updated) });
  } catch (err) {
    console.error("Quotation resubmit failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Something went wrong resubmitting the quotation: ${detail}` },
      { status: 502 }
    );
  }
}
