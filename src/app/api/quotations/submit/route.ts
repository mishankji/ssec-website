import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateQuotationBody, type QuotationSubmitBodyInput } from "@/lib/quotation-validation";
import { submitQuotation } from "@/lib/quotations";

// Mirrors src/app/api/form6/submit/route.ts's shape: auth check, parse,
// validate, call the lib function, respond. The one addition is the
// duplicate-number soft-warning (409 + { duplicate: true }) -- Form-6 has
// nothing equivalent since its SR No. isn't assigned until approval.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: QuotationSubmitBodyInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validationError = validateQuotationBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await submitQuotation(supabase, {
      quotationNumberSuffix: body.quotationNumberSuffix!.trim(),
      customerName: body.customerName!.trim(),
      customerContact: (body.customerContact ?? "").trim(),
      customerAddress: (body.customerAddress ?? "").trim(),
      rateOnly: Boolean(body.rateOnly),
      items: body.items!,
      createdBy: user.email ?? "unknown",
      force: Boolean(body.force),
    });

    if ("duplicate" in result) {
      return NextResponse.json({ duplicate: true }, { status: 409 });
    }
    return NextResponse.json({ id: result.id });
  } catch (err) {
    console.error("Quotation submission failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Something went wrong saving the quotation: ${detail}` },
      { status: 502 }
    );
  }
}
