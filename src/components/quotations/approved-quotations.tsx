"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Download, Loader2, Search } from "lucide-react";
import type { ClientQuotation } from "@/lib/quotation-client";

const SEARCH_DEBOUNCE_MS = 300;

function formatCurrency(n: number): string {
  return `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function fetchApproved(
  search: string,
  offset: number
): Promise<{ quotations: ClientQuotation[]; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (offset) params.set("offset", String(offset));
  const query = params.toString();
  const res = await fetch(`/api/quotations/approved${query ? `?${query}` : ""}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Couldn't load approved quotations.");
  return { quotations: data.quotations as ClientQuotation[], hasMore: Boolean(data.hasMore) };
}

/** One approved quotation's row -- shared between the collapsed single-card view and the expanded list, so they never visually drift apart. */
function ApprovedQuotationCard({ q }: { q: ClientQuotation }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest/10 bg-offwhite/40 p-4">
      <div>
        <p className="font-semibold text-forest">{q.quotationNumber}</p>
        <p className="text-xs text-ink/50">
          {q.customerName} &middot;{" "}
          {q.rateOnly ? "Rate-only" : formatCurrency(q.totalAmount ?? 0)} &middot; Approved by{" "}
          {q.approvedBy ?? "unknown"}
        </p>
      </div>
      <a
        href={`/api/quotations/${q.id}/pdf`}
        className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-offwhite transition-colors hover:bg-forest/90"
      >
        <Download size={14} /> Download PDF
      </a>
    </div>
  );
}

/**
 * Approver-only: approved quotations, newest first, each with a Download
 * PDF button hitting src/app/api/quotations/[id]/pdf/route.ts.
 *
 * Collapsed by default to just the single most recent approval -- a
 * "Show older approvals" toggle expands into the full searchable,
 * paginated list (debounced search box + Load More), which is otherwise
 * unchanged from the previous step: the underlying fetch/list mechanics
 * are identical either way, this only changes what's rendered before the
 * approver asks for more. `initialQuotations` still arrives as a
 * server-fetched prop with up to a page's worth of rows (see
 * listApprovedQuotations() in quotations.ts), so expanding is instant --
 * no fetch needed until the approver actually searches or clicks Load
 * More.
 *
 * Still no polling (unlike PendingQuotations) -- approved quotations don't
 * change again, so there's nothing to refresh on a timer.
 */
export function ApprovedQuotations({
  initialQuotations,
  initialHasMore,
  initialError,
}: {
  initialQuotations: ClientQuotation[];
  initialHasMore: boolean;
  initialError: string;
}) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState(initialError);
  const [expanded, setExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Guards against a slower, stale search response landing after a
  // faster, newer one -- each debounced fetch stamps the request count
  // it was issued at, and a response is only applied if it's still the
  // most recent one in flight.
  const requestIdRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  // Debounced search: waits SEARCH_DEBOUNCE_MS after the user stops
  // typing, then re-queries from the first page (any active "Load More"
  // progress is discarded -- a new search is a new result set). Skipped
  // on mount so the initial, server-fetched page isn't immediately
  // re-fetched client-side for nothing.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const trimmed = searchInput.trim();
    const requestId = ++requestIdRef.current;
    setSearching(true);

    const timer = setTimeout(() => {
      fetchApproved(trimmed, 0)
        .then(({ quotations: rows, hasMore: more }) => {
          if (requestIdRef.current !== requestId) return;
          setQuotations(rows);
          setHasMore(more);
          setError("");
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return;
          setError(err instanceof Error ? err.message : "Couldn't load approved quotations.");
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleLoadMore() {
    setLoadingMore(true);
    const requestId = ++requestIdRef.current;
    try {
      const { quotations: rows, hasMore: more } = await fetchApproved(searchInput.trim(), quotations.length);
      if (requestIdRef.current !== requestId) return;
      setQuotations((prev) => [...prev, ...rows]);
      setHasMore(more);
      setError("");
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Couldn't load approved quotations.");
    } finally {
      if (requestIdRef.current === requestId) setLoadingMore(false);
    }
  }

  // Whether there's anything beyond the single most-recent card worth
  // expanding for -- a second already-loaded row, or more reachable via
  // Load More/search. No point offering to expand an empty toggle.
  const canExpand = quotations.length > 1 || hasMore;

  return (
    <section className="rounded-2xl border border-forest/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-forest">Approved Quotations</h2>
        {expanded && (
          <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-sage/20 px-2 py-0.5 text-xs font-bold text-forest">
            {quotations.length}
          </span>
        )}
      </div>

      {expanded && (
        <div className="relative mt-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by quotation number or customer name..."
            className="w-full rounded-lg border border-forest/15 bg-white py-2 pl-9 pr-9 text-sm text-ink outline-none transition-colors focus:border-brass"
          />
          {searching && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink/40"
            />
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {quotations.length === 0 && !error ? (
        <p className="mt-3 text-sm text-ink/60">
          {expanded && searchInput.trim() ? "No approved quotations match your search." : "Nothing approved yet."}
        </p>
      ) : expanded ? (
        <>
          <div className="mt-4 flex flex-col gap-3">
            {quotations.map((q) => (
              <ApprovedQuotationCard key={q.id} q={q} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-sage/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <ApprovedQuotationCard q={quotations[0]} />
        </div>
      )}

      {(canExpand || expanded) && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-brass"
          >
            {expanded ? "Hide older approvals" : "Show older approvals"}
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      )}
    </section>
  );
}
