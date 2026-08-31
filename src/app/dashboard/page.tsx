import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findLatestSubmissionForUser, listPendingSubmissions } from "@/lib/google-sheets";
import { toClientSubmission } from "@/lib/form6-client";
import { getRole } from "@/lib/roles";
import { SignOutButton } from "./sign-out-button";
import { Form6Generator } from "@/components/form6/form6-generator";
import { PendingApprovals } from "@/components/form6/pending-approvals";

export const metadata: Metadata = {
  title: "Dashboard",
};

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
  // -- Form6Generator and PendingApprovals just receive their starting data
  // as props. This avoids a useEffect-triggered client fetch for the
  // initial render entirely (the react-hooks/set-state-in-effect rule
  // flags calling a setState-bearing function from an effect regardless of
  // async timing, so the real fix is not needing an effect for this at
  // all). Both components still refetch after that -- Form6Generator from
  // its submit/edit handlers, PendingApprovals on a polling interval -- but
  // neither does so from a mount-time effect.
  let initialSubmission = null;
  let initialSubmissionError = "";
  try {
    const record = await findLatestSubmissionForUser(user.email ?? "");
    initialSubmission = record ? toClientSubmission(record) : null;
  } catch (err) {
    initialSubmissionError =
      err instanceof Error ? err.message : "Couldn't load your submission status.";
  }

  let initialPending: ReturnType<typeof toClientSubmission>[] = [];
  let initialPendingError = "";
  if (role === "approver") {
    try {
      const records = await listPendingSubmissions();
      initialPending = records.map(toClientSubmission);
    } catch (err) {
      initialPendingError =
        err instanceof Error ? err.message : "Couldn't load pending submissions.";
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-forest">
            Employee Dashboard
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
        <SignOutButton />
      </div>

      {role === "approver" && (
        <div className="mt-10">
          <PendingApprovals initialSubmissions={initialPending} initialError={initialPendingError} />
        </div>
      )}

      <div className="mt-10">
        <Form6Generator
          submittedBy={user.email ?? "unknown"}
          initialSubmission={initialSubmission}
          initialSubmissionError={initialSubmissionError}
        />
      </div>
    </div>
  );
}
