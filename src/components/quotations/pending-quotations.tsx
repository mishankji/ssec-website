"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import type { ClientQuotation } from "@/lib/quotation-client";

const POLL_INTERVAL_MS = 15_000;

async function fetchPending(): Promise<ClientQuotation[]> {
  const res = await fetch("/api/quotations/pending");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Couldn't load pending quotations.");
  return data.quotations as ClientQuotation[];
}

function formatCurrency(n: number): string {
  return `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function unitLabel(unit: string, unitOther: string): string {
  return unit === "other" ? unitOther || "Other" : unit;
}

/**
 * Approver-only panel: full details of every Pending quotation, with
 * Approve/Reject actions -- same shape as Form-6's PendingApprovals (see
 * src/components/form6/pending-approvals.tsx): initial data arrives as a
 * server-fetched prop (no mount-time client fetch), then a polling
 * interval keeps it current. The one addition Form-6's cards don't need
 * is a per-card expand/collapse for the item table, since a quotation's
 * line items are the thing the approver actually has to review before
 * approving.
 */
export function PendingQuotations({
  initialQuotations,
  initialError,
}: {
  initialQuotations: ClientQuotation[];
  initialError: string;
}) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [error, setError] = useState(initialError);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchPending()
      .then((next) => {
        setQuotations(next);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't refresh pending quotations.")
      );
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleApprove(id: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/quotations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Approval failed.");
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/quotations/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationId: id, reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rejection failed.");
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rejection failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-brass/20 bg-brass/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-forest">Pending Quotation Approvals</h2>
        <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-offwhite">
          {quotations.length}
        </span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {quotations.length === 0 && !error ? (
        <p className="mt-3 text-sm text-ink/60">No quotations waiting on you right now.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {quotations.map((q) => {
            const expanded = expandedId === q.id;
            return (
              <div key={q.id} className="rounded-xl border border-forest/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-forest">{q.quotationNumber}</p>
                    <p className="text-xs text-ink/50">
                      {q.customerName} &middot; Submitted by {q.createdBy}
                    </p>
                  </div>
                  <p className="text-xs text-ink/40">{new Date(q.createdAt).toLocaleString()}</p>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-ink/70 sm:grid-cols-2">
                  <div>
                    <dt className="inline font-semibold">Contact: </dt>
                    <dd className="inline">{q.customerContact || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Items: </dt>
                    <dd className="inline">
                      {q.items.length}
                      {q.rateOnly && (
                        <span className="ml-2 rounded-full bg-brass/15 px-2 py-0.5 text-xs font-semibold text-brass">
                          Rate-only
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="inline font-semibold">Total: </dt>
                    <dd className="inline">
                      {q.rateOnly ? (
                        <span className="italic text-brass">Rate-only — no total</span>
                      ) : (
                        formatCurrency(q.totalAmount ?? 0)
                      )}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-brass"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? "Hide items" : "View items"}
                </button>

                {expanded && (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-forest/10">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-forest/5 text-xs font-semibold uppercase tracking-wide text-ink/50">
                        <tr>
                          <th className="px-3 py-2">Description</th>
                          <th className="px-3 py-2">Rate</th>
                          <th className="px-3 py-2">Unit</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest/5">
                        {q.items.map((item, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2">{item.rate}</td>
                            <td className="px-3 py-2">{unitLabel(item.unit, item.unit_other)}</td>
                            <td className="px-3 py-2">{q.rateOnly ? "—" : item.quantity}</td>
                            <td className="px-3 py-2">
                              {q.rateOnly ? "—" : item.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rejectingId === q.id ? (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Reason for rejecting"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-lg border border-forest/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === q.id || !rejectReason.trim()}
                        onClick={() => handleReject(q.id)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {busyId === q.id ? <Loader2 size={13} className="animate-spin" /> : null}
                        Confirm Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                        className="whitespace-nowrap rounded-full border border-forest/20 px-4 py-2 text-xs font-semibold text-forest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === q.id}
                      onClick={() => handleApprove(q.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-offwhite disabled:opacity-50"
                    >
                      {busyId === q.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === q.id}
                      onClick={() => setRejectingId(q.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
