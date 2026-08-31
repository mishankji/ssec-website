/**
 * Renders a single Form-6 (E-Waste Manifest) as a one-page PDF, matching the
 * 13-field structure from the E-Waste (Management) Rules, 2016 (Form-6 /
 * see rule 19), laid out the way the company's own annotated copy fills it
 * in (Receiver block pre-filled, fields 11-13 always left blank for hand
 * signature/stamp/date after printing on colored copy stock).
 *
 * Uses pdf-lib, which runs both in the browser and in Node, so this can be
 * called directly from a client component's "Download PDF" button.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type Form6PdfUnit = "kg" | "pcs";

export interface Form6PdfItem {
  code: string;
  description: string;
  freeText?: string;
  /** Quantity is either/or: one item is logged in weight OR count, never both. */
  unit: Form6PdfUnit;
  quantity: string;
}

export interface Form6PdfData {
  formNumber: number;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  /** Merged Authorisation No. / GST No. field -- see field 2 below. */
  senderAuthNo?: string;
  /** Sender's purchase invoice / manifest document number -- distinct from the SR No. */
  manifestDocNo: string;
  transportMode: "self" | "third-party";
  transporterName: string;
  transporterAddress?: string;
  transporterPhone?: string;
  transporterRegNo?: string;
  vehicleNumber: string;
  vehicleType: string;
  items: Form6PdfItem[];
}

// Receiver is always S S Enviro Care -- never a form input (fields 8-9).
const RECEIVER_NAME = "S S Enviro Care";
const RECEIVER_ADDRESS_LINES = [
  "E216(B), RIA, Sarna Dungar, Jaipur, Rajasthan 302012",
  "Phone: 9654463036",
];
const RECEIVER_AUTH_NO = "UID: 138414";

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NUM_COL_W = 22;
const LABEL_COL_W = 150;
const VALUE_COL_X = MARGIN + NUM_COL_W + LABEL_COL_W;
const VALUE_COL_W = CONTENT_WIDTH - NUM_COL_W - LABEL_COL_W;

// Fixed layout for the fields 11-13 signature/stamp/date blocks (see
// drawSignatureRow below) -- defined once here so field 10's item table can
// compute exactly how much space is left for it above these fixed blocks.
const SIG_LABEL_ROW_H = 26;
const SIG_HEADER_ROW_H = 14;
const SIG_BLANK_ROW_H = 26;
const SIG_DATE_ROW_H = 30;
const SIG_BLOCK_H = SIG_LABEL_ROW_H + SIG_HEADER_ROW_H + SIG_BLANK_ROW_H + SIG_DATE_ROW_H;

// Default/max item-row height in field 10's table when there's room to
// spare -- shrinks (see field 10 below) only once more rows are added than
// fit at this size.
const ITEM_ROW_DEFAULT_H = 14;
const ITEM_ROW_DEFAULT_FONT = 7.5;
const ITEM_ROW_DEFAULT_QTY_FONT = 8;
const ITEM_ROW_MIN_FONT = 4.5;

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

export async function generateForm6Pdf(data: Form6PdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  // ---- Header ----
  page.drawText("S S ENVIRO CARE", { x: MARGIN, y: y - 10, size: 10, font: bold });
  page.drawText("GSTIN: 08MJTPS3949C1ZB", { x: MARGIN, y: y - 24, size: 8, font });
  page.drawText("FORM 6", {
    x: PAGE_WIDTH / 2 - bold.widthOfTextAtSize("FORM 6", 15) / 2,
    y: y - 12,
    size: 15,
    font: bold,
  });
  const srLabel = `SR No :- ${data.formNumber}`;
  page.drawText(srLabel, {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(srLabel, 11),
    y: y - 10,
    size: 11,
    font: bold,
  });
  y -= 34;
  const subtitle = "E-WASTE MANIFEST";
  page.drawText(subtitle, {
    x: PAGE_WIDTH / 2 - bold.widthOfTextAtSize(subtitle, 12) / 2,
    y,
    size: 12,
    font: bold,
  });
  y -= 20;

  // ---- Table helpers ----
  const rowStartX = MARGIN;
  const rowEndX = MARGIN + CONTENT_WIDTH;

  function drawRowFrame(topY: number, height: number) {
    page.drawRectangle({
      x: rowStartX,
      y: topY - height,
      width: CONTENT_WIDTH,
      height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    // vertical separators
    page.drawLine({
      start: { x: MARGIN + NUM_COL_W, y: topY },
      end: { x: MARGIN + NUM_COL_W, y: topY - height },
      thickness: 0.75,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: VALUE_COL_X, y: topY },
      end: { x: VALUE_COL_X, y: topY - height },
      thickness: 0.75,
      color: rgb(0, 0, 0),
    });
  }

  function drawSimpleRow(num: string, label: string, valueLines: string[], topY: number, minHeight = 30) {
    const lineHeight = 11;
    const height = Math.max(minHeight, valueLines.length * lineHeight + 14);
    drawRowFrame(topY, height);
    page.drawText(num, { x: rowStartX + 6, y: topY - 16, size: 9, font: bold });
    const labelLines = wrapText(bold, label, 8.5, LABEL_COL_W - 10);
    labelLines.forEach((line, i) => {
      page.drawText(line, { x: MARGIN + NUM_COL_W + 5, y: topY - 14 - i * 10, size: 8.5, font: bold });
    });
    valueLines.forEach((line, i) => {
      page.drawText(line, { x: VALUE_COL_X + 6, y: topY - 14 - i * lineHeight, size: 9, font });
    });
    return topY - height;
  }

  // Field 1: Sender name/address/phone (merged block)
  const senderLines = [
    data.senderName,
    ...wrapText(font, data.senderAddress, 9, VALUE_COL_W - 12),
    `Phone: ${data.senderPhone}`,
  ];
  y = drawSimpleRow("1", "Sender's name and mailing address (including Phone No.)", senderLines, y, 46);

  // Field 2: Sender's Authorization No. + GST (both collected, no separate official field for GST)
  const authValue = data.senderAuthNo && data.senderAuthNo.trim() ? data.senderAuthNo : "N/A";
  y = drawSimpleRow("2", "Sender's Authorization No. (if applicable)", [authValue], y);

  // Field 3: Manifest Document No. (sender's purchase invoice number -- distinct from the SR No.)
  y = drawSimpleRow("3", "Manifest Document No.", [data.manifestDocNo], y);

  // Field 4: Transporter's name/address/phone (merged block, same pattern as field 1's sender block above; just "Self" for self-transport)
  const transporterLines =
    data.transportMode === "self"
      ? ["Self"]
      : [
          data.transporterName,
          ...wrapText(font, data.transporterAddress ?? "", 9, VALUE_COL_W - 12),
          `Phone: ${data.transporterPhone ?? ""}`,
        ];
  y = drawSimpleRow(
    "4",
    "Transporter's name and address (including Phone No)",
    transporterLines,
    y,
    data.transportMode === "self" ? 30 : 46
  );

  // Field 5: Type of vehicle
  y = drawSimpleRow("5", "Type of Vehicle", [data.vehicleType], y);

  // Field 6: Transporter's registration No. (also carries GST/PAN of transporter, per house practice; N/A for Self)
  const regNo =
    data.transportMode === "self"
      ? "N/A (Self)"
      : data.transporterRegNo && data.transporterRegNo.trim()
        ? data.transporterRegNo
        : "N/A";
  y = drawSimpleRow("6", "Transporter's Registration No.", [regNo], y);

  // Field 7: Vehicle registration No.
  y = drawSimpleRow("7", "Vehicle Registration No.", [data.vehicleNumber], y);

  // Field 8: Receiver's name & address -- always hardcoded
  y = drawSimpleRow("8", "Receiver's Name & Address (including Phone No.)", [RECEIVER_NAME, ...RECEIVER_ADDRESS_LINES], y, 46);

  // Field 9: Receiver's Authorization No. -- always hardcoded
  y = drawSimpleRow("9", "Receiver's Authorization No.", [RECEIVER_AUTH_NO], y);

  // Field 10: Items table -- row height and item/qty font size shrink as the
  // item count grows so the table, plus the fixed-height signature blocks in
  // fields 11-13 right below it, always fit on this single page no matter
  // how many items are added (never overflow to a second page).
  {
    const headerH = 16;
    const itemCount = Math.max(1, data.items.length);

    // Whatever vertical room is left between here and the bottom margin,
    // once the three fixed-height signature blocks and this table's own
    // header row are accounted for, is what the item rows have to fit in.
    const availableForItemRows = y - MARGIN - SIG_BLOCK_H * 3 - headerH;
    const rowH = Math.max(1, Math.min(ITEM_ROW_DEFAULT_H, availableForItemRows / itemCount));
    const scale = rowH / ITEM_ROW_DEFAULT_H;
    const itemFontSize = Math.max(ITEM_ROW_MIN_FONT, ITEM_ROW_DEFAULT_FONT * scale);
    const qtyFontSize = Math.max(ITEM_ROW_MIN_FONT, ITEM_ROW_DEFAULT_QTY_FONT * scale);
    // Baseline sits the same proportion of the way down each row as it does
    // at the default row height (10pt down out of a 14pt row).
    const textBaselineOffset = Math.max(3, rowH * (10 / ITEM_ROW_DEFAULT_H));

    const tableH = headerH + itemCount * rowH;
    drawRowFrame(y, tableH);
    page.drawText("10", { x: rowStartX + 6, y: y - 16, size: 9, font: bold });
    wrapText(bold, "Description of E-Waste (Item, Weight/Numbers)", 8.5, LABEL_COL_W - 10).forEach((line, i) => {
      page.drawText(line, { x: MARGIN + NUM_COL_W + 5, y: y - 14 - i * 10, size: 8.5, font: bold });
    });

    // Sub-columns inside the value area: Items | Quantity (either weight OR count, never both).
    const qtyColW = 80;
    const itemsColW = VALUE_COL_W - qtyColW;
    const qtyColX = VALUE_COL_X + itemsColW;

    page.drawLine({ start: { x: qtyColX, y }, end: { x: qtyColX, y: y - tableH }, thickness: 0.5, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: VALUE_COL_X, y: y - headerH }, end: { x: rowEndX, y: y - headerH }, thickness: 0.5, color: rgb(0, 0, 0) });

    page.drawText("Items", { x: VALUE_COL_X + 4, y: y - 12, size: 8, font: bold });
    page.drawText("Quantity", { x: qtyColX + 4, y: y - 12, size: 8, font: bold });

    data.items.forEach((item, i) => {
      const rowTop = y - headerH - i * rowH;
      if (i > 0) {
        page.drawLine({ start: { x: VALUE_COL_X, y: rowTop }, end: { x: rowEndX, y: rowTop }, thickness: 0.4, color: rgb(0.6, 0.6, 0.6) });
      }
      const label = `${item.code} - ${item.description}${item.freeText && item.freeText.trim() ? `, ${item.freeText.trim()}` : ""}`;
      const [line1] = wrapText(font, label, itemFontSize, itemsColW - 8);
      page.drawText(line1, { x: VALUE_COL_X + 4, y: rowTop - textBaselineOffset, size: itemFontSize, font });
      const qtyLabel = item.quantity ? `${item.quantity} ${item.unit}` : "";
      page.drawText(qtyLabel, { x: qtyColX + 4, y: rowTop - textBaselineOffset, size: qtyFontSize, font });
    });

    y -= tableH;
  }

  // Fields 11-13: signature/stamp/date blocks -- always rendered blank. Each is a fixed
  // 4-row layout: full-width bold label, "Name & Stamp" / "Signature" headers, a blank
  // space for the actual signature/stamp, then Month/Day/Year digit boxes. No captions.
  function drawSignatureRow(num: string, label: string, topY: number) {
    const height = SIG_BLOCK_H;

    // Single outer frame -- no num/label/value column split for this block.
    page.drawRectangle({
      x: rowStartX,
      y: topY - height,
      width: CONTENT_WIDTH,
      height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    let cursorY = topY;

    // Row 1: full-width bold label (field number + description).
    wrapText(bold, `${num}. ${label}`, 8.5, CONTENT_WIDTH - 12).forEach((line, i) => {
      page.drawText(line, { x: rowStartX + 6, y: cursorY - 11 - i * 10, size: 8.5, font: bold });
    });
    cursorY -= SIG_LABEL_ROW_H;
    page.drawLine({ start: { x: rowStartX, y: cursorY }, end: { x: rowEndX, y: cursorY }, thickness: 0.75, color: rgb(0, 0, 0) });

    // Row 2: "Name & Stamp" / "Signature" column headers (no divider between them).
    const midX = rowStartX + CONTENT_WIDTH / 2;
    page.drawText("Name & Stamp", { x: rowStartX + 8, y: cursorY - 10, size: 8.5, font: bold });
    page.drawText("Signature", { x: midX + 8, y: cursorY - 10, size: 8.5, font: bold });
    cursorY -= SIG_HEADER_ROW_H;

    // Blank space for the actual signature/stamp -- intentionally empty, no caption, no divider lines.
    cursorY -= SIG_BLANK_ROW_H;

    // Row 3: right-aligned Month / Day / Year digit-entry boxes, always blank.
    const boxSize = 11;
    const gap = 2;
    const groupGap = 10;
    const groups: Array<[string, number]> = [
      ["Month", 2],
      ["Day", 2],
      ["Year", 4],
    ];
    const groupWidth = (digits: number) => digits * boxSize + (digits - 1) * gap;
    const totalGroupsWidth =
      groups.reduce((sum, [, digits]) => sum + groupWidth(digits), 0) + groupGap * (groups.length - 1);
    let bx = rowEndX - 8 - totalGroupsWidth;
    const boxY = cursorY - SIG_DATE_ROW_H + 6;
    groups.forEach(([groupLabel, digits]) => {
      const w = groupWidth(digits);
      page.drawText(groupLabel, {
        x: bx + w / 2 - font.widthOfTextAtSize(groupLabel, 6.5) / 2,
        y: boxY + boxSize + 4,
        size: 6.5,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      for (let d = 0; d < digits; d++) {
        page.drawRectangle({
          x: bx,
          y: boxY,
          width: boxSize,
          height: boxSize,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.75,
        });
        bx += boxSize + gap;
      }
      bx += groupGap - gap;
    });
    cursorY -= SIG_DATE_ROW_H;

    return topY - height;
  }

  y = drawSignatureRow("11", "Name and stamp of Sender (Manufacturer / Producer / Bulk Consumer / Collection Centre / Refurbisher / Dismantler)", y);
  y = drawSignatureRow("12", "Transporter Acknowledgement of Receipt of E-waste", y);
  y = drawSignatureRow("13", "Receiver (Collection Centre / Refurbisher / Dismantler / Recycler) certification of receipt of E-Waste", y);

  return doc.save();
}
