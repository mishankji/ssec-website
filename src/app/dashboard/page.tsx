import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findLatestSubmissionForUser } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";
import { findLatestQuotationForUser } from "@/lib/quotations";
import { toClientQuotation } from "@/lib/quotation-client";
import { getRole, dashboardHeading } from "@/lib/roles";
import { SignOutButton } from "./sign-out-button";
import { DashboardTools } from "./dashboard-tools";
import { Form6Generator } from "@/components/form6/form6-generator";
import { QuotationGenerator } from "@/components/quotations/quotation-generator";

export const metadata: Metadata = {
  title: "Dashboard",
};

// The tools page: Form-6 and Quotation generators, for everyone with a
// login. The three approval sections (Pending Form-6 Approvals, Pending
// Quotation Approvals, Approved Quotations) used to live here too, but
// approver-only content and everyday employee tools don't belong on the
// same page -- they now live at /dashboard/approvals (see that route's
// own file), reached via the "Pending Approvals" link below. Nothing
// about their data-fetching is duplicated here; it moved, it didn't get
// copied.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = getRole(user.email);

  // Fetched here (server-side, on render) rather than from a client effect
  // -- Form6Generator and QuotationGenerator just receive their starting
  // data as props. This avoids a useEffect-triggered client fetch for the
  // initial render entirely (the react-hooks/set-state-in-effect rule
  // flags calling a setState-bearing function from an effect regardless of
  // async timing, so the real fix is not needing an effect for this at
  // all). Both components still refetch after that from their own
  // submit/edit handlers, but neither does so from a mount-time effect.
  let initialSubmission = null;
  let initialSubmissionError = "";
  try {
    const record = await findLatestSubmissionForUser(user.email ?? "");
    initialSubmission = record ? toClientSubmission(record) : null;
  } catch (err) {
    initialSubmissionError =
      err instanceof Error ? err.message : "Couldn't load your submission status.";
  }

  let initialQuotation: ReturnType<typeof toClientQuotation> | null = null;
  let initialQuotationError = "";
  try {
    const row = await findLatestQuotationForUser(supabase, user.email ?? "");
    initialQuotation = row ? toClientQuotation(row) : null;
  } catch (err) {
    initialQuotationError =
      err instanceof Error ? err.message : "Couldn't load your quotation status.";
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
            {role === "approver" && (
              <span className="rounded-full bg-brass/15 px-2.5 py-0.5 text-xs font-semibold text-brass">
                Approver
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {role === "approver" && (
            <Link
              href="/dashboard/approvals"
              className="rounded-full border border-forest/20 px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
            >
              Pending Approvals
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="mt-10">
        <DashboardTools
          form6={
            <Form6Generator
              submittedBy={user.email ?? "unknown"}
              initialSubmission={initialSubmission}
              initialSubmissionError={initialSubmissionError}
            />
          }
          quotations={
            <QuotationGenerator
              submittedBy={user.email ?? "unknown"}
              initialQuotation={initialQuotation}
              initialQuotationError={initialQuotationError}
            />
          }
        />
      </div>
    </div>
  );
}
