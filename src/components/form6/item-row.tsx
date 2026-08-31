"use client";

import { Trash2 } from "lucide-react";
import { CpcbCodeSelect } from "./cpcb-code-select";
import {
  FORM6_ITEM_CODES,
  formatForm6ItemValue,
  type Form6ItemUnit,
} from "@/lib/form6-item-codes";

const inputClasses =
  "w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brass";

export interface ItemRowState {
  key: string;
  codeId: string;
  freeText: string;
  unit: Form6ItemUnit;
  quantity: string;
}

const UNIT_OPTIONS: Array<{ value: Form6ItemUnit; label: string }> = [
  { value: "kg", label: "Weight (kg)" },
  { value: "pcs", label: "Numbers (pcs)" },
];

export function ItemRow({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  item: ItemRowState;
  index: number;
  onChange: (next: ItemRowState) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const selectedCode = FORM6_ITEM_CODES.find((c) => c.id === item.codeId);

  return (
    <div className="rounded-xl border border-forest/10 bg-sage/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Item {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-ink/40 transition-colors hover:text-red-600"
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">CPCB Code</label>
          <CpcbCodeSelect
            valueId={item.codeId}
            onChange={(codeId) => onChange({ ...item, codeId })}
          />
        </div>

        {selectedCode && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Additional detail <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              type="text"
              placeholder='e.g. "Mouse", "Keyboard"'
              value={item.freeText}
              onChange={(e) => onChange({ ...item, freeText: e.target.value })}
              className={inputClasses}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Quantity type</label>
          <div className="inline-flex rounded-full border border-forest/15 p-1">
            {UNIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...item, unit: opt.value })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  item.unit === opt.value
                    ? "bg-forest text-offwhite"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            {item.unit === "kg" ? "Weight (kg)" : "Numbers (pcs)"}
          </label>
          <input
            type="text"
            inputMode={item.unit === "kg" ? "decimal" : "numeric"}
            placeholder={item.unit === "kg" ? "0.0" : "0"}
            value={item.quantity}
            onChange={(e) => onChange({ ...item, quantity: e.target.value })}
            className={inputClasses}
          />
        </div>

        {selectedCode && (item.freeText || item.quantity) && (
          <p className="text-xs text-ink/50">
            Will be recorded as:{" "}
            <span className="font-medium text-ink/70">{formatForm6ItemValue(item, "sheet")}</span>
          </p>
        )}
      </div>
    </div>
  );
}
