/**
 * Shared request-body validation for the Quotation submit API route
 * (src/app/api/quotations/submit/route.ts) -- kept separate from the
 * database code (src/lib/quotations.ts), same split as Form-6's
 * form6-validation.ts / google-sheets.ts.
 *
 * Also imported directly by quotation-generator.tsx to run the identical
 * check client-side before ever calling the API -- one source of truth
 * for "is this quotation valid", so the two can't drift out of sync.
 */

import type { QuotationItemInput } from "@/lib/quotations";

export interface QuotationSubmitBodyInput {
  quotationNumberSuffix?: string;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  rateOnly?: boolean;
  items?: QuotationItemInput[];
  force?: boolean;
}

function parseNum(value: string | undefined): number {
  const n = parseFloat((value ?? "").replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Returns a user-facing error message if the body is invalid, or null if
 * it's well-formed.
 *
 * The items check is deliberately a single combined condition, not two
 * separate "some item has a description+rate" / "some item has a
 * quantity" checks: at least one item needs a description AND a rate > 0
 * AND (unless rate_only) a quantity > 0, all on that same row.
 */
export function validateQuotationBody(body: QuotationSubmitBodyInput): string | null {
  if (!body.quotationNumberSuffix?.trim()) {
    return "Quotation number is required.";
  }
  if (!body.customerName?.trim()) {
    return "Customer / company name is required.";
  }
  if (!body.items || body.items.length === 0) {
    return "At least one item is required.";
  }

  const rateOnly = Boolean(body.rateOnly);
  const hasValidItem = body.items.some((item) => {
    if (!item.description?.trim() || parseNum(item.rate) <= 0) return false;
    if (!rateOnly && parseNum(item.quantity) <= 0) return false;
    return true;
  });

  if (!hasValidItem) {
    return rateOnly
      ? "At least one item needs a description and a rate greater than 0."
      : "At least one item needs a description, a rate greater than 0, and a quantity greater than 0.";
  }

  return null;
}
