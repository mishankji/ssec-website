import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { isApprover } from "@/lib/roles";
import { getQuotationById } from "@/lib/quotations";
import { generateQuotationPdf } from "@/lib/quotation-pdf";

// Only the submitter or an approver can fetch a quotation's PDF, and only
// once it's Approved -- same shape as the ownership/status checks Form-6's
// own workflow enforces (findLatestSubmissionForUser scopes an employee to
// their own submission; approvers are gated via isApprover() everywhere
// else in this project). Form-6 itself has no server PDF route to mirror
// (its PDF is generated entirely client-side, submitter-only) -- this is a
// new route because Step 5 explicitly needs approver access too.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let quotation;
  try {
    quotation = await getQuotationById(supabase, id);
  } catch (err) {
    console.error("Failed to load quotation for PDF:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Couldn't load quotation: ${detail}` }, { status: 502 });
  }

  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  }

  const isOwner = quotation.created_by.trim().toLowerCase() === (user.email ?? "").trim().toLowerCase();
  if (!isOwner && !isApprover(user.email)) {
    return NextResponse.json({ error: "You don't have access to this quotation." }, { status: 403 });
  }
  if (quotation.status !== "approved") {
    return NextResponse.json({ error: "This quotation hasn't been approved yet." }, { status: 400 });
  }

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "brand", "logo.png"));
    const pdfBytes = await generateQuotationPdf(
      {
        quotationNumber: quotation.quotation_number,
        quotationDate: quotation.quotation_date,
        customerName: quotation.customer_name,
        customerContact: quotation.customer_contact,
        customerAddress: quotation.customer_address,
        rateOnly: quotation.rate_only,
        items: quotation.items,
        taxableAmount: quotation.taxable_amount,
        sgstAmount: quotation.sgst_amount,
        cgstAmount: quotation.cgst_amount,
        totalAmount: quotation.total_amount,
      },
      new Uint8Array(logoBytes)
    );

    const filename = `Quotation-${quotation.quotation_number.replace(/\//g, "-")}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Quotation PDF generation failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Couldn't generate the PDF: ${detail}` }, { status: 502 });
  }
}
