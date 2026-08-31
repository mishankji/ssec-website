"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { ClientForm6Submission } from "@/lib/form6-client";

const POLL_INTERVAL_MS = 15_000;

async function fetchPending(): Promise<ClientForm6Submission[]> {
  const res = await fetch("/api/form6/pending");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Couldn't load pending submissions.");
  return data.submissions as ClientForm6Submission[];
}

/**
 * Approver-only panel: full details of every Pending submission, with
 * Approve/Reject actions and a live count badge.
 *
 * The initial list comes from the server (dashboard/page.tsx) as a prop, so
 * there's no fetch-on-mount effect for the first render. After that, a
 * plain interval keeps it current without a page refresh -- this is a
 * subscription-style effect (the interval callback fires independently,
 * later, outside the effect's own execution), not the
 * "fetch-then-setState-during-mount" pattern the
 * react-hooks/set-state-in-effect rule is about, so it doesn't trigger it
 * (verified against the actual rule, not just tsc, before shipping this).
 */
export function PendingApprovals({
  initialSubmissions,
  initialError,
}: {
  initialSubmissions: ClientForm6Submission[];
  initialError: string;
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [error, setError] = useState(initialError);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = useCallback(() => {
    fetchPending()
      .then((next) => {
        setSubmissions(next);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't refresh pending submissions.")
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
      const res = await fetch("/api/form6/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Approval failed.");
      setSubmissions((prev) => prev.filter((s) => s.submissionId !== id));
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
      const res = await fetch("/api/form6/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rejection failed.");
      setSubmissions((prev) => prev.filter((s) => s.submissionId !== id));
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
        <h2 className="font-heading text-lg font-semibold text-forest">Pending Approvals</h2>
        <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-offwhite">
          {submissions.length}
        </span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {submissions.length === 0 && !error ? (
        <p className="mt-3 text-sm text-ink/60">Nothing waiting on you right now.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {submissions.map((s) => (
            <div key={s.submissionId} className="rounded-xl border border-forest/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-forest">{s.senderName}</p>
                  <p className="text-xs text-ink/50">
                    Manifest Doc No. {s.manifestDocNo} &middot; Submitted by {s.submittedBy}
                  </p>
                </div>
                <p className="text-xs text-ink/40">{new Date(s.timestamp).toLocaleString()}</p>
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-ink/70 sm:grid-cols-2">
                <div>
                  <dt className="inline font-semibold">Address: </dt>
                  <dd className="inline">{s.senderAddress}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Phone: </dt>
                  <dd className="inline">{s.senderPhone}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Authorisation No.: </dt>
                  <dd className="inline">{s.senderAuthNo || "N/A"}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Vehicle: </dt>
                  <dd className="inline">
                    {s.vehicleNumber} &middot; {s.vehicleType}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="inline font-semibold">Transport: </dt>
                  <dd className="inline">
                    {s.transportMode === "self"
                      ? "Self"
                      : `${s.transporterName}, ${s.transporterAddress}, ${s.transporterPhone} (${s.transporterRegNo})`}
                  </dd>
                </div>
              </dl>

              <p className="mt-2 whitespace-pre-line text-sm text-ink/70">
                <span className="font-semibold">Items:</span>
                {"\n"}
                {s.items}
              </p>

              {rejectingId === s.submissionId ? (
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
                      disabled={busyId === s.submissionId || !rejectReason.trim()}
                      onClick={() => handleReject(s.submissionId)}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyId === s.submissionId ? <Loader2 size={13} className="animate-spin" /> : null}
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
                    disabled={busyId === s.submissionId}
                    onClick={() => handleApprove(s.submissionId)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-offwhite disabled:opacity-50"
                  >
                    {busyId === s.submissionId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === s.submissionId}
                    onClick={() => setRejectingId(s.submissionId)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
