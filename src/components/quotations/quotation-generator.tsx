"use client";

import { useState } from "react";
import { Download, Loader2, Pencil, Plus, RefreshCcw } from "lucide-react";
import { QuotationItemRow, type QuotationItemState, type QuotationUnit } from "./quotation-item-row";
import { validateQuotationBody } from "@/lib/quotation-validation";
import { QUOTATION_NUMBER_PREFIX } from "@/lib/quotation-constants";
import type { ClientQuotation } from "@/lib/quotation-client";
import type { QuotationItemJson } from "@/lib/quotations";

// Phase 3 (Quotation Generator).
// Step 2 ported the mockup as a frontend-only component (local state, no
// API calls). Step 3 wired Submit for Approval to
// src/app/api/quotations/submit/route.ts, which writes a real Pending row
// into the `quotations` table (see
// supabase/migrations/20260904095529_create_quotations.sql). Step 6 adds
// the status/mode split below, mirroring Form6Generator's actual pattern
// (src/components/form6/form6-generator.tsx) rather than reinventing one:
// an employee's dashboard shows their single most recent quotation --
// blank form if they've never submitted one, a status screen (with the
// outcome and whatever action makes sense) otherwise -- server-fetched on
// every page load so a refresh never loses context.
//
// Two deliberate departures from Form6Generator's status view:
//   - Download links straight to the existing GET
//     /api/quotations/[id]/pdf route (an <a href>, same as
//     approved-quotations.tsx's own download link) instead of generating
//     the PDF client-side -- Form-6 has no server PDF route to hit, this
//     domain already does.
//   - Only a Rejected quotation gets an Edit path. Form-6 also lets you
//     edit an Approved submission to fix a typo; the Step 6 brief for
//     quotations doesn't ask for that, so Approved only gets Download +
//     New Quotation.
//
// Save Draft stays inert -- not built yet.
//
// Ported faithfully from quotation-form-mockup.html -- same field order,
// spacing, and interactive behavior (rate-only toggle, add/remove rows,
// live totals). Colors/type map onto this project's existing Tailwind
// tokens rather than the mockup's raw hex (they mostly coincide exactly:
// --primary #2F4A3E is this project's `forest`, --brass #C9A24B is `brass`).
// A few small, deliberate departures from the mockup, done for consistency
// with the rest of the dashboard rather than as a redesign:
//   - Field/section font sizes use Tailwind's standard type scale (text-xs,
//     text-sm, ...) instead of the mockup's arbitrary pixel values -- same
//     as every other component in this project.
//   - The remove-row "×" is the Trash2 icon (lucide-react), matching how
//     src/components/form6/item-row.tsx removes a row, instead of a plain
//     glyph.
//   - Action buttons use Form-6's rounded-full pill shape/classes (see
//     the buttons themselves below) instead of the mockup's own
//     rounded-rectangle shape, for visual consistency with Form-6.

const inputClasses =
  "w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brass";

function emptyItem(): QuotationItemState {
  return {
    key: Math.random().toString(36).slice(2),
    description: "",
    rate: "",
    unit: "",
    unitOther: "",
    quantity: "",
  };
}

function blankItems(): QuotationItemState[] {
  // Starts with 3 blank rows, matching the mockup's initial addRow() x3.
  return [emptyItem(), emptyItem(), emptyItem()];
}

function parseNum(value: string): number {
  const n = parseFloat(value.replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Builds the form's local field state from either an existing quotation
 * (editing/resubmitting a Rejected one -- prefills everything, including
 * items) or null (a brand-new, blank form). Kept as one function so
 * "start new", "edit this", and "cancel back to what's saved" all shape
 * their fields identically -- same role fieldsFromSubmission plays in
 * form6-generator.tsx.
 *
 * The quotation number field only ever holds the *suffix* the employee
 * types (the mockup fixes QUOTATION_NUMBER_PREFIX in front of it), so a
 * saved quotation's full number has that prefix stripped back off here.
 */
function fieldsFromSubmission(sub: ClientQuotation | null) {
  if (!sub) {
    return {
      quotationNumber: "",
      customerName: "",
      customerContact: "",
      customerAddress: "",
      rateOnly: false,
      items: blankItems(),
    };
  }
  return {
    quotationNumber: sub.quotationNumber.startsWith(QUOTATION_NUMBER_PREFIX)
      ? sub.quotationNumber.slice(QUOTATION_NUMBER_PREFIX.length)
      : sub.quotationNumber,
    customerName: sub.customerName,
    customerContact: sub.customerContact,
    customerAddress: sub.customerAddress,
    rateOnly: sub.rateOnly,
    items:
      sub.items.length > 0
        ? sub.items.map((it) => ({
            key: Math.random().toString(36).slice(2),
            description: it.description,
            rate: it.rate,
            unit: it.unit as QuotationUnit,
            unitOther: it.unit_other,
            quantity: it.quantity,
          }))
        : blankItems(),
  };
}

export function QuotationGenerator({
  submittedBy,
  initialQuotation,
  initialQuotationError,
}: {
  submittedBy: string;
  initialQuotation: ClientQuotation | null;
  initialQuotationError: string;
}) {
  const [mode, setMode] = useState<"status" | "form">(initialQuotation ? "status" : "form");
  const [submission, setSubmission] = useState<ClientQuotation | null>(initialQuotation);
  const [submissionError, setSubmissionError] = useState(initialQuotationError);
  // Set while the form is editing/resubmitting an existing row (Rejected ->
  // resubmit); null means "this save creates a brand-new quotation".
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFields = fieldsFromSubmission(initialQuotation);
  const [quotationNumber, setQuotationNumber] = useState(initialFields.quotationNumber);
  const [customerName, setCustomerName] = useState(initialFields.customerName);
  const [customerContact, setCustomerContact] = useState(initialFields.customerContact);
  const [customerAddress, setCustomerAddress] = useState(initialFields.customerAddress);
  const [rateOnly, setRateOnly] = useState(initialFields.rateOnly);
  const [items, setItems] = useState<QuotationItemState[]>(initialFields.items);

  // Inline field errors from the client-side pre-check (see
  // runClientValidation) -- kept separate from submitError, which is
  // whatever came back from the API itself (validation or server error),
  // shown near the Submit button per the spec for this step.
  const [quotationNumberError, setQuotationNumberError] = useState("");
  const [customerNameError, setCustomerNameError] = useState("");
  const [itemsError, setItemsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function applyFields(fields: ReturnType<typeof fieldsFromSubmission>) {
    setQuotationNumber(fields.quotationNumber);
    setCustomerName(fields.customerName);
    setCustomerContact(fields.customerContact);
    setCustomerAddress(fields.customerAddress);
    setRateOnly(fields.rateOnly);
    setItems(fields.items);
  }

  function clearFieldErrors() {
    setQuotationNumberError("");
    setCustomerNameError("");
    setItemsError("");
    setSubmitError("");
  }

  function startNewSubmission() {
    applyFields(fieldsFromSubmission(null));
    setEditingId(null);
    clearFieldErrors();
    setMode("form");
  }

  function startEditingCurrent() {
    if (!submission) return;
    applyFields(fieldsFromSubmission(submission));
    setEditingId(submission.id);
    clearFieldErrors();
    setMode("form");
  }

  /** Discards any in-progress edits and returns to the status view for whatever is currently saved. */
  function cancelEditing() {
    if (!submission) return;
    applyFields(fieldsFromSubmission(submission));
    setEditingId(null);
    clearFieldErrors();
    setMode("status");
  }

  function updateItem(key: string, next: QuotationItemState) {
    setItems((prev) => prev.map((item) => (item.key === key ? next : item)));
  }

  function removeItem(key: string) {
    // No "at least one row" guard -- the mockup doesn't have one either,
    // so an employee can remove every row if they want.
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  const taxableAmount = rateOnly
    ? 0
    : items.reduce((sum, item) => sum + parseNum(item.rate) * parseNum(item.quantity), 0);
  const sgstAmount = taxableAmount * 0.09;
  const cgstAmount = taxableAmount * 0.09;
  const totalAmount = taxableAmount + sgstAmount + cgstAmount;

  function itemsPayload() {
    return items.map(({ description, rate, unit, unitOther, quantity }) => ({
      description,
      rate,
      unit,
      unitOther,
      quantity,
    }));
  }

  /**
   * Shapes the current form's items into the same jsonb-ish shape the
   * server stores (src/lib/quotations.ts's shapeQuotationItems), for
   * building an optimistic ClientQuotation locally right after a
   * brand-new submission -- the submit route only returns { id }, so
   * there's nothing to re-fetch this from.
   */
  function buildLocalItemsJson(): QuotationItemJson[] {
    return items
      .filter((item) => item.description.trim() || parseNum(item.rate) > 0 || parseNum(item.quantity) > 0)
      .map((item) => ({
        description: item.description.trim(),
        rate: item.rate.trim(),
        unit: item.unit,
        unit_other: item.unitOther.trim(),
        quantity: item.quantity.trim(),
        amount: parseNum(item.rate) * parseNum(item.quantity),
      }));
  }

  /**
   * Runs the exact same check the API route runs (validateQuotationBody,
   * shared from src/lib/quotation-validation.ts) so the two can't drift
   * apart -- this just also decides which field's error slot to fill.
   * Returns true when the form is valid.
   */
  function runClientValidation(): boolean {
    setQuotationNumberError("");
    setCustomerNameError("");
    setItemsError("");
    setSubmitError("");

    if (!quotationNumber.trim()) {
      setQuotationNumberError("Quotation number is required.");
      return false;
    }
    if (!customerName.trim()) {
      setCustomerNameError("Customer / company name is required.");
      return false;
    }

    const error = validateQuotationBody({
      quotationNumberSuffix: quotationNumber,
      customerName,
      rateOnly,
      items: itemsPayload(),
    });
    if (error) {
      setItemsError(error);
      return false;
    }
    return true;
  }

  async function handleSubmitForApproval(force = false) {
    if (!force && !runClientValidation()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      if (editingId) {
        const res = await fetch(`/api/quotations/${editingId}/resubmit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerContact: customerContact.trim(),
            customerAddress: customerAddress.trim(),
            rateOnly,
            items: itemsPayload(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");

        setSubmission(data.quotation as ClientQuotation);
        setEditingId(null);
        setSubmissionError("");
        setMode("status");
        return;
      }

      const res = await fetch("/api/quotations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationNumberSuffix: quotationNumber.trim(),
          customerName: customerName.trim(),
          customerContact: customerContact.trim(),
          customerAddress: customerAddress.trim(),
          rateOnly,
          items: itemsPayload(),
          ...(force ? { force: true } : {}),
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => null);
        if (data?.duplicate) {
          const proceed = window.confirm(
            `Quotation number ${QUOTATION_NUMBER_PREFIX}${quotationNumber.trim()} already exists. Submit anyway?`
          );
          if (proceed) {
            await handleSubmitForApproval(true);
          }
          return;
        }
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      // A brand-new quotation only gets back { id } (it's Pending, no
      // approval/PDF yet) -- build the client-shaped record locally from
      // exactly what was just sent, rather than a second round trip.
      setSubmission({
        id: data.id,
        quotationNumber: `${QUOTATION_NUMBER_PREFIX}${quotationNumber.trim()}`,
        quotationDate: new Date().toISOString().slice(0, 10),
        customerName: customerName.trim(),
        customerContact: customerContact.trim(),
        customerAddress: customerAddress.trim(),
        rateOnly,
        items: buildLocalItemsJson(),
        taxableAmount: rateOnly ? null : taxableAmount,
        sgstAmount: rateOnly ? null : sgstAmount,
        cgstAmount: rateOnly ? null : cgstAmount,
        totalAmount: rateOnly ? null : totalAmount,
        status: "pending",
        createdBy: submittedBy,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
      });
      setEditingId(null);
      setSubmissionError("");
      setMode("status");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "status" && submission) {
    return (
      <div className="rounded-2xl border border-forest/10 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
          {submission.quotationNumber}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-forest">
          {submission.customerName}
        </h3>
        {submission.rateOnly ? (
          <p className="mt-1 text-sm italic text-brass">Rate-only quotation</p>
        ) : (
          submission.totalAmount != null && (
            <p className="mt-1 text-sm text-ink/70">
              Total:{" "}
              <span className="font-semibold text-ink">₹ {formatAmount(submission.totalAmount)}</span>
            </p>
          )
        )}

        {submission.status === "pending" && (
          <p className="mt-4 text-sm text-ink/70">Submitted — awaiting approval.</p>
        )}

        {submission.status === "rejected" && (
          <>
            <h4 className="mt-4 font-heading text-base font-semibold text-red-600">Quotation rejected</h4>
            <p className="mt-2 text-sm text-ink/70">
              Reason: <span className="font-medium text-ink">{submission.rejectionReason}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startEditingCurrent}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90"
              >
                Edit Submission
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={startNewSubmission}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
              >
                Discard &amp; Start New
                <RefreshCcw size={15} />
              </button>
            </div>
          </>
        )}

        {submission.status === "approved" && (
          <>
            <p className="mt-4 text-sm text-ink/70">Approved — ready to download.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={`/api/quotations/${submission.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90"
              >
                Download PDF
                <Download size={15} />
              </a>
              <button
                type="button"
                onClick={startNewSubmission}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
              >
                New Quotation
                <RefreshCcw size={15} />
              </button>
            </div>
          </>
        )}

        {submissionError && <p className="mt-4 text-sm text-red-600">{submissionError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-forest/10 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 pb-5">
        <div>
          <h2 className="font-heading text-xl font-semibold text-forest">
            {editingId ? "Edit Quotation" : "New Quotation"}
          </h2>
          <p className="mt-1 text-xs text-ink/60">E-Waste Enquiry Quotation Generator</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60">
              Quotation No.
            </label>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm font-semibold text-ink">{QUOTATION_NUMBER_PREFIX}</span>
              <input
                type="text"
                placeholder="e.g. 015"
                value={quotationNumber}
                disabled={Boolean(editingId)}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className="w-20 rounded-md border border-forest/15 bg-white px-2 py-1.5 text-sm text-ink outline-none transition-colors focus:border-brass disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            {quotationNumberError && <p className="mt-1 text-xs text-red-600">{quotationNumberError}</p>}
          </div>
          {submission && (
            <button
              type="button"
              onClick={cancelEditing}
              className="mt-5 text-sm font-semibold text-ink/50 hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest">
          Customer Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/60">
              Customer / Company Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={inputClasses}
            />
            {customerNameError && <p className="mt-1 text-xs text-red-600">{customerNameError}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/60">Contact Number</label>
            <input
              type="text"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink/60">Address</label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={2}
              className={`${inputClasses} min-h-[44px] resize-y`}
            />
          </div>
        </div>
      </section>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brass/40 bg-brass/10 p-3.5">
        <input
          type="checkbox"
          checked={rateOnly}
          onChange={(e) => setRateOnly(e.target.checked)}
          className="mt-0.5 h-[15px] w-[15px] shrink-0 accent-brass"
        />
        <div className="text-sm text-ink">
          Rate-only quotation
          <span className="mt-0.5 block text-xs text-ink/60">
            Check this if quantities aren&apos;t fixed for this enquiry — hides Quantity, Amount and
            totals on the final document.
          </span>
        </div>
      </label>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-forest px-2 py-2.5"></th>
                <th className="bg-forest px-2 py-2.5 text-left text-xs font-semibold text-offwhite">
                  Item Description
                </th>
                <th className="bg-forest px-2 py-2.5 text-right text-xs font-semibold text-offwhite">
                  Rate (₹)
                </th>
                <th className="bg-forest px-2 py-2.5 text-left text-xs font-semibold text-offwhite">
                  Unit
                </th>
                <th className="bg-forest px-2 py-2.5 text-left text-xs font-semibold text-offwhite">
                  Quantity
                </th>
                <th className="bg-forest px-2 py-2.5 text-right text-xs font-semibold text-offwhite">
                  Amount (₹)
                </th>
                <th className="bg-forest px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <QuotationItemRow
                  key={item.key}
                  item={item}
                  index={index}
                  rateOnly={rateOnly}
                  onChange={(next) => updateItem(item.key, next)}
                  onRemove={() => removeItem(item.key)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {itemsError && <p className="mt-2 text-sm text-red-600">{itemsError}</p>}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-forest px-3.5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
        >
          <Plus size={15} /> Add Item
        </button>
      </section>

      {!rateOnly ? (
        <div className="flex justify-end">
          <div className="w-full max-w-[280px] text-sm">
            <div className="flex justify-between border-b border-forest/10 py-1.5">
              <span className="text-ink/60">Taxable Amount</span>
              <span className="text-ink">₹ {formatAmount(taxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-forest/10 py-1.5">
              <span className="text-ink/60">SGST @ 9%</span>
              <span className="text-ink">₹ {formatAmount(sgstAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-forest/10 py-1.5">
              <span className="text-ink/60">CGST @ 9%</span>
              <span className="text-ink">₹ {formatAmount(cgstAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t-2 border-forest pt-2.5">
              <span className="font-heading text-base font-semibold text-ink">Total Amount</span>
              <span className="font-heading text-base font-semibold text-forest">
                ₹ {formatAmount(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-right text-xs italic text-brass">Totals hidden — rate-only quotation</p>
      )}

      {/* Save Draft is still inert (not built this step). Submit for
          Approval calls src/app/api/quotations/submit/route.ts when
          creating a new quotation, or
          src/app/api/quotations/[id]/resubmit/route.ts when correcting a
          Rejected one -- see the file header comment. */}
      <div className="border-t border-forest/10 pt-5">
        {submitError && <p className="mb-2 text-right text-sm text-red-600">{submitError}</p>}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitForApproval()}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting...
              </>
            ) : editingId ? (
              "Save & Resubmit"
            ) : (
              "Submit for Approval"
            )}
          </button>
        </div>
        <p className="mt-2 text-right text-xs text-ink/40">
          Goes to the owner for approval before it&apos;s logged and a PDF is issued.
        </p>
      </div>
    </div>
  );
}
