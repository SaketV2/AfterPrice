create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('retail_product', 'subscription')),
  provider text not null check (char_length(provider) between 1 and 100),
  external_id text not null check (char_length(external_id) between 1 and 200),
  display_name text not null check (char_length(display_name) between 1 and 200),
  brand text,
  variant text,
  size_label text,
  category text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  observation_type text not null check (observation_type in ('price', 'plan', 'renewal')),
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  currency text check (currency is null or currency = 'AUD'),
  plan_name text,
  billing_interval text check (billing_interval is null or billing_interval in ('weekly', 'monthly', 'quarterly', 'annual')),
  renewal_at timestamptz,
  source_name text not null,
  source_url text,
  observed_at timestamptz not null,
  origin text not null check (origin in ('seed', 'manual', 'authorised_feed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index observations_dedupe_idx on public.observations (
  entity_id, observation_type, coalesce(amount_cents, -1), coalesce(plan_name, ''),
  coalesce(billing_interval, ''), coalesce(renewal_at, '-infinity'::timestamptz), observed_at
);
create index observations_entity_observed_idx on public.observations (entity_id, observed_at desc);

create table public.baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  entity_id uuid not null references public.entities(id),
  baseline_type text not null check (baseline_type in ('purchase', 'subscription')),
  display_name text not null check (char_length(display_name) between 1 and 200),
  original_amount_cents integer not null check (original_amount_cents >= 0),
  currency text not null default 'AUD' check (currency = 'AUD'),
  plan_name text,
  billing_interval text check (billing_interval is null or billing_interval in ('weekly', 'monthly', 'quarterly', 'annual')),
  renewal_at timestamptz,
  captured_at timestamptz not null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (baseline_type = 'purchase' and plan_name is null and billing_interval is null)
    or (baseline_type = 'subscription' and plan_name is not null and billing_interval is not null)
  )
);
create index baselines_user_created_idx on public.baselines (user_id, created_at desc);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('running', 'completed', 'partial', 'failed')),
  records_processed integer not null default 0 check (records_processed >= 0),
  error_summary text
);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger entities_set_updated_at before update on public.entities for each row execute function public.set_updated_at();
create trigger baselines_set_updated_at before update on public.baselines for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.entities enable row level security;
alter table public.observations enable row level security;
alter table public.baselines enable row level security;
alter table public.ingestion_runs enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy entities_read_authenticated on public.entities for select to authenticated using (true);
create policy entities_insert_manual on public.entities for insert to authenticated with check (
  metadata ->> 'origin' = 'manual' and metadata ->> 'created_by' = (select auth.uid())::text
);
create policy observations_read_authenticated on public.observations for select to authenticated using (true);
create policy baselines_select_own on public.baselines for select to authenticated using ((select auth.uid()) = user_id);
create policy baselines_insert_own on public.baselines for insert to authenticated with check ((select auth.uid()) = user_id);
create policy baselines_update_own on public.baselines for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy baselines_delete_own on public.baselines for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.entities to authenticated;
grant select on public.observations to authenticated;
grant select, insert, update, delete on public.baselines to authenticated;
revoke all on public.ingestion_runs from anon, authenticated;
revoke insert, update, delete on public.observations from anon, authenticated;

comment on table public.observations is 'Append-only observed facts. Browser roles have read-only access.';
comment on table public.ingestion_runs is 'Trusted ingestion diagnostics. Not exposed to normal application users.';
