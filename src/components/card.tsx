import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-forest/10 bg-white p-6 shadow-sm transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:bg-sage/5 hover:shadow-lg hover:shadow-forest/10 hover:border-brass/40",
        className
      )}
    >
      {children}
    </div>
  );
}
