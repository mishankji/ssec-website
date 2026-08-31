/**
 * Shared request-body validation and shaping for the Form-6 submit and
 * update API routes -- both accept the same shape (a brand-new submission
 * and an edit/resubmit of an existing one differ only in whether a
 * submissionId is attached), so the checks and the mapping into the
 * Google Sheets row shape live here once instead of twice.
 */

import { FORM6_ITEM_CODES, formatForm6ItemValue } from "@/lib/form6-item-codes";
import type { Form6ItemJson, Form6Submission } from "@/lib/google-sheets";

export interface SubmitItemInput {
  codeId?: string;
  freeText?: string;
  unit?: "kg" | "pcs";
  quantity?: string;
}

export interface SubmitBodyInput {
  senderName?: string;
  senderAddress?: string;
  senderPhone?: string;
  senderAuthNo?: string;
  senderGst?: string;
  manifestDocNo?: string;
  transportMode?: "self" | "third-party";
  transporterName?: string;
  transporterAddress?: string;
  transporterPhone?: string;
  transporterRegNo?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  items?: SubmitItemInput[];
}

const VEHICLE_TYPES = ["Special Vehicle", "Truck", "Tanker"];

/** Returns a user-facing error message if the body is invalid, or null if it's well-formed. */
export function validateForm6Body(body: SubmitBodyInput): string | null {
  const {
    senderName,
    senderAddress,
    senderPhone,
    manifestDocNo,
    transportMode,
    transporterName,
    transporterAddress,
    transporterPhone,
    transporterRegNo,
    vehicleNumber,
    vehicleType,
    items,
  } = body;

  if (!senderName?.trim() || !senderAddress?.trim() || !senderPhone?.trim()) {
    return "Sender name, address, and phone are required.";
  }
  if (!manifestDocNo?.trim()) {
    return "Manifest Document No. is required.";
  }
  if (transportMode !== "self" && transportMode !== "third-party") {
    return "Invalid transport mode.";
  }
  if (
    transportMode === "third-party" &&
    (!transporterName?.trim() || !transporterAddress?.trim() || !transporterPhone?.trim() || !transporterRegNo?.trim())
  ) {
    return "Transporter name, address, phone, and registration No. / GST-PAN are required for third-party transport.";
  }
  if (!vehicleNumber?.trim()) {
    return "Vehicle number is required.";
  }
  if (!vehicleType || !VEHICLE_TYPES.includes(vehicleType)) {
    return "Please select a type of vehicle.";
  }
  if (!items || items.length === 0) {
    return "At least one item is required.";
  }
  for (const [i, item] of items.entries()) {
    const found = item.codeId ? FORM6_ITEM_CODES.find((c) => c.id === item.codeId) : undefined;
    if (!found) {
      return `Item ${i + 1}: please select a valid CPCB code.`;
    }
    if (item.unit !== "kg" && item.unit !== "pcs") {
      return `Item ${i + 1}: please choose a quantity type (weight or count).`;
    }
    if (!item.quantity?.trim()) {
      return `Item ${i + 1}: quantity is required.`;
    }
  }
  return null;
}

/**
 * Maps a validated body (call only after validateForm6Body returns null)
 * into the shape google-sheets.ts's submitForm6/updateForm6 expect.
 * `submittedBy` isn't included -- callers attach the authenticated user's
 * email themselves, never a value the client sent.
 */
export function shapeForm6Submission(body: SubmitBodyInput): Omit<Form6Submission, "submittedBy"> {
  const {
    senderName,
    senderAddress,
    senderPhone,
    senderAuthNo,
    senderGst,
    manifestDocNo,
    transportMode,
    transporterName,
    transporterAddress,
    transporterPhone,
    transporterRegNo,
    vehicleNumber,
    vehicleType,
    items,
  } = body;

  // Sheet column value: "{CODE} - {free text} — {quantity} {kg or pcs}" (or,
  // with no free text, "{CODE} — {quantity} {kg or pcs}") per item, one per
  // line -- quantity is either/or (weight OR count, never both). The CPCB
  // description is intentionally left out of the Sheet (see "sheet" mode in
  // formatForm6ItemValue) -- the PDF keeps the full description separately.
  const itemsValue = items!
    .map((item) =>
      formatForm6ItemValue(
        { codeId: item.codeId!, freeText: item.freeText, unit: item.unit!, quantity: item.quantity! },
        "sheet"
      )
    )
    .join("\n");

  const itemsJson: Form6ItemJson[] = items!.map((item) => ({
    codeId: item.codeId!,
    freeText: item.freeText?.trim() || "",
    unit: item.unit!,
    quantity: item.quantity!.trim(),
  }));

  return {
    senderName: senderName!.trim(),
    senderAddress: senderAddress!.trim(),
    senderPhone: senderPhone!.trim(),
    senderAuthNo: senderAuthNo?.trim() || "",
    senderGst: senderGst?.trim() || "",
    transportMode: transportMode === "self" ? "Self" : "Third Party",
    transporterName: transportMode === "self" ? "Self" : (transporterName ?? "").trim(),
    transporterAddress: transportMode === "self" ? "" : (transporterAddress ?? "").trim(),
    transporterPhone: transportMode === "self" ? "" : (transporterPhone ?? "").trim(),
    transporterRegNo: transportMode === "self" ? "" : (transporterRegNo ?? "").trim(),
    vehicleNumber: vehicleNumber!.trim(),
    items: itemsValue,
    itemsJson,
    manifestDocNo: manifestDocNo!.trim(),
    vehicleType: vehicleType!,
  };
}
