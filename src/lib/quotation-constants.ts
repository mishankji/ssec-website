/**
 * Plain constants shared between server code and Client Components for
 * Quotations. Zero imports on purpose -- this file must stay safe for a
 * Client Component (quotation-generator.tsx) to import directly.
 *
 * src/lib/quotations.ts is NOT safe for that: it imports
 * src/lib/google-sheets.ts, which imports `googleapis` (a Node-only
 * package -- fails to bundle for the browser with "Can't resolve
 * 'child_process'"). Both of those files now start with `import
 * "server-only";` specifically so a mistake like importing a *value* from
 * either of them into a Client Component fails loudly at build time
 * instead of producing that confusing bundler error. Anything a Client
 * Component needs from the quotations domain belongs here instead.
 */

// Hardcoded on purpose -- updated manually each financial year, no
// auto-FY logic (per the Phase 3 brief). Shared between the client
// component (quotation-generator.tsx) and src/lib/quotations.ts so
// there's exactly one place to change it.
export const QUOTATION_NUMBER_PREFIX = "QT/26-27/";
