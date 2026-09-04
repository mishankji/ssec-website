/**
 * Data access for the `quotations` table (see
 * supabase/migrations/20260904095529_create_quotations.sql). Plays the
 * same role for Quotations that google-sheets.ts plays for Form-6 -- the
 * one place that talks to storage -- except this writes to a real
 * Postgres table via Supabase instead of Google Sheets.
 *
 * RLS on `quotations` only requires `authenticated` (see the migration's
 * comments) -- there's no employee/approver split at the DB level, so
 * every function here runs as whichever user's session the caller's
 * Supabase client is bound to. Employee vs. approver gating happens in
 * the API routes, via isApprover() from @/lib/roles -- same as Form-6.
 *
 * Server-only: this transitively imports google-sheets.ts, which imports
 * `googleapis` (Node-only). The `server-only` marker below makes an
 * accidental import from a Client Component fail loudly at build time
 * instead of surfacing as a confusing "Can't resolve 'child_process'"
 * bundler error. Anything a Client Component needs from here (like
 * QUOTATION_NUMBER_PREFIX) belongs in src/lib/quotation-constants.ts
 * instead, which has zero imports and stays safe to import from either
 * side.
 */

import "server-only";

import type { createClient } from "@/lib/supabase/server";
import { logApprovedQuotationToSheet } from "@/lib/google-sheets";
import { QUOTATION_NUMBER_PREFIX } from "@/lib/quotation-constants";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface QuotationItemInput {
  description?: string;
  rate?: string;
  unit?: string;
  unitOther?: string;
  quantity?: string;
  // Accepted for wire-shape compatibility with the `quotations.items`
  // column (description/rate/unit/unit_other/quantity/amount), but never
  // trusted -- amount is always recomputed server-side from rate x
  // quantity below, never taken from what the client sent.
  amount?: string;
}

export interface QuotationItemJson {
  description: string;
  rate: string;
  unit: string;
  unit_other: string;
  quantity: string;
  amount: number;
}

function parseNum(value: string | undefined): number {
  const n = parseFloat((value ?? "").replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Drops rows the employee never filled in (no description, rate, or
 * quantity at all -- e.g. leftover blank rows from the initial 3), and
 * normalizes the rest into the jsonb shape the `items` column stores.
 */
export function shapeQuotationItems(items: QuotationItemInput[]): QuotationItemJson[] {
  return items
    .filter((item) => item.description?.trim() || parseNum(item.rate) > 0 || parseNum(item.quantity) > 0)
    .map((item) => ({
      description: (item.description ?? "").trim(),
      rate: (item.rate ?? "").trim(),
      unit: item.unit ?? "",
      unit_other: (item.unitOther ?? "").trim(),
      quantity: (item.quantity ?? "").trim(),
      amount: parseNum(item.rate) * parseNum(item.quantity),
    }));
}

export interface QuotationTotals {
  taxableAmount: number | null;
  sgstAmount: number | null;
  cgstAmount: number | null;
  totalAmount: number | null;
}

/**
 * Null across the board for a rate-only quotation -- matches the
 * `quotations` table's nullable amount columns and the live totals panel
 * in quotation-generator.tsx, which also hides on rate-only.
 */
export function computeQuotationTotals(items: QuotationItemJson[], rateOnly: boolean): QuotationTotals {
  if (rateOnly) {
    return { taxableAmount: null, sgstAmount: null, cgstAmount: null, totalAmount: null };
  }
  const taxableAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const sgstAmount = taxableAmount * 0.09;
  const cgstAmount = taxableAmount * 0.09;
  const totalAmount = taxableAmount + sgstAmount + cgstAmount;
  return { taxableAmount, sgstAmount, cgstAmount, totalAmount };
}

export interface SubmitQuotationParams {
  quotationNumberSuffix: string;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  rateOnly: boolean;
  items: QuotationItemInput[];
  createdBy: string;
  force: boolean;
}

export type SubmitQuotationResult = { id: string } | { duplicate: true };

/**
 * Inserts a new Pending quotation row, after checking for a
 * same-numbered duplicate unless `force` is set -- a soft warning, not a
 * hard block (per the user's call): the caller (the API route) surfaces
 * the duplicate as a 409, and the employee's confirmation is what
 * triggers a resubmit with force:true, not anything enforced here beyond
 * skipping the check.
 *
 * Throws a plain Error on an unexpected Supabase failure -- mirrors
 * google-sheets.ts's throw-based style for the same reason: the caller
 * (the route) wraps this in try/catch and turns it into a response.
 */
export async function submitQuotation(
  supabase: SupabaseServerClient,
  params: SubmitQuotationParams
): Promise<SubmitQuotationResult> {
  const quotationNumber = `${QUOTATION_NUMBER_PREFIX}${params.quotationNumberSuffix.trim()}`;

  if (!params.force) {
    const { data: existing, error: lookupError } = await supabase
      .from("quotations")
      .select("id")
      .eq("quotation_number", quotationNumber)
      .limit(1);

    if (lookupError) {
      throw new Error(`Duplicate check failed: ${lookupError.message}`);
    }
    if (existing && existing.length > 0) {
      return { duplicate: true };
    }
  }

  const items = shapeQuotationItems(params.items);
  const totals = computeQuotationTotals(items, params.rateOnly);

  const { data: inserted, error: insertError } = await supabase
    .from("quotations")
    .insert({
      quotation_number: quotationNumber,
      quotation_date: new Date().toISOString().slice(0, 10),
      customer_name: params.customerName.trim(),
      customer_contact: params.customerContact.trim(),
      customer_address: params.customerAddress.trim(),
      rate_only: params.rateOnly,
      items,
      taxable_amount: totals.taxableAmount,
      sgst_amount: totals.sgstAmount,
      cgst_amount: totals.cgstAmount,
      total_amount: totals.totalAmount,
      status: "pending",
      created_by: params.createdBy,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Insert failed: ${insertError.message}`);
  }

  return { id: inserted.id as string };
}

// --- Step 4: approver-side reads/writes (list pending, approve, reject) ---
//
// Raw row shape from `select("*")` on the `quotations` table -- there's no
// generated Database type for this project yet (see the untyped
// `.from("quotations")` calls above), so this is a hand-written mirror of
// the migration's columns, same convention as the insert path already
// uses. quotation-client.ts maps this into the camelCase shape the
// approval UI actually consumes, the same split Form6Record /
// ClientForm6Submission use for Form-6.
export interface QuotationRow {
  id: string;
  quotation_number: string;
  quotation_date: string;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  rate_only: boolean;
  items: QuotationItemJson[];
  taxable_amount: number | null;
  sgst_amount: number | null;
  cgst_amount: number | null;
  total_amount: number | null;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  pdf_url: string | null;
  created_at: string;
}

/** Every Pending quotation, oldest first -- for the approver's review queue. */
export async function listPendingQuotations(supabase: SupabaseServerClient): Promise<QuotationRow[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Couldn't load pending quotations: ${error.message}`);
  }
  return (data ?? []) as QuotationRow[];
}

/**
 * Flips a Pending quotation to Approved and stamps who/when. No PDF
 * generation or Sheets logging here -- that's a follow-up step that
 * triggers off this approval, per the brief.
 */
export async function approveQuotation(
  supabase: SupabaseServerClient,
  id: string,
  approvedBy: string
): Promise<QuotationRow> {
  const approvedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "approved", approved_by: approvedBy, approved_at: approvedAt })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Approval failed: ${error.message}`);
  }
  const updated = data as QuotationRow;

  // Sheets logging is a secondary paper trail, not the source of truth --
  // the Supabase row above already is. A Sheets hiccup (bad creds, tab
  // renamed, network blip) should never undo an approval the approver just
  // made or block them from moving on, so this is swallowed rather than
  // rethrown; it's still logged loudly so the failure doesn't go unnoticed.
  try {
    await logApprovedQuotationToSheet({
      quotationNumber: updated.quotation_number,
      quotationDate: updated.quotation_date,
      customerName: updated.customer_name,
      customerContact: updated.customer_contact,
      customerAddress: updated.customer_address,
      rateOnly: updated.rate_only,
      items: updated.items,
      taxableAmount: updated.taxable_amount,
      sgstAmount: updated.sgst_amount,
      cgstAmount: updated.cgst_amount,
      totalAmount: updated.total_amount,
      submittedBy: updated.created_by,
      approvedBy: updated.approved_by ?? approvedBy,
      approvedAt: updated.approved_at ?? approvedAt,
    });
  } catch (err) {
    console.error(`Quotation ${updated.quotation_number} approved, but Sheets logging failed:`, err);
  }

  return updated;
}

/** Flips a Pending quotation to Rejected and stores the reason the approver gave. */
export async function rejectQuotation(
  supabase: SupabaseServerClient,
  id: string,
  reason: string
): Promise<QuotationRow> {
  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Rejection failed: ${error.message}`);
  }
  return data as QuotationRow;
}

/** A single quotation by id, or null if it doesn't exist -- used by the PDF download route to check ownership/approver access and status before generating anything. */
export async function getQuotationById(supabase: SupabaseServerClient, id: string): Promise<QuotationRow | null> {
  const { data, error } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Couldn't load quotation: ${error.message}`);
  }
  return (data as QuotationRow | null) ?? null;
}

export interface ListApprovedQuotationsParams {
  /** Matched against quotation_number OR customer_name, case-insensitive, partial. Empty/omitted = no filter. */
  search?: string;
  /** How many rows to skip -- paging cursor for "Load More". Defaults to 0. */
  offset?: number;
  /** Page size. Defaults to 25 (unchanged from the original cap). */
  limit?: number;
}

export interface ListApprovedQuotationsResult {
  quotations: QuotationRow[];
  /** True if there's at least one more approved quotation past this page (given the same search). */
  hasMore: boolean;
}

/**
 * Most-recently-approved quotations first, paginated -- backs the
 * approver's "Approved Quotations" panel (src/components/quotations/
 * approved-quotations.tsx). Originally (Step 5) this just existed to give
 * approvers somewhere to click "Download PDF" and was hard-capped at 25
 * with no way to reach anything older; Step 6's search/pagination addition
 * replaces that hard cap with a real (if simple) paged, searchable list --
 * 25 is now just the default page size, not a ceiling.
 *
 * `hasMore` is determined by asking Postgres for one row more than the
 * page size (`.range(offset, offset + limit)` is inclusive on both ends,
 * so that's `limit + 1` rows) rather than a separate COUNT query -- cheaper,
 * and it's all the "Load More" button needs to know.
 */
export async function listApprovedQuotations(
  supabase: SupabaseServerClient,
  params: ListApprovedQuotationsParams = {}
): Promise<ListApprovedQuotationsResult> {
  const limit = params.limit ?? 25;
  const offset = params.offset ?? 0;
  const search = (params.search ?? "").trim();

  let query = supabase
    .from("quotations")
    .select("*")
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .range(offset, offset + limit);

  if (search) {
    // Escape ilike's own wildcards plus the `,` the .or() filter string
    // uses as a clause separator, so a search containing any of those
    // characters is matched literally instead of behaving like a pattern
    // or breaking the filter string.
    const escaped = search.replace(/[%_,]/g, (c) => `\${c}`);
    query = query.or(`quotation_number.ilike.%${escaped}%,customer_name.ilike.%${escaped}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Couldn't load approved quotations: ${error.message}`);
  }

  const rows = (data ?? []) as QuotationRow[];
  const hasMore = rows.length > limit;
  return { quotations: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

// --- Step 6: employee-facing status view (latest quotation, resubmit) ---
//
// Mirrors findLatestSubmissionForUser in google-sheets.ts: an employee's
// dashboard shows only their single most recent quotation, not a list.
// Unlike Form-6's Sheets-backed version (which has to fetch every record
// and filter/sort in memory, since Sheets has no query language), this is
// a real Postgres table, so the equivalent is just an indexed query --
// filter by creator, newest first, take one.

/**
 * The current user's most recent quotation, or null if they've never
 * submitted one -- backs the employee-facing status view in
 * quotation-generator.tsx (findLatestQuotationForUser -> initialQuotation
 * prop, same as Form-6's initialSubmission).
 *
 * `.ilike()` with no wildcard characters in the pattern is Postgres's
 * plain case-insensitive equals -- matches Form-6's
 * `.toLowerCase()`-normalized comparison without pulling every row down
 * to filter client-side.
 */
export async function findLatestQuotationForUser(
  supabase: SupabaseServerClient,
  email: string
): Promise<QuotationRow | null> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .ilike("created_by", email.trim())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Couldn't load your quotation status: ${error.message}`);
  }
  return (data as QuotationRow | null) ?? null;
}

export interface ResubmitQuotationParams {
  customerName: string;
  customerContact: string;
  customerAddress: string;
  rateOnly: boolean;
  items: QuotationItemInput[];
}

/**
 * Corrects and resubmits a Rejected quotation: overwrites the customer
 * and item/total fields with what the employee just fixed, flips status
 * back to Pending, and clears the rejection reason. Mirrors updateForm6's
 * ownership-check-then-update shape in google-sheets.ts (used there for
 * both "resubmit after rejection" and "fix a typo after approval") --
 * except this is scoped to Rejected quotations only, since Step 6 only
 * gives employees an Edit path off a rejected quotation, not an approved
 * one.
 *
 * Updates the same row in place (never inserts a new one) -- the
 * quotation keeps its id and its quotation_number; only the fields the
 * employee can actually edit change. Because the number itself never
 * changes here, this deliberately does NOT re-run submitQuotation's
 * duplicate-number check -- that check only matters for a number that's
 * being newly claimed.
 *
 * Throws (rather than returning a result union like submitQuotation) on
 * "doesn't exist", "not yours", and "not rejected" -- the caller (the
 * resubmit route) turns each into the appropriate HTTP status.
 */
export async function resubmitQuotation(
  supabase: SupabaseServerClient,
  id: string,
  requestedBy: string,
  params: ResubmitQuotationParams
): Promise<QuotationRow> {
  const existing = await getQuotationById(supabase, id);
  if (!existing) {
    throw new Error("That quotation no longer exists.");
  }
  if (existing.created_by.trim().toLowerCase() !== requestedBy.trim().toLowerCase()) {
    throw new Error("You can only resubmit your own quotation.");
  }
  if (existing.status !== "rejected") {
    throw new Error("Only a rejected quotation can be resubmitted.");
  }

  const items = shapeQuotationItems(params.items);
  const totals = computeQuotationTotals(items, params.rateOnly);

  const { data, error } = await supabase
    .from("quotations")
    .update({
      customer_name: params.customerName.trim(),
      customer_contact: params.customerContact.trim(),
      customer_address: params.customerAddress.trim(),
      rate_only: params.rateOnly,
      items,
      taxable_amount: totals.taxableAmount,
      sgst_amount: totals.sgstAmount,
      cgst_amount: totals.cgstAmount,
      total_amount: totals.totalAmount,
      status: "pending",
      rejection_reason: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Resubmit failed: ${error.message}`);
  }
  return data as QuotationRow;
}
