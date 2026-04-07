create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  chain text not null,
  contract_address text not null,
  project_name text null,
  website_url text null,
  x_url text null,
  telegram_url text null,
  created_by_user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null,
  verdict text null,
  summary text null,
  score_total integer null,
  score_financials integer null,
  score_integrity integer null,
  score_reputation integer null,
  score_ecosystem integer null,
  score_security integer null,
  methodology_version text not null,
  generated_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.evidences (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  category text not null,
  severity text not null,
  title text not null,
  detail text not null,
  source_label text null,
  source_url text null,
  raw_value text null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_requests (
  id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  request_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists projects_chain_idx on public.projects (chain);
create index if not exists reports_project_id_idx on public.reports (project_id);
create index if not exists evidences_report_id_idx on public.evidences (report_id);
create index if not exists report_requests_report_id_idx on public.report_requests (report_id);