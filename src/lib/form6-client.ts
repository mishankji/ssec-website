/**
 * Maps a server-side Form6Record (google-sheets.ts) into the shape sent to
 * the browser -- drops nothing sensitive (there isn't anything to drop
 * here), but normalizes a couple of fields that are stored one way in the
 * sheet and consumed another way by the form:
 *
 * - transportMode is stored as "Self" / "Third Party" (for readability in
 *   the sheet) but the form's state uses "self" / "third-party".
 * - transporterName is stored as the literal string "Self" when
 *   transportMode is "Self" (also for sheet readability) -- that's not a
 *   real value to repopulate into a text input, so it comes back empty.
 */

import type { Form6Record } from "@/lib/google-sheets";

export interface ClientForm6Submission {
  submissionId: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason: string;
  formNumber: number | null;
  timestamp: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderAuthNo: string;
  transportMode: "self" | "third-party";
  transporterName: string;
  transporterAddress: string;
  transporterPhone: string;
  transporterRegNo: string;
  vehicleNumber: string;
  vehicleType: string;
  manifestDocNo: string;
  items: string;
  itemsJson: { codeId: string; freeText: string; unit: "kg" | "pcs"; quantity: string }[];
  submittedBy: string;
}

export function toClientSubmission(record: Form6Record): ClientForm6Submission {
  const isSelf = record.transportMode === "Self";
  return {
    submissionId: record.submissionId,
    status: record.status,
    rejectionReason: record.rejectionReason,
    formNumber: record.formNumber,
    timestamp: record.timestamp,
    senderName: record.senderName,
    senderAddress: record.senderAddress,
    senderPhone: record.senderPhone,
    senderAuthNo: record.senderAuthNo,
    transportMode: isSelf ? "self" : "third-party",
    transporterName: isSelf ? "" : record.transporterName,
    transporterAddress: isSelf ? "" : record.transporterAddress,
    transporterPhone: isSelf ? "" : record.transporterPhone,
    transporterRegNo: isSelf ? "" : record.transporterRegNo,
    vehicleNumber: record.vehicleNumber,
    vehicleType: record.vehicleType,
    manifestDocNo: record.manifestDocNo,
    items: record.items,
    itemsJson: record.itemsJson,
    submittedBy: record.submittedBy,
  };
}
