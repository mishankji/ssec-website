import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client -- safe to use in Client Components.
// NEXT_PUBLIC_SUPABASE_ANON_KEY holds the project's publishable key,
// which is meant to be exposed to the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
