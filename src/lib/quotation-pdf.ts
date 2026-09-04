/**
 * Renders an approved quotation as a one-page PDF, matching the layout in
 * quotation-layout-mockup.html (header with logo/tagline/GSTIN on the left
 * and office contact details on the right, title + quotation no./date,
 * customer block, item table, totals, footer terms, signature block).
 *
 * Uses pdf-lib with the StandardFonts (Helvetica/Helvetica-Bold/
 * Helvetica-Oblique) -- same library and same "no new font assets" choice
 * as src/lib/form6-pdf.ts, for visual consistency between the two PDFs and
 * so this keeps working in both the browser and Node without embedding
 * anything beyond the company logo.
 *
 * IMPORTANT: the Rupee sign (₹) is not in WinAnsiEncoding, which is all the
 * standard 14 PDF fonts support -- pdf-lib throws at draw time if you try
 * to draw it with StandardFonts.Helvetica. Every place the mockup would
 * show "₹" (the Unit column's "₹/kg" etc., and money amounts) uses "Rs"
 * here instead, for the same reason the dashboard's own totals already do
 * (see formatCurrency in pending-quotations.tsx) -- not a stylistic choice,
 * a font-encoding constraint.
 *
 * Caller supplies the logo image bytes (an embedded PNG) rather than this
 * file reading from disk itself -- keeps this module environment-agnostic
 * (browser or Node) the same way form6-pdf.ts is; the one caller today
 * (src/app/api/quotations/[id]/pdf/route.ts) reads public/brand/logo.png
 * with node:fs since it runs server-side only.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { QuotationItemJson } from "@/lib/quotations";

export interface QuotationPdfData {
  quotationNumber: string; // full "QT/26-27/xxx"
  quotationDate: string; // ISO yyyy-mm-dd, as stored in quotations.quotation_date
  customerName: string;
  customerContact: string;
  customerAddress: string;
  rateOnly: boolean;
  items: QuotationItemJson[];
  taxableAmount: number | null;
  sgstAmount: number | null;
  cgstAmount: number | null;
  totalAmount: number | null;
}

// Company details -- same entity as Form-6's hardcoded receiver block (see
// RECEIVER_NAME / RECEIVER_ADDRESS_LINES / RECEIVER_AUTH_NO in
// form6-pdf.ts), reused here rather than re-typed differently.
//
// NOTE: the brief asks for a separate "Office address" and "Unit address"
// line. This project only has ONE address on record anywhere (footer.tsx,
// contact/page.tsx, and Form-6's own receiver block all use the same
// E216(B) address) -- there's no second address to pull from, so both
// lines use it for now. Flagged in the Step 5 summary; change these two
// constants if there's actually a distinct unit/warehouse address.
const COMPANY_NAME = "S S Enviro Care";
const COMPANY_TAGLINE = "Resources Responsibly Recovered.";
const COMPANY_GSTIN = "GSTIN: 08MJTPS3949C1ZB";
const OFFICE_ADDRESS_LINE = "Office: 84, Marudhar Nagar, Ajmer Road, Jaipur (302021), RJ";
const UNIT_ADDRESS_LINE = "Unit: E216 (B), RIA – Sarna Dungar, Jaipur (302012), RJ";
const COMPANY_PHONE = "+91 96544 63036";
const COMPANY_EMAIL = "info@ssenvirocare.in";

// Exact wording and order per the brief.
const FOOTER_TERMS = [
  "Valid for 7 days from the date of issue.",
  "Rates are indicative and subject to final inspection, weighment, and quality check at our facility.",
  "Payment: 100% on collection / as agreed, unless otherwise specified.",
  "This is a quotation, not a tax invoice. GST as applicable under law.",
  "Authorized under CPCB and RSPCB.",
  "For queries regarding this quotation, contact +91 96544 63036.",
];

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function formatMoney(n: number): string {
  return `Rs ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Resolves a stored unit ("kg" | "unit" | "pc" | "other") to its Unit-column display and the Quantity column's short form. */
function unitDisplay(unit: string, unitOther: string): { rateSuffix: string; qtyShort: string } {
  const other = (unitOther || "").trim() || "unit";
  switch (unit) {
    case "kg":
      return { rateSuffix: "Rs/kg", qtyShort: "kg" };
    case "unit":
      return { rateSuffix: "Rs/unit", qtyShort: "unit" };
    case "pc":
      return { rateSuffix: "Rs/pc", qtyShort: "pc" };
    case "other":
      return { rateSuffix: `Rs/${other}`, qtyShort: other };
    default:
      return { rateSuffix: "", qtyShort: "" };
  }
}

export async function generateQuotationPdf(
  data: QuotationPdfData,
  logoPngBytes: Uint8Array
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const logo = await doc.embedPng(logoPngBytes);

  const rowStartX = MARGIN;
  const rowEndX = MARGIN + CONTENT_WIDTH;

  // ---- Header: logo/tagline/GSTIN (left), office details (right), both
  // bottom-aligned to the same y so they read as one header band. ----
  let y = PAGE_HEIGHT - MARGIN;

  const logoWidth = 150;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  const leftLines = [
    { text: COMPANY_TAGLINE, size: 8.5, font: italic },
    { text: COMPANY_GSTIN, size: 8, font },
  ];
  const leftTextHeight = leftLines.length * 11;
  const leftBlockHeight = logoHeight + 5 + leftTextHeight;

  const rightLines = [OFFICE_ADDRESS_LINE, UNIT_ADDRESS_LINE, `Phone: ${COMPANY_PHONE}`, `Email: ${COMPANY_EMAIL}`];
  const rightLineSize = 8.5;
  const rightLineHeight = 11;
  const rightBlockHeight = rightLines.length * rightLineHeight;

  const headerBottomY = y - Math.max(leftBlockHeight, rightBlockHeight);

  // Left column: logo, then tagline (centered under the logo's width,
  // tucked close underneath it) and GSTIN (left-aligned, matching the
  // logo's left edge) below that.
  //
  // Tagline and GSTIN are positioned independently rather than via a
  // shared per-line loop -- GSTIN's y is still headerBottomY + 2, exactly
  // as before, so tightening the logo-to-tagline gap can't shift it.
  const logoY = headerBottomY + leftTextHeight + 5;
  page.drawImage(logo, { x: MARGIN, y: logoY, width: logoWidth, height: logoHeight });

  const [taglineLine, gstinLine] = leftLines;
  const taglineWidth = taglineLine.font.widthOfTextAtSize(taglineLine.text, taglineLine.size);
  const taglineY = logoY - 7; // tight gap under the logo
  page.drawText(taglineLine.text, {
    x: MARGIN + (logoWidth - taglineWidth) / 2,
    y: taglineY,
    size: taglineLine.size,
    font: taglineLine.font,
    opacity: 0.55, // faded so it doesn't visually compete with the logo above it
  });

  const gstinY = headerBottomY + 2; // unchanged from before this fix
  page.drawText(gstinLine.text, {
    x: MARGIN,
    y: gstinY,
    size: gstinLine.size,
    font: gstinLine.font,
  });

  // Right column: office/unit address, phone, email -- right-aligned,
  // bottom-aligned with the left column.
  rightLines.forEach((line, i) => {
    const lineY = headerBottomY + (rightLines.length - 1 - i) * rightLineHeight;
    page.drawText(line, {
      x: rowEndX - font.widthOfTextAtSize(line, rightLineSize),
      y: lineY,
      size: rightLineSize,
      font,
    });
  });

  y = headerBottomY - 14;
  page.drawLine({ start: { x: rowStartX, y }, end: { x: rowEndX, y }, thickness: 1, color: rgb(0.18, 0.29, 0.24) });
  y -= 22;

  // ---- Title + quotation no. / date ----
  page.drawText("Quotation", { x: MARGIN, y, size: 20, font: bold });
  const qNoLabel = `Quotation No: ${data.quotationNumber}`;
  const dateLabel = `Date: ${formatDate(data.quotationDate)}`;
  page.drawText(qNoLabel, { x: rowEndX - bold.widthOfTextAtSize(qNoLabel, 10.5), y: y + 5, size: 10.5, font: bold });
  page.drawText(dateLabel, { x: rowEndX - font.widthOfTextAtSize(dateLabel, 9.5), y: y - 9, size: 9.5, font });
  y -= 34;

  // ---- Customer block ----
  const custLines = [
    { label: "Customer: ", value: data.customerName },
    { label: "Contact: ", value: data.customerContact || "N/A" },
    { label: "Address: ", value: data.customerAddress || "N/A" },
  ];
  const custBoxH = custLines.length * 13 + 12;
  page.drawRectangle({
    x: rowStartX,
    y: y - custBoxH,
    width: CONTENT_WIDTH,
    height: custBoxH,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.75,
  });
  custLines.forEach((line, i) => {
    const lineY = y - 15 - i * 13;
    page.drawText(line.label, { x: rowStartX + 8, y: lineY, size: 9.5, font: bold });
    page.drawText(line.value, {
      x: rowStartX + 8 + bold.widthOfTextAtSize(line.label, 9.5),
      y: lineY,
      size: 9.5,
      font,
    });
  });
  y -= custBoxH + 18;

  // ---- Item table ----
  // Columns: SN | Description | Rate | Unit | Quantity | Amount.
  const COL = {
    sn: 24,
    desc: 188,
    rate: 65,
    unit: 65,
    qty: 87,
    amount: CONTENT_WIDTH - (24 + 188 + 65 + 65 + 87),
  };
  const colX = {
    sn: rowStartX,
    desc: rowStartX + COL.sn,
    rate: rowStartX + COL.sn + COL.desc,
    unit: rowStartX + COL.sn + COL.desc + COL.rate,
    qty: rowStartX + COL.sn + COL.desc + COL.rate + COL.unit,
    amount: rowStartX + COL.sn + COL.desc + COL.rate + COL.unit + COL.qty,
  };

  const headerH = 20;
  const itemCount = Math.max(1, data.items.length);
  // Reserve space for totals (if any), footer terms, and the signature
  // block below the table, then shrink item rows to fit whatever's left --
  // same one-page-guarantee approach form6-pdf.ts uses for its own table.
  const totalsH = data.rateOnly ? 0 : 74;
  const footerH = 14 + FOOTER_TERMS.length * 10 + 10;
  const signatureH = 70;
  const reserved = totalsH + footerH + signatureH;
  const defaultRowH = 20;
  const availableForRows = y - MARGIN - headerH - reserved;
  const rowH = Math.max(12, Math.min(defaultRowH, availableForRows / itemCount));
  const bodyFontSize = rowH >= 18 ? 9 : 7.5;

  const tableH = headerH + itemCount * rowH;
  page.drawRectangle({
    x: rowStartX,
    y: y - tableH,
    width: CONTENT_WIDTH,
    height: tableH,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.75,
  });
  page.drawRectangle({
    x: rowStartX,
    y: y - headerH,
    width: CONTENT_WIDTH,
    height: headerH,
    color: rgb(0.1843, 0.2902, 0.2431), // forest green #2F4A3E, matching the mockup
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.75,
  });
  const headerCells: Array<[string, number, number]> = [
    ["SN", colX.sn, COL.sn],
    ["Item Description", colX.desc, COL.desc],
    ["Rate", colX.rate, COL.rate],
    ["Unit", colX.unit, COL.unit],
    ["Quantity", colX.qty, COL.qty],
    ["Amount", colX.amount, COL.amount],
  ];
  headerCells.forEach(([label, x]) => {
    page.drawText(label, { x: x + 4, y: y - 14, size: 8.5, font: bold, color: rgb(1, 1, 1) });
  });
  [colX.desc, colX.rate, colX.unit, colX.qty, colX.amount].forEach((x) => {
    page.drawLine({ start: { x, y }, end: { x, y: y - tableH }, thickness: 0.5, color: rgb(0, 0, 0) });
  });

  data.items.forEach((item, i) => {
    const rowTop = y - headerH - i * rowH;
    const baseline = rowTop - rowH * 0.65;
    if (i > 0) {
      page.drawLine({
        start: { x: rowStartX, y: rowTop },
        end: { x: rowEndX, y: rowTop },
        thickness: 0.4,
        color: rgb(0.7, 0.7, 0.7),
      });
    }
    const { rateSuffix, qtyShort } = unitDisplay(item.unit, item.unit_other);
    const [descLine] = wrapText(font, item.description, bodyFontSize, COL.desc - 8);

    page.drawText(String(i + 1), { x: colX.sn + 4, y: baseline, size: bodyFontSize, font });
    page.drawText(descLine, { x: colX.desc + 4, y: baseline, size: bodyFontSize, font });
    page.drawText(item.rate, { x: colX.rate + 4, y: baseline, size: bodyFontSize, font });
    page.drawText(rateSuffix, { x: colX.unit + 4, y: baseline, size: bodyFontSize, font });

    const qtyText = data.rateOnly ? "—" : `${item.quantity} ${qtyShort}`.trim();
    page.drawText(qtyText, { x: colX.qty + 4, y: baseline, size: bodyFontSize, font });

    const amountText = data.rateOnly ? "—" : formatMoney(item.amount);
    const amountX = colX.amount + COL.amount - 4 - font.widthOfTextAtSize(amountText, bodyFontSize);
    page.drawText(amountText, { x: amountX, y: baseline, size: bodyFontSize, font });
  });

  y -= tableH + 12;

  // ---- Totals (omitted entirely for rate-only quotations) ----
  if (!data.rateOnly) {
    const totalsRows: Array<[string, number, boolean]> = [
      ["Taxable Amount", data.taxableAmount ?? 0, false],
      ["SGST @ 9%", data.sgstAmount ?? 0, false],
      ["CGST @ 9%", data.cgstAmount ?? 0, false],
      ["Total Amount", data.totalAmount ?? 0, true],
    ];
    const totalsBoxW = 220;
    const totalsBoxX = rowEndX - totalsBoxW;
    totalsRows.forEach(([label, value, isTotal], i) => {
      const lineY = y - i * 15;
      const f = isTotal ? bold : font;
      const size = isTotal ? 10.5 : 9.5;
      page.drawText(label, { x: totalsBoxX, y: lineY, size, font: f });
      const valueText = formatMoney(value);
      page.drawText(valueText, {
        x: rowEndX - f.widthOfTextAtSize(valueText, size),
        y: lineY,
        size,
        font: f,
      });
    });
    if (totalsRows.length > 1) {
      page.drawLine({
        start: { x: totalsBoxX, y: y - (totalsRows.length - 1) * 15 + 11 },
        end: { x: rowEndX, y: y - (totalsRows.length - 1) * 15 + 11 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
    y -= totalsRows.length * 15 + 10;
  } else {
    page.drawText("Rate-only quotation — no totals apply.", {
      x: MARGIN,
      y,
      size: 8.5,
      font: italic,
      color: rgb(0.6, 0.5, 0.2),
    });
    y -= 18;
  }

  // ---- Footer terms ----
  y -= 8;
  page.drawText("Terms & Conditions", { x: MARGIN, y, size: 9.5, font: bold });
  y -= 13;
  FOOTER_TERMS.forEach((term, i) => {
    page.drawText(`${i + 1}. ${term}`, { x: MARGIN, y, size: 7.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 10;
  });

  // ---- Signature block (blank space, then "For S S Enviro Care" / "Authorized Signatory") ----
  y -= 40;
  const sigLabel = `For ${COMPANY_NAME}`;
  const sigSub = "Authorized Signatory";
  page.drawText(sigLabel, { x: rowEndX - bold.widthOfTextAtSize(sigLabel, 10), y, size: 10, font: bold });
  page.drawText(sigSub, { x: rowEndX - font.widthOfTextAtSize(sigSub, 9), y: y - 26, size: 9, font });

  return doc.save();
}
