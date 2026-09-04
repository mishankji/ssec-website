/**
 * Maps a server-side QuotationRow (src/lib/quotations.ts) into the
 * camelCase shape sent to the browser -- same role form6-client.ts plays
 * for Form6Record / ClientForm6Submission.
 */

import type { QuotationRow, QuotationItemJson } from "@/lib/quotations";

export interface ClientQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  rateOnly: boolean;
  items: QuotationItemJson[];
  taxableAmount: number | null;
  sgstAmount: number | null;
  cgstAmount: number | null;
  totalAmount: number | null;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export function toClientQuotation(row: QuotationRow): ClientQuotation {
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    quotationDate: row.quotation_date,
    customerName: row.customer_name,
    customerContact: row.customer_contact,
    customerAddress: row.customer_address,
    rateOnly: row.rate_only,
    items: row.items,
    taxableAmount: row.taxable_amount,
    sgstAmount: row.sgst_amount,
    cgstAmount: row.cgst_amount,
    totalAmount: row.total_amount,
    status: row.status,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}
