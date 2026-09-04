#!/usr/bin/env node
/**
 * Phase 3 (Quotation Generator), Step 1: adds a "Quotations" tab with a
 * header row to the existing Form-6 spreadsheet (GOOGLE_SHEETS_FORM6_ID) --
 * reusing that same spreadsheet, per your call, rather than a new one.
 *
 * This ONLY creates the tab and writes the header row. It does not write
 * any quotation data -- that's wired up in a later step.
 *
 * Safe to re-run: if a "Quotations" tab already exists, this exits without
 * touching it (no duplicate tabs, no header row overwritten).
 *
 * Usage:  node scripts/create-quotations-sheet-tab.mjs
 *    or:  npm run sheets:add-quotations-tab
 *
 * Requires the same Google OAuth env vars Form-6 already uses
 * (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET /
 * GOOGLE_OAUTH_REFRESH_TOKEN -- see scripts/get-google-refresh-token.mjs)
 * plus GOOGLE_SHEETS_FORM6_ID, all read from .env.local.
 */

import { existsSync, readFileSync } from "node:fs";
import { google } from "googleapis";

// Minimal .env.local loader so this script works standalone (same helper
// as scripts/get-google-refresh-token.mjs).
function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}
loadEnvLocal();

const TAB_NAME = "Quotations";
const HEADER_ROW = [
  "Quotation No",
  "Date",
  "Customer Name",
  "Contact",
  "Address",
  "Rate Only",
  "Items Summary",
  "Taxable Amount",
  "SGST",
  "CGST",
  "Total Amount",
  "Submitted By",
  "Approved By",
  "Approved At",
];

const {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REFRESH_TOKEN,
  GOOGLE_SHEETS_FORM6_ID,
} = process.env;

function requireEnv() {
  const missing = [
    ["GOOGLE_OAUTH_CLIENT_ID", GOOGLE_OAUTH_CLIENT_ID],
    ["GOOGLE_OAUTH_CLIENT_SECRET", GOOGLE_OAUTH_CLIENT_SECRET],
    ["GOOGLE_OAUTH_REFRESH_TOKEN", GOOGLE_OAUTH_REFRESH_TOKEN],
    ["GOOGLE_SHEETS_FORM6_ID", GOOGLE_SHEETS_FORM6_ID],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    console.error(
      `Missing env var(s): ${missing.map(([name]) => name).join(", ")}.\n` +
        "Set them in .env.local (same values Form-6 already uses) and re-run."
    );
    process.exit(1);
  }
}

function getSheetsClient() {
  const auth = new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
  return google.sheets({ version: "v4", auth });
}

async function main() {
  requireEnv();
  const sheets = getSheetsClient();
  const spreadsheetId = GOOGLE_SHEETS_FORM6_ID;

  const { data: spreadsheet } = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = spreadsheet.sheets?.find((s) => s.properties?.title === TAB_NAME);

  if (existing) {
    console.log(`"${TAB_NAME}" tab already exists (sheetId ${existing.properties.sheetId}) -- nothing to do.`);
    return;
  }

  const addSheetRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
    },
  });

  const newSheetId = addSheetRes.data.replies?.[0]?.addSheet?.properties?.sheetId;
  console.log(`Created "${TAB_NAME}" tab (sheetId ${newSheetId}).`);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TAB_NAME}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [HEADER_ROW] },
  });

  console.log(`Wrote header row to "${TAB_NAME}!A1:N1". Nothing else was written -- no quotation data yet.`);
}

main().catch((err) => {
  console.error("Failed to create the Quotations tab:", err?.response?.data?.error?.message ?? err);
  process.exit(1);
});
