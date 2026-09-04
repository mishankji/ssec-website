-- Phase 3 (Quotation Generator), Step 1: data model only.
--
-- Mirrors how Form-6 handles employee vs. approver access: after checking
-- src/lib/roles.ts and the form6 API routes, it turns out Form-6 doesn't
-- use a Supabase table (or RLS) at all -- its data lives in Google Sheets,
-- and "employee vs. approver" is decided purely in the Next.js API routes
-- via the hardcoded APPROVER_EMAILS list in src/lib/roles.ts.
--
-- Per your call: keep that exact split. RLS on this table only requires
-- the caller to be a logged-in Supabase Auth user (the built-in
-- `authenticated` Postgres role) -- it does not try to distinguish
-- employee from approver at the database level. That distinction stays
-- entirely in the API routes you'll add under src/app/api/quotations/*,
-- gated with isApprover() from src/lib/roles.ts, the same way
-- src/app/api/form6/approve/route.ts and src/app/api/form6/pending/route.ts
-- do it today.

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),

  -- e.g. "QT/26-27/015" -- NOT unique; duplicate warnings are handled in
  -- the app layer, not enforced here (per your instructions).
  quotation_number text,
  quotation_date date,

  customer_name text,
  customer_contact text,
  customer_address text,

  rate_only boolean not null default false,

  -- Array of { description, rate, unit, unit_other, quantity, amount }.
  -- Shape isn't validated at the DB level (mirrors how Form-6's Items JSON
  -- column is app-validated, not DB-validated) -- validate in the app layer.
  items jsonb not null default '[]'::jsonb,

  taxable_amount numeric,
  sgst_amount numeric,
  cgst_amount numeric,
  total_amount numeric,

  status text not null default 'pending',

  created_by text not null, -- employee email
  approved_by text,
  approved_at timestamptz,
  rejection_reason text,

  pdf_url text,

  created_at timestamptz not null default now(),

  constraint quotations_status_check check (status in ('pending', 'approved', 'rejected'))
);

comment on table public.quotations is
  'Phase 3: employee-submitted quotations for e-waste enquiries, pending owner approval before a PDF is issued.';

-- Supports the two lookups the dashboard will need: an employee's own
-- submissions, and an approver's pending queue.
create index if not exists quotations_created_by_idx on public.quotations (created_by);
create index if not exists quotations_status_idx on public.quotations (status);

alter table public.quotations enable row level security;

-- No DB-level employee/approver split -- same as Form-6. Any authenticated
-- user can read, insert, and update; the API routes (via isApprover()) are
-- what actually gate who can submit vs. who can approve/reject.
create policy "Authenticated users can read quotations"
  on public.quotations for select
  to authenticated
  using (true);

create policy "Authenticated users can insert quotations"
  on public.quotations for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update quotations"
  on public.quotations for update
  to authenticated
  using (true)
  with check (true);

-- No delete policy on purpose -- deletes stay blocked by default, same as
-- every other table in this project so far.
