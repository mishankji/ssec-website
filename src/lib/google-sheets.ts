/**
 * Google Sheets integration for Form-6 submissions.
 *
 * Server-only: uses Node's `googleapis` client and secrets from
 * process.env. Never import this from a Client Component -- call it from
 * an API route (src/app/api/.../route.ts) or a Server Action instead. That
 * used to be enforced by this comment alone; the `import "server-only";`
 * below now makes an accidental Client Component import fail loudly at
 * build time instead of surfacing as a confusing bundler error (a
 * quotation-generator.tsx -> quotations.ts -> google-sheets.ts ->
 * googleapis chain hit exactly this: "Can't resolve 'child_process'").
 *
 * Auth: uses the OAuth refresh token set up via
 * scripts/get-google-refresh-token.mjs (see GOOGLE_OAUTH_* in .env.local).
 *
 * The Form-6 sheet (ID set via GOOGLE_SHEETS_FORM6_ID) needs a small
 * "_Counter" tab with cell A1 = 0 (the last-issued form number) and B1 left
 * blank (used as a lock flag) -- see the locking section below.
 */

import "server-only";

import { google, sheets_v4 } from "googleapis";
import { randomUUID } from "crypto";

/**
 * Pulls the actual Google API error message out of whatever shape googleapis
 * throws (a Gaxios error with response.data.error.message is the common
 * case), falling back to err.message or a plain String(). Used to enrich
 * every Sheets call's failure so the real cause (bad range/tab name, missing
 * permissions, wrong scope, etc.) reaches the console and, temporarily, the
 * API response -- instead of a generic "something went wrong".
 */
function describeGoogleApiError(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as {
      response?: { data?: { error?: { message?: string; status?: string } } };
      message?: string;
    };
    const apiMessage = anyErr.response?.data?.error?.message;
    const apiStatus = anyErr.response?.data?.error?.status;
    if (apiMessage) return apiStatus ? `${apiMessage} (${apiStatus})` : apiMessage;
    if (anyErr.message) return anyErr.message;
  }
  return String(err);
}

// ---------------------------------------------------------------------------
// Configuration -- adjust once the sheet is created.
// ---------------------------------------------------------------------------

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_FORM6_ID ?? "";

/**
 * Tab that holds the actual Form-6 submission rows. Set to "Records" to
 * match the tab name you used in your testing note -- if your sheet's data
 * tab is actually named something else, change this to match exactly
 * (case-sensitive, no extra spaces).
 */
const DATA_SHEET_NAME = "Records";

/**
 * Tab + cells used to track the auto-incrementing form number. Keeping the
 * counter on its own small tab (rather than deriving it from row count)
 * means the number survives rows later being sorted, filtered, or deleted.
 */
const COUNTER_SHEET_NAME = "_Counter";
const COUNTER_CELL = "A1"; // holds the last-issued form number (integer)
const LOCK_CELL = "B1"; // holds "<token>:<timestampMs>" while locked

const LOCK_TTL_MS = 15_000; // a lock older than this is treated as abandoned
const MAX_LOCK_ATTEMPTS = 30;

// ---------------------------------------------------------------------------
// Auth / client
// ---------------------------------------------------------------------------

function getOAuthClient() {
  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN } = process.env;

  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new Error(
      "Missing Google OAuth env vars (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / " +
        "GOOGLE_OAUTH_REFRESH_TOKEN). Run `npm run google:auth` and add the printed values to .env.local."
    );
  }

  const client = new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET);
  client.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
  return client;
}

let cachedSheets: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (!cachedSheets) {
    cachedSheets = google.sheets({ version: "v4", auth: getOAuthClient() });
  }
  return cachedSheets;
}

function assertConfigured() {
  if (!SPREADSHEET_ID) {
    throw new Error(
      "GOOGLE_SHEETS_FORM6_ID is not set. Add the Form-6 spreadsheet's ID to .env.local once it exists."
    );
  }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random jittered backoff so competing submissions don't retry in lockstep. */
function backoffDelay(attempt: number) {
  const base = Math.min(200 * 2 ** attempt, 2000);
  return base / 2 + Math.random() * (base / 2);
}

async function readRange(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return (res.data.values as string[][] | undefined) ?? [];
  } catch (err) {
    throw new Error(`Sheets read of "${range}" failed: ${describeGoogleApiError(err)}`);
  }
}

async function writeRange(range: string, values: (string | number)[][]): Promise<void> {
  const sheets = getSheetsClient();
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  } catch (err) {
    throw new Error(`Sheets write to "${range}" failed: ${describeGoogleApiError(err)}`);
  }
}

async function clearRange(range: string): Promise<void> {
  const sheets = getSheetsClient();
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
  } catch (err) {
    throw new Error(`Sheets clear of "${range}" failed: ${describeGoogleApiError(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Locking
//
// The Sheets API has no compare-and-swap for cell values, so a plain
// read-then-write is not safe if two submissions land at the same moment --
// both could read "41" and both write "42". This uses a simple advisory
// lock cell instead: before touching the counter, a submission "claims" the
// lock cell with a random token, re-reads it to confirm the claim won, does
// the increment, then releases it. It retries with jittered backoff if the
// lock is currently held by someone else.
//
// This is a well-known workaround, not a mathematically airtight distributed
// lock -- there is a (very small) window between the claim-write and the
// confirm-read where two claims could still collide. For human-paced form
// submissions this risk is negligible. If you ever need an airtight
// guarantee instead, the more robust alternative is to not track a mutable
// counter at all and derive the form number from row position with a sheet
// formula (e.g. `=ROW()-1` in the number column) -- Google serializes writes
// to a sheet server-side, so a formula tied to row position can never
// collide. That approach doesn't support custom formats (e.g. year-prefixed
// numbers) as easily, which is why this file uses an explicit counter.
// ---------------------------------------------------------------------------

async function acquireLock(): Promise<string> {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const lockRange = `${COUNTER_SHEET_NAME}!${LOCK_CELL}`;

  for (let attempt = 0; attempt < MAX_LOCK_ATTEMPTS; attempt++) {
    const [[existing] = []] = await readRange(lockRange);
    const [existingToken, existingTsRaw] = (existing ?? "").split(":");
    const existingTs = Number(existingTsRaw) || 0;
    const isFree = !existingToken || Date.now() - existingTs > LOCK_TTL_MS;

    if (isFree) {
      await writeRange(lockRange, [[`${token}:${Date.now()}`]]);
      // Re-read to confirm we actually hold it (guards against a
      // same-instant collision with another claim).
      const [[confirmed] = []] = await readRange(lockRange);
      if (confirmed?.startsWith(`${token}:`)) {
        return token;
      }
    }

    await sleep(backoffDelay(attempt));
  }

  throw new Error("Timed out waiting for the Form-6 counter lock. Please retry the submission.");
}

async function releaseLock(token: string): Promise<void> {
  const lockRange = `${COUNTER_SHEET_NAME}!${LOCK_CELL}`;
  const [[current] = []] = await readRange(lockRange);
  // Only clear it if it's still ours -- if it expired and someone else
  // claimed it in the meantime, clearing would release their lock, not ours.
  if (current?.startsWith(`${token}:`)) {
    await clearRange(lockRange);
  }
}

/**
 * Reads the current Form-6 counter WITHOUT claiming it -- for display only
 * (e.g. "Next SR No: 86" on the form before submission). Since this skips
 * the lock, the real number assigned at submit time via getNextFormNumber()
 * can differ if another submission lands first. Never use this value for
 * anything that ends up on a saved row.
 */
export async function peekNextFormNumber(): Promise<number> {
  assertConfigured();
  const counterRange = `${COUNTER_SHEET_NAME}!${COUNTER_CELL}`;
  const [[currentRaw] = []] = await readRange(counterRange);
  const current = Number(currentRaw) || 0;
  return current + 1;
}

/**
 * Reads the current Form-6 counter, increments it, and returns the new
 * value -- safe against concurrent submissions via the advisory lock above.
 */
export async function getNextFormNumber(): Promise<number> {
  assertConfigured();
  const token = await acquireLock();
  try {
    const counterRange = `${COUNTER_SHEET_NAME}!${COUNTER_CELL}`;
    const [[currentRaw] = []] = await readRange(counterRange);
    const current = Number(currentRaw) || 0;
    const next = current + 1;
    await writeRange(counterRange, [[next]]);
    return next;
  } finally {
    await releaseLock(token);
  }
}

// ---------------------------------------------------------------------------
// Form-6 row shape
// ---------------------------------------------------------------------------

// Matches the sheet's columns, in order: SR No, Timestamp, Sender Name,
// Sender Address, Sender Phone, Sender Auth No, Sender GST, Transport Mode,
// Transporter (name/address/phone merged into this one cell for
// third-party transport -- see formatTransporterCell/parseTransporterCell
// below), Transporter Reg No, Vehicle Number, Items, Submitted By,
// Manifest Doc No, Vehicle Type, Submission ID, Status, Rejection Reason,
// Items JSON.
//
// The last four columns were added for the owner-approval workflow, as new
// TRAILING columns (same reasoning as Manifest Doc No / Vehicle Type before
// them) so nothing already in the sheet shifts position. Add four new
// header columns named exactly "Submission ID", "Status", "Rejection
// Reason", and "Items JSON" (in that order) after "Vehicle Type" in the
// Records tab, or this will write into whatever columns happen to be there.
//
// - Submission ID: a random UUID, assigned once at first submission and
//   never reused -- the only reliable way to find/update "this specific
//   row" later (approve/reject/edit), since SR No. is no longer assigned
//   until approval and row position isn't a stable identifier.
// - Status: "Pending" | "Approved" | "Rejected". SR No. (column A) is left
//   blank until Status flips to "Approved".
// - Rejection Reason: the approver's reason, set on reject, cleared on
//   approve or resubmit.
// - Items JSON: a machine-readable copy of the submitted items
//   (`{ codeId, freeText, unit, quantity }[]`, JSON-encoded) used only to
//   repopulate the item rows when an employee edits/resubmits -- the
//   human-readable "Items" column (index 11) can't be parsed back
//   reliably (a few CPCB codes intentionally repeat across different
//   descriptions), so this is kept as a separate, edit-only source of
//   truth. Never shown to the user directly.
//
// Rows saved before this workflow existed have all four of these columns
// blank -- they're treated as historical/already-final and are excluded
// from every lookup below (findAllRecords filters out rows with no
// Submission ID).
const COL = {
  SR_NO: 0,
  TIMESTAMP: 1,
  SENDER_NAME: 2,
  SENDER_ADDRESS: 3,
  SENDER_PHONE: 4,
  SENDER_AUTH_NO: 5,
  SENDER_GST: 6,
  TRANSPORT_MODE: 7,
  TRANSPORTER_NAME: 8,
  TRANSPORTER_REG_NO: 9,
  VEHICLE_NUMBER: 10,
  ITEMS: 11,
  SUBMITTED_BY: 12,
  MANIFEST_DOC_NO: 13,
  VEHICLE_TYPE: 14,
  SUBMISSION_ID: 15,
  STATUS: 16,
  REJECTION_REASON: 17,
  ITEMS_JSON: 18,
} as const;

const RECORDS_DATA_RANGE = `${DATA_SHEET_NAME}!A2:S`; // data rows only, skip the header row
const recordRowRange = (rowNumber: number) => `${DATA_SHEET_NAME}!A${rowNumber}:S${rowNumber}`;

export type Form6Status = "Pending" | "Approved" | "Rejected";

export interface Form6ItemJson {
  codeId: string;
  freeText: string;
  unit: "kg" | "pcs";
  quantity: string;
}

export interface Form6Submission {
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  senderAuthNo: string;
  senderGst: string;
  transportMode: string;
  transporterName: string;
  transporterAddress: string;
  transporterPhone: string;
  transporterRegNo: string;
  vehicleNumber: string;
  items: string;
  itemsJson: Form6ItemJson[];
  submittedBy: string;
  manifestDocNo: string;
  vehicleType: string;
}

// The Transporter column stays a single cell (no new columns added for
// address/phone -- unlike Sender, whose name/address/phone are three
// separate columns, the Transporter cell was already just one column, and
// the ask here was to keep it that way). Third-party transport merges
// Name/Address/Phone into that one cell as three newline-separated lines,
// the same three-line shape field 4 of the PDF renders (see form6-pdf.ts);
// "Self" transport just stores the literal "Self", as before. Because the
// three lines are fixed positions (name, then address, then "Phone: X"),
// splitting back out on read is reliable -- no ambiguity like the CPCB
// item codes had, since a plain text input can't contain its own newlines.
function formatTransporterCell(mode: string, name: string, address: string, phone: string): string {
  if (mode === "Self") return "Self";
  return [name, address, `Phone: ${phone}`].join("\n");
}

function parseTransporterCell(
  mode: string,
  cell: string
): { transporterName: string; transporterAddress: string; transporterPhone: string } {
  if (mode === "Self") {
    return { transporterName: "Self", transporterAddress: "", transporterPhone: "" };
  }
  const [name = "", address = "", phoneLine = ""] = cell.split("\n");
  return {
    transporterName: name,
    transporterAddress: address,
    transporterPhone: phoneLine.replace(/^Phone:\s*/, ""),
  };
}

export interface Form6Record extends Form6Submission {
  submissionId: string;
  formNumber: number | null;
  timestamp: string;
  status: Form6Status;
  rejectionReason: string;
}

/** Internal-only: a record plus the actual sheet row it lives on, needed to write back to it. */
interface Form6RecordRow extends Form6Record {
  rowNumber: number;
}

function rowToRecord(row: string[], rowNumber: number): Form6RecordRow {
  let itemsJson: Form6ItemJson[] = [];
  try {
    const parsed = row[COL.ITEMS_JSON] ? JSON.parse(row[COL.ITEMS_JSON]) : [];
    if (Array.isArray(parsed)) itemsJson = parsed;
  } catch {
    itemsJson = []; // malformed/blank cell -- edit form just starts from scratch for items
  }

  const transportModeRaw = row[COL.TRANSPORT_MODE] ?? "";
  const transporter = parseTransporterCell(transportModeRaw, row[COL.TRANSPORTER_NAME] ?? "");

  return {
    submissionId: row[COL.SUBMISSION_ID] ?? "",
    formNumber: row[COL.SR_NO] ? Number(row[COL.SR_NO]) : null,
    timestamp: row[COL.TIMESTAMP] ?? "",
    senderName: row[COL.SENDER_NAME] ?? "",
    senderAddress: row[COL.SENDER_ADDRESS] ?? "",
    senderPhone: row[COL.SENDER_PHONE] ?? "",
    senderAuthNo: row[COL.SENDER_AUTH_NO] ?? "",
    senderGst: row[COL.SENDER_GST] ?? "",
    transportMode: transportModeRaw,
    transporterName: transporter.transporterName,
    transporterAddress: transporter.transporterAddress,
    transporterPhone: transporter.transporterPhone,
    transporterRegNo: row[COL.TRANSPORTER_REG_NO] ?? "",
    vehicleNumber: row[COL.VEHICLE_NUMBER] ?? "",
    items: row[COL.ITEMS] ?? "",
    itemsJson,
    submittedBy: row[COL.SUBMITTED_BY] ?? "",
    manifestDocNo: row[COL.MANIFEST_DOC_NO] ?? "",
    vehicleType: row[COL.VEHICLE_TYPE] ?? "",
    status: (row[COL.STATUS] as Form6Status) || "Pending",
    rejectionReason: row[COL.REJECTION_REASON] ?? "",
    rowNumber,
  };
}

function recordToRow(record: Form6Record): (string | number)[] {
  const row: (string | number)[] = [];
  row[COL.SR_NO] = record.formNumber ?? "";
  row[COL.TIMESTAMP] = record.timestamp;
  row[COL.SENDER_NAME] = record.senderName;
  row[COL.SENDER_ADDRESS] = record.senderAddress;
  row[COL.SENDER_PHONE] = record.senderPhone;
  row[COL.SENDER_AUTH_NO] = record.senderAuthNo;
  row[COL.SENDER_GST] = record.senderGst;
  row[COL.TRANSPORT_MODE] = record.transportMode;
  row[COL.TRANSPORTER_NAME] = formatTransporterCell(
    record.transportMode,
    record.transporterName,
    record.transporterAddress,
    record.transporterPhone
  );
  row[COL.TRANSPORTER_REG_NO] = record.transporterRegNo;
  row[COL.VEHICLE_NUMBER] = record.vehicleNumber;
  row[COL.ITEMS] = record.items;
  row[COL.SUBMITTED_BY] = record.submittedBy;
  row[COL.MANIFEST_DOC_NO] = record.manifestDocNo;
  row[COL.VEHICLE_TYPE] = record.vehicleType;
  row[COL.SUBMISSION_ID] = record.submissionId;
  row[COL.STATUS] = record.status;
  row[COL.REJECTION_REASON] = record.rejectionReason;
  row[COL.ITEMS_JSON] = JSON.stringify(record.itemsJson);
  return row;
}

async function appendRow(row: (string | number)[]): Promise<void> {
  assertConfigured();
  const sheets = getSheetsClient();
  const range = `${DATA_SHEET_NAME}!A:A`;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  } catch (err) {
    throw new Error(`Sheets append to "${range}" failed: ${describeGoogleApiError(err)}`);
  }
}

async function writeRecordRow(record: Form6RecordRow): Promise<void> {
  await writeRange(recordRowRange(record.rowNumber), [recordToRow(record)]);
}

/** Reads every submission row that belongs to this workflow (has a Submission ID), oldest first. */
async function findAllRecords(): Promise<Form6RecordRow[]> {
  assertConfigured();
  const rows = await readRange(RECORDS_DATA_RANGE);
  return rows
    .map((row, i) => rowToRecord(row, i + 2)) // +2: row 1 is the header, i is 0-based
    .filter((r) => r.submissionId);
}

async function findRecordById(submissionId: string): Promise<Form6RecordRow | null> {
  const records = await findAllRecords();
  return records.find((r) => r.submissionId === submissionId) ?? null;
}

/**
 * The employee's single most recent submission (by timestamp), regardless
 * of status -- this is deliberately "just the one they last submitted",
 * not a history list. Returns null if this email has never submitted
 * through the approval workflow.
 */
export async function findLatestSubmissionForUser(email: string): Promise<Form6Record | null> {
  const records = await findAllRecords();
  const mine = records.filter((r) => r.submittedBy.toLowerCase() === email.trim().toLowerCase());
  if (mine.length === 0) return null;
  mine.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return mine[0];
}

/** All Pending submissions, oldest first (so approvers see who's been waiting longest). */
export async function listPendingSubmissions(): Promise<Form6Record[]> {
  const records = await findAllRecords();
  return records
    .filter((r) => r.status === "Pending")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/** Just the count -- cheaper to reason about than listPendingSubmissions().length at call sites, same cost either way today. */
export async function countPendingSubmissions(): Promise<number> {
  const records = await findAllRecords();
  return records.filter((r) => r.status === "Pending").length;
}

/**
 * Saves a new submission as Pending. Unlike the old flow, this does NOT
 * claim a Form-6 number -- SR No. stays blank until an approver approves it
 * (see approveForm6 below), so a Rejected submission never burns a number.
 */
export async function submitForm6(submission: Form6Submission): Promise<{ submissionId: string }> {
  assertConfigured();
  const submissionId = randomUUID();
  const record: Form6Record = {
    ...submission,
    submissionId,
    formNumber: null,
    timestamp: new Date().toISOString(),
    status: "Pending",
    rejectionReason: "",
  };
  await appendRow(recordToRow(record));
  return { submissionId };
}

/**
 * Employee-initiated edit of their own existing submission -- used both for
 * "resubmit after rejection" (flips Status back to Pending and clears the
 * rejection reason) and for "fix a typo after approval" (leaves Status/SR
 * No. untouched; no re-approval needed, per the workflow's design).
 * Editing a still-Pending submission is allowed too and simply leaves it
 * Pending. Throws if the submission doesn't exist or isn't this user's.
 */
export async function updateForm6(
  submissionId: string,
  submittedBy: string,
  updates: Omit<Form6Submission, "submittedBy">
): Promise<Form6Record> {
  const existing = await findRecordById(submissionId);
  if (!existing) {
    throw new Error("That submission no longer exists.");
  }
  if (existing.submittedBy.trim().toLowerCase() !== submittedBy.trim().toLowerCase()) {
    throw new Error("You can only edit your own submission.");
  }

  const nextStatus: Form6Status = existing.status === "Rejected" ? "Pending" : existing.status;
  const updated: Form6RecordRow = {
    ...existing,
    ...updates,
    status: nextStatus,
    // Always cleared, not just on the Rejected -> Pending transition: it's
    // already blank for Pending/Approved rows, since only reject() ever
    // sets it. Written as a literal rather than a status check because
    // nextStatus can never actually be "Rejected" here.
    rejectionReason: "",
  };
  await writeRecordRow(updated);
  return updated;
}

/**
 * Approves a Pending submission: claims the next Form-6 number (via the
 * same advisory-locked counter as before, so numbers still never collide
 * or repeat) and flips Status to Approved. Safe to call twice on the same
 * submission by accident -- if it already has a number, that number is
 * kept rather than claiming a second one.
 */
export async function approveForm6(submissionId: string): Promise<Form6Record> {
  const existing = await findRecordById(submissionId);
  if (!existing) {
    throw new Error("That submission no longer exists.");
  }
  const formNumber = existing.formNumber ?? (await getNextFormNumber());
  const updated: Form6RecordRow = {
    ...existing,
    formNumber,
    status: "Approved",
    rejectionReason: "",
  };
  await writeRecordRow(updated);
  return updated;
}

/** Rejects a Pending submission with a reason. Leaves SR No. blank -- rejected submissions never claim a number. */
export async function rejectForm6(submissionId: string, reason: string): Promise<Form6Record> {
  const existing = await findRecordById(submissionId);
  if (!existing) {
    throw new Error("That submission no longer exists.");
  }
  const updated: Form6RecordRow = {
    ...existing,
    status: "Rejected",
    rejectionReason: reason.trim(),
  };
  await writeRecordRow(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Phase 3 (Quotation Generator), Step 5: approval logging to the
// "Quotations" tab (see scripts/create-quotations-sheet-tab.mjs for the
// header row this must match column-for-column). Quotations themselves
// live in Supabase, not Sheets -- this is a write-only append triggered by
// approveQuotation() in src/lib/quotations.ts, purely for the owner's
// existing paper-trail habit of keeping everything in one spreadsheet.
// Reuses this file's own auth client / error formatting rather than
// duplicating them.
// ---------------------------------------------------------------------------

const QUOTATIONS_SHEET_NAME = "Quotations";

export interface QuotationSheetItem {
  description: string;
  rate: string;
  unit: string;
  unit_other: string;
  quantity: string;
  amount: number;
}

export interface QuotationSheetLogEntry {
  quotationNumber: string; // full "QT/26-27/xxx"
  quotationDate: string; // ISO yyyy-mm-dd
  customerName: string;
  customerContact: string;
  customerAddress: string;
  rateOnly: boolean;
  items: QuotationSheetItem[];
  taxableAmount: number | null;
  sgstAmount: number | null;
  cgstAmount: number | null;
  totalAmount: number | null;
  submittedBy: string;
  approvedBy: string;
  approvedAt: string; // ISO timestamp
}

function quotationUnitLabel(unit: string, unitOther: string): string {
  return unit === "other" ? unitOther || "other" : unit;
}

/**
 * One line per item: "description x quantity unit @ rate/unit = amount" for
 * a priced quotation, or "description @ rate/unit" for rate-only (no
 * quantity/amount to show) -- exact wording per the brief. Joined with "; ".
 */
function quotationItemsSummary(items: QuotationSheetItem[], rateOnly: boolean): string {
  return items
    .map((item) => {
      const unitLabel = quotationUnitLabel(item.unit, item.unit_other);
      return rateOnly
        ? `${item.description} @ ${item.rate}/${unitLabel}`
        : `${item.description} x ${item.quantity} ${unitLabel} @ ${item.rate}/${unitLabel} = ${item.amount}`;
    })
    .join("; ");
}

/**
 * Appends one row to the "Quotations" tab for a just-approved quotation.
 * Called from approveQuotation() -- deliberately does NOT roll back the
 * Supabase approval if this fails (the approval in Supabase is the source
 * of truth; this sheet is a secondary log), so a Sheets hiccup never blocks
 * an approver. The caller wraps this in try/catch and only logs the
 * failure -- see the comment on that call site.
 */
export async function logApprovedQuotationToSheet(entry: QuotationSheetLogEntry): Promise<void> {
  assertConfigured();
  const row: (string | number)[] = [
    entry.quotationNumber,
    entry.quotationDate,
    entry.customerName,
    entry.customerContact,
    entry.customerAddress,
    entry.rateOnly ? "Yes" : "No",
    quotationItemsSummary(entry.items, entry.rateOnly),
    entry.taxableAmount ?? "",
    entry.sgstAmount ?? "",
    entry.cgstAmount ?? "",
    entry.totalAmount ?? "",
    entry.submittedBy,
    entry.approvedBy,
    entry.approvedAt,
  ];

  const sheets = getSheetsClient();
  const range = `${QUOTATIONS_SHEET_NAME}!A:A`;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  } catch (err) {
    throw new Error(`Sheets append to "${range}" failed: ${describeGoogleApiError(err)}`);
  }
}
