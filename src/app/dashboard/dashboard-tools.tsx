"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// The dashboard had only one tool (Form-6) until now, so there was no
// existing tab/nav component to extend -- this reuses the one UI pattern
// this project already has for switching between two options (the
// Self / Third-party segmented control in form6-generator.tsx), just at
// page-nav scale instead of within a form section.
//
// Kept as a client component separate from page.tsx so page.tsx can stay
// a Server Component (it fetches Form-6's and Quotations' initial data
// server-side) -- this just receives each tab's already-built content as
// a prop and handles which one is visible.
//
// The active tab lives in the URL (?tab=quotations), not localStorage, so
// a refresh lands back on whichever tab you were on and the URL is
// shareable/bookmarkable to a specific tab. It's read and written via the
// native History API (window.history.replaceState), not Next's router --
// App Router has no "shallow routing" option the old Pages Router had,
// and page.tsx doesn't read searchParams itself, so a router.push/replace
// here would re-run the whole Server Component (every Supabase query on
// the page) just to flip a UI tab. history.replaceState updates the
// address bar with none of that round trip; on an actual page load/
// refresh, useSearchParams below reads whatever's really in the URL, so
// the tab is still correct.

const TABS = [
  { id: "form6", label: "Form-6" },
  { id: "quotations", label: "Quotation" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

function DashboardToolsInner({ form6, quotations }: { form6: ReactNode; quotations: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(isTabId(tabParam) ? tabParam : "form6");

  // Stay in sync if the URL's ?tab changes from outside a click here --
  // back/forward navigation, or landing directly on a shared
  // ?tab=quotations link.
  useEffect(() => {
    setActiveTab(isTabId(tabParam) ? tabParam : "form6");
  }, [tabParam]);

  function selectTab(id: TabId) {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id === "form6") {
      // "form6" is the default -- an old bookmark to plain /dashboard
      // (no ?tab at all) should keep behaving exactly like it did before
      // this existed, so the default tab never needs the param written.
      params.delete("tab");
    } else {
      params.set("tab", id);
    }
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-forest/15 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? "bg-forest text-offwhite" : "text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "form6" ? form6 : quotations}
    </div>
  );
}

// useSearchParams() requires a Suspense boundary somewhere above it in the
// tree (Next.js will otherwise fail the build) -- wrapping right here
// keeps that self-contained instead of pushing it onto page.tsx. The
// fallback is never visible in practice: page.tsx is already fully
// dynamic (it checks auth via cookies), so this renders with the real
// searchParams on the first pass rather than suspending.
export function DashboardTools(props: { form6: ReactNode; quotations: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardToolsInner {...props} />
    </Suspense>
  );
}
