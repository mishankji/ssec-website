/**
 * Emails every approver (see roles.ts) when a new Form-6 submission comes
 * in as Pending. Uses the same Resend setup as the contact form
 * (src/app/api/contact/route.ts), but sends from an address on the
 * company's verified domain rather than the resend.dev sandbox address --
 * that sandbox address only reaches the Resend account owner's own
 * verified inbox, which wouldn't reliably reach every approver.
 *
 * Best-effort: callers should not fail a submission just because the
 * notification email didn't go out (see the .catch() at the submit route's
 * call site). A missing/failed email is logged, never thrown past this
 * file, since the submission itself already saved successfully by the
 * time this runs.
 */

import { Resend } from "resend";
import { getApproverEmails } from "@/lib/roles";

const FROM_ADDRESS = "Form-6 Approvals <ms.dir@ssenvirocare.in>";

export interface NewSubmissionNotice {
  senderName: string;
  manifestDocNo: string;
  submittedBy: string;
}

export async function notifyApproversOfNewSubmission(notice: NewSubmissionNotice): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const approverEmails = getApproverEmails();

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set -- approver notification was not emailed.");
    return;
  }
  if (approverEmails.length === 0) {
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const dashboardLine = siteUrl ? `\nReview it here: ${siteUrl.replace(/\/$/, "")}/dashboard` : "";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: approverEmails,
      subject: `Form-6 pending approval -- ${notice.senderName}`,
      text: [
        `A new Form-6 submission is waiting for your approval.`,
        ``,
        `Sender: ${notice.senderName}`,
        `Manifest Document No.: ${notice.manifestDocNo}`,
        `Submitted by: ${notice.submittedBy}`,
        dashboardLine,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend failed to send the approver notification:", error);
    }
  } catch (err) {
    console.error("Approver notification failed:", err);
  }
}
