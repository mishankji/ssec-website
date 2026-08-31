"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { FORM6_ITEM_CODES, type Form6ItemCode } from "@/lib/form6-item-codes";

const inputClasses =
  "w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brass";

export function CpcbCodeSelect({
  valueId,
  onChange,
}: {
  valueId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => FORM6_ITEM_CODES.find((c) => c.id === valueId) ?? null,
    [valueId]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FORM6_ITEM_CODES;
    return FORM6_ITEM_CODES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: Form6ItemCode) {
    onChange(item.id);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${inputClasses} flex items-center justify-between gap-2 text-left`}
      >
        <span className={selected ? "text-ink" : "text-ink/40"}>
          {selected ? `${selected.code} - ${selected.description}` : "Select a CPCB code..."}
        </span>
        <ChevronDown size={16} className="shrink-0 text-ink/40" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-forest/15 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-forest/10 px-3 py-2">
            <Search size={14} className="shrink-0 text-ink/40" />
            <input
              autoFocus
              type="text"
              placeholder="Search code or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-2 text-sm text-ink/50">No matching codes.</li>
            )}
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-sage/10"
                >
                  <span className="font-semibold text-forest">{item.code}</span>
                  <span className="text-xs text-ink/70">{item.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
