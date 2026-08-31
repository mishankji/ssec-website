/**
 * Hardcoded approver list for the Form-6 approval workflow.
 *
 * Anyone whose Supabase Auth email (case-insensitive) appears here is an
 * "approver" -- they see the Pending Approvals panel on the dashboard and
 * can approve/reject other employees' submissions. Everyone else with a
 * valid login is a plain "employee".
 *
 * There's no admin UI for this on purpose (the list is short and changes
 * rarely) -- to add or remove an approver, just edit this array and
 * redeploy.
 */
const APPROVER_EMAILS = ["mishank3333@gmail.com"];

export type Role = "approver" | "employee";

function normalize(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function getRole(email: string | null | undefined): Role {
  return APPROVER_EMAILS.includes(normalize(email)) ? "approver" : "employee";
}

export function isApprover(email: string | null | undefined): boolean {
  return getRole(email) === "approver";
}

/** All approver emails, lowercased -- used to address the notification email in notify-approvers.ts. */
export function getApproverEmails(): string[] {
  return APPROVER_EMAILS;
}
