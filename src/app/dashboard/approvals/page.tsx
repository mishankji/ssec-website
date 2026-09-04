import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listPendingSubmissions } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";
import { listPendingQuotations, listApprovedQuotations } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";
import { getRole, dashboardHeading } from "@/lib/roles";
import { SignOutButton } from "../sign-out-button";
import { PendingApprovals } from "@/components/form6/pending-approvals";
import { PendingQuotations } from "@/components/quotations/pending-quotations";
import { ApprovedQuotations } from "@/components/quotations/approved-quotations";

export const metadata: Metadata = {
  title: "Pending Approvals",
};

// Approver-only page: the three approval sections that used to sit on
// /dashboard alongside the Form-6/Quotation tools -- split out so
// approver-only review work and everyday employee tools aren't competing
// for space on the same page. Same auth gate as /dashboard itself, plus
// one more: a signed-in non-approver has nothing to do here, so they're
// bounced back to /dashboard rather than seeing an empty page.
export default async function ApprovalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = getRole(user.email);
  if (role !== "approver") {
    redirect("/dashboard");
  }

  // Same server-side fetches /dashboard/page.tsx used to do for these
  // three sections, unchanged -- just relocated here instead of being
  // duplicated in both files.
  let initialPending: ReturnType<typeof toClientSubmission>[] = [];
  let initialPendingError = "";
  try {
    const records = await listPendingSubmissions();
    initialPending = records.map(toClientSubmission);
  } catch (err) {
    initialPendingError =
      err instanceof Error ? err.message : "Couldn't load pending submissions.";
  }

  let initialPendingQuotations: ReturnType<typeof toClientQuotation>[] = [];
  let initialPendingQuotationsError = "";
  try {
    const rows = await listPendingQuotations(supabase);
    initialPendingQuotations = rows.map(toClientQuotation);
  } catch (err) {
    initialPendingQuotationsError =
      err instanceof Error ? err.message : "Couldn't load pending quotations.";
  }

  let initialApprovedQuotations: ReturnType<typeof toClientQuotation>[] = [];
  let initialApprovedQuotationsHasMore = false;
  let initialApprovedQuotationsError = "";
  try {
    const { quotations: rows, hasMore } = await listApprovedQuotations(supabase);
    initialApprovedQuotations = rows.map(toClientQuotation);
    initialApprovedQuotationsHasMore = hasMore;
  } catch (err) {
    initialApprovedQuotationsError =
      err instanceof Error ? err.message : "Couldn't load approved quotations.";
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-forest">
            {dashboardHeading(role)}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
            Signed in as {user.email}
            <span className="rounded-full bg-brass/15 px-2.5 py-0.5 text-xs font-semibold text-brass">
              Approver
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
          >
            Dashboard
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-10">
        <PendingQuotations
          initialQuotations={initialPendingQuotations}
          initialError={initialPendingQuotationsError}
        />
      </div>

      <div className="mt-10">
        <ApprovedQuotations
          initialQuotations={initialApprovedQuotations}
          initialHasMore={initialApprovedQuotationsHasMore}
          initialError={initialApprovedQuotationsError}
        />
      </div>

      <div className="mt-10">
        <PendingApprovals initialSubmissions={initialPending} initialError={initialPendingError} />
      </div>
    </div>
  );
}
