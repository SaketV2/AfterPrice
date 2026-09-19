-- Post-billing hardening for atomic monitoring persistence and abuse controls.

create table if not exists public.api_rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;
grant all on table public.api_rate_limits to service_role;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  request_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  now_at timestamptz := clock_timestamp();
  active_window_start timestamptz;
  active_count integer;
  window_end timestamptz;
begin
  if p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate limit key';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception 'Invalid rate limit limit';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit window';
  end if;

  insert into public.api_rate_limits (key_hash, window_start, request_count, updated_at)
  values (p_key_hash, now_at, 1, now_at)
  on conflict (key_hash) do update
    set window_start = case
      when public.api_rate_limits.window_start + make_interval(secs => p_window_seconds) <= now_at
        then now_at
      else public.api_rate_limits.window_start
    end,
    request_count = case
      when public.api_rate_limits.window_start + make_interval(secs => p_window_seconds) <= now_at
        then 1
      else public.api_rate_limits.request_count + 1
    end,
    updated_at = now_at
  returning api_rate_limits.window_start, api_rate_limits.request_count
    into active_window_start, active_count;

  window_end := active_window_start + make_interval(secs => p_window_seconds);
  return query select
    active_count <= p_limit,
    case
      when active_count <= p_limit then 0
      else greatest(1, ceil(extract(epoch from (window_end - now_at)))::integer)
    end,
    active_count;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- These are the observation identities used by the server-side persistence paths.
-- Production was checked for duplicates before introducing either constraint.
create unique index if not exists price_observations_dedupe_idx
  on public.price_observations (product_source_id, observed_at, observed_price_cents);

create unique index if not exists subscription_plan_observations_dedupe_idx
  on public.subscription_plan_observations (catalog_service_id, catalog_plan_id, observed_at, source)
  where catalog_plan_id is not null;

create index if not exists purchases_user_catalog_product_idx
  on public.purchases (user_id, catalog_product_id);
