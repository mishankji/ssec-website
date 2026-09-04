"use client";

import { Trash2 } from "lucide-react";

// Ported from quotation-form-mockup.html's item row. A table row (not a
// card, unlike src/components/form6/item-row.tsx) -- the mockup's table
// layout is what we're matching here, not Form-6's card style.

export type QuotationUnit = "kg" | "unit" | "pc" | "other" | "";

export interface QuotationItemState {
  key: string;
  description: string;
  rate: string;
  unit: QuotationUnit;
  unitOther: string; // only used when unit === "other" -- the custom "₹/___" label
  quantity: string;
}

const cellInputClasses =
  "w-full rounded-md border border-forest/15 bg-white px-2.5 py-2 text-sm text-ink outline-none transition-colors focus:border-brass";

const UNIT_OPTIONS: Array<{ value: Exclude<QuotationUnit, "">; label: string }> = [
  { value: "kg", label: "₹/kg" },
  { value: "unit", label: "₹/unit" },
  { value: "pc", label: "₹/pc" },
  { value: "other", label: "Other…" },
];

/** The unit label shown next to Quantity -- synced live from the Unit dropdown, same as the mockup's qty-unit-label. */
function unitLabel(item: QuotationItemState): string {
  return item.unit === "other" ? item.unitOther : item.unit;
}

function parseNum(value: string): number {
  const n = parseFloat(value.replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuotationItemRow({
  item,
  index,
  rateOnly,
  onChange,
  onRemove,
}: {
  item: QuotationItemState;
  index: number;
  rateOnly: boolean;
  onChange: (next: QuotationItemState) => void;
  onRemove: () => void;
}) {
  const rate = parseNum(item.rate);
  const quantity = parseNum(item.quantity);
  const amount = rate * quantity;
  // Matches the mockup exactly: shown only once both rate AND quantity are
  // non-zero, and never at all in rate-only mode -- otherwise "—".
  const showAmount = !rateOnly && Boolean(rate) && Boolean(quantity);

  return (
    <tr className="border-b border-forest/10 odd:bg-white even:bg-sage/5">
      <td className="px-2 py-3 text-center text-xs text-ink/50">{index + 1}</td>
      <td className="px-2 py-2">
        <input
          type="text"
          placeholder="e.g. Desktop CPU, bare unit"
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          className={cellInputClasses}
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          placeholder="0.00"
          value={item.rate}
          onChange={(e) => onChange({ ...item, rate: e.target.value })}
          className={cellInputClasses}
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={item.unit}
          onChange={(e) => onChange({ ...item, unit: e.target.value as QuotationUnit })}
          className={cellInputClasses}
        >
          <option value="" disabled>
            Select…
          </option>
          {UNIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {item.unit === "other" && (
          <div className="mt-1.5 flex items-center gap-1 text-sm text-ink">
            ₹/
            <input
              type="text"
              placeholder="set"
              value={item.unitOther}
              onChange={(e) => onChange({ ...item, unitOther: e.target.value })}
              className={`${cellInputClasses} py-1.5`}
            />
          </div>
        )}
      </td>
      <td className="px-2 py-2">
        <div className={`flex items-center gap-1.5 ${rateOnly ? "pointer-events-none opacity-35" : ""}`}>
          <input
            type="text"
            placeholder="0"
            value={item.quantity}
            disabled={rateOnly}
            onChange={(e) => onChange({ ...item, quantity: e.target.value })}
            className={cellInputClasses}
          />
          <span className="whitespace-nowrap text-xs text-ink/60">{unitLabel(item)}</span>
        </div>
      </td>
      <td className="px-2 py-3 text-right text-sm font-semibold text-ink">
        {showAmount ? formatAmount(amount) : "—"}
      </td>
      <td className="px-1 py-3 text-center">
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove item ${index + 1}`}
          className="text-ink/40 transition-colors hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}
