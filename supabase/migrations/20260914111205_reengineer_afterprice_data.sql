create or replace function public.normalize_catalog_text(value text)
returns text
language sql
immutable
parallel safe
as $$
  select regexp_replace(lower(coalesce(trim(value), '')), '[^a-z0-9]+', '', 'g');
$$;

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  notify_price_drops boolean not null default true,
  notify_plan_changes boolean not null default true,
  notify_renewals boolean not null default true,
  notify_weekly_summary boolean not null default true,
  default_currency text not null default 'AUD' check (default_currency ~ '^[A-Z]{3}$'),
  default_return_window_days integer check (default_return_window_days is null or default_return_window_days between 0 and 3650),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  brand text,
  name text not null check (char_length(trim(name)) between 1 and 240),
  model_number text,
  manufacturer_part_number text,
  category text,
  image_url text check (image_url is null or image_url ~* '^https?://'),
  variant_data jsonb not null default '{}'::jsonb,
  identity_key text generated always as (
    public.normalize_catalog_text(coalesce(brand, '') || ':' || name || ':' || coalesce(model_number, '') || ':' || coalesce(manufacturer_part_number, '') || ':' || coalesce(variant_data ->> 'variant', ''))
  ) stored,
  is_featured boolean not null default false,
  featured_rank integer check (featured_rank is null or featured_rank > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_enriched_at timestamptz,
  unique (identity_key)
);

create table if not exists public.catalog_product_aliases (
  id uuid primary key default gen_random_uuid(),
  catalog_product_id uuid not null references public.catalog_products(id) on delete cascade,
  alias text not null check (char_length(trim(alias)) between 1 and 240),
  normalized_alias text generated always as (public.normalize_catalog_text(alias)) stored,
  created_at timestamptz not null default now(),
  unique (catalog_product_id, normalized_alias)
);

create table if not exists public.catalog_product_identifiers (
  id uuid primary key default gen_random_uuid(),
  catalog_product_id uuid not null references public.catalog_products(id) on delete cascade,
  identifier_type text not null check (identifier_type in ('gtin', 'ean', 'upc', 'mpn', 'ebay_epid', 'retailer_sku')),
  identifier_value text not null check (char_length(trim(identifier_value)) between 1 and 160),
  normalized_identifier text generated always as (public.normalize_catalog_text(identifier_value)) stored,
  provider text not null check (char_length(trim(provider)) between 1 and 100),
  provider_product_id text,
  created_at timestamptz not null default now(),
  unique (identifier_type, normalized_identifier, provider)
);

create table if not exists public.catalog_services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  normalized_name text generated always as (public.normalize_catalog_text(name)) stored,
  category text not null check (char_length(trim(category)) between 1 and 80),
  website_url text check (website_url is null or website_url ~* '^https?://'),
  manage_url text check (manage_url is null or manage_url ~* '^https?://'),
  logo_url text check (logo_url is null or logo_url ~* '^https?://'),
  supported_capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name)
);

create table if not exists public.catalog_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.catalog_services(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  normalized_name text generated always as (public.normalize_catalog_text(name)) stored,
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  cadence text check (cadence is null or cadence in ('weekly', 'monthly', 'quarterly', 'annual', 'one_off')),
  feature_data jsonb not null default '{}'::jsonb,
  observed_at timestamptz,
  source text,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, normalized_name)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  catalog_product_id uuid references public.catalog_products(id) on delete set null,
  custom_product_name text check (custom_product_name is null or char_length(trim(custom_product_name)) between 1 and 240),
  retailer_name text not null check (char_length(trim(retailer_name)) between 1 and 160),
  paid_amount_cents integer not null check (paid_amount_cents >= 0),
  currency text not null default 'AUD' check (currency ~ '^[A-Z]{3}$'),
  purchase_date date not null,
  return_deadline date,
  return_deadline_source text not null default 'unknown' check (return_deadline_source in ('user_confirmed', 'estimated', 'retailer_policy', 'unknown')),
  purchase_url text check (purchase_url is null or purchase_url ~* '^https?://'),
  monitoring_status text not null default 'monitoring' check (monitoring_status in ('monitoring', 'limited', 'manual_only', 'paused', 'source_unavailable', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (catalog_product_id is not null or custom_product_name is not null),
  check (return_deadline is null or return_deadline >= purchase_date)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  catalog_service_id uuid references public.catalog_services(id) on delete set null,
  catalog_plan_id uuid references public.catalog_subscription_plans(id) on delete set null,
  custom_service_name text check (custom_service_name is null or char_length(trim(custom_service_name)) between 1 and 160),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'AUD' check (currency ~ '^[A-Z]{3}$'),
  billing_cadence text not null check (billing_cadence in ('weekly', 'monthly', 'quarterly', 'annual', 'one_off')),
  start_date date not null,
  renewal_date date,
  trial_end date,
  promo_end date,
  monitoring_status text not null default 'monitoring' check (monitoring_status in ('monitoring', 'limited', 'manual_only', 'paused', 'source_unavailable', 'cancelled')),
  manage_url text check (manage_url is null or manage_url ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (catalog_service_id is not null or custom_service_name is not null),
  check (renewal_date is null or renewal_date >= start_date),
  check (trial_end is null or trial_end >= start_date),
  check (promo_end is null or promo_end >= start_date)
);

create table if not exists public.subscription_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  usage_type text not null check (char_length(trim(usage_type)) between 1 and 80),
  quantity numeric(14, 3) check (quantity is null or quantity >= 0),
  occurred_at timestamptz not null,
  source text not null default 'manual' check (char_length(trim(source)) between 1 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  purchase_id uuid references public.purchases(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  alert_type text not null check (alert_type in ('price_drop', 'return_window_closing', 'price_change', 'source_unavailable', 'renewal_approaching', 'trial_ending', 'promo_ending', 'plan_change', 'cheaper_plan', 'low_usage')),
  severity text not null default 'info' check (severity in ('info', 'low', 'medium', 'high', 'urgent')),
  title text not null check (char_length(trim(title)) between 1 and 240),
  summary text not null check (char_length(trim(summary)) between 1 and 2000),
  source text,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  observed_at timestamptz,
  next_action text,
  dedupe_key text not null check (char_length(trim(dedupe_key)) between 1 and 240),
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (num_nonnulls(purchase_id, subscription_id) <= 1),
  unique (user_id, dedupe_key)
);

create table if not exists public.product_sources (
  id uuid primary key default gen_random_uuid(),
  catalog_product_id uuid not null references public.catalog_products(id) on delete cascade,
  provider text not null check (char_length(trim(provider)) between 1 and 100),
  listing_identifier text not null check (char_length(trim(listing_identifier)) between 1 and 240),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  is_active boolean not null default true,
  last_successful_check timestamptz,
  last_error_at timestamptz,
  last_error_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, listing_identifier)
);

create table if not exists public.price_observations (
  id uuid primary key default gen_random_uuid(),
  catalog_product_id uuid not null references public.catalog_products(id) on delete cascade,
  product_source_id uuid not null references public.product_sources(id) on delete cascade,
  observed_price_cents integer not null check (observed_price_cents >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  availability text check (availability is null or availability in ('in_stock', 'out_of_stock', 'preorder', 'unknown')),
  observed_at timestamptz not null,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  source_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_plan_observations (
  id uuid primary key default gen_random_uuid(),
  catalog_service_id uuid not null references public.catalog_services(id) on delete cascade,
  catalog_plan_id uuid references public.catalog_subscription_plans(id) on delete cascade,
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  cadence text check (cadence is null or cadence in ('weekly', 'monthly', 'quarterly', 'annual', 'one_off')),
  feature_data jsonb not null default '{}'::jsonb,
  source text not null check (char_length(trim(source)) between 1 and 100),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  observed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists catalog_products_name_search_idx on public.catalog_products (identity_key text_pattern_ops);
create index if not exists catalog_products_featured_idx on public.catalog_products (is_featured, featured_rank nulls last, name);
create index if not exists catalog_product_aliases_search_idx on public.catalog_product_aliases (normalized_alias text_pattern_ops);
create index if not exists catalog_product_identifiers_search_idx on public.catalog_product_identifiers (identifier_type, normalized_identifier);
create index if not exists catalog_services_name_search_idx on public.catalog_services (normalized_name text_pattern_ops);
create index if not exists purchases_user_created_idx on public.purchases (user_id, created_at desc);
create index if not exists purchases_user_deadline_idx on public.purchases (user_id, return_deadline);
create index if not exists subscriptions_user_renewal_idx on public.subscriptions (user_id, renewal_date);
create index if not exists subscriptions_user_created_idx on public.subscriptions (user_id, created_at desc);
create index if not exists usage_events_subscription_occurred_idx on public.subscription_usage_events (subscription_id, occurred_at desc);
create index if not exists alerts_user_created_idx on public.alerts (user_id, created_at desc);
create index if not exists alerts_user_unread_idx on public.alerts (user_id, is_read, created_at desc);
create index if not exists product_sources_product_active_idx on public.product_sources (catalog_product_id, is_active);
create index if not exists price_observations_product_observed_idx on public.price_observations (catalog_product_id, observed_at desc);
create index if not exists plan_observations_plan_observed_idx on public.subscription_plan_observations (catalog_plan_id, observed_at desc);

create unique index if not exists price_observations_dedupe_idx on public.price_observations (
  product_source_id,
  observed_at,
  observed_price_cents,
  coalesce(availability, '')
);
create unique index if not exists plan_observations_dedupe_idx on public.subscription_plan_observations (
  catalog_service_id,
  coalesce(catalog_plan_id, '00000000-0000-0000-0000-000000000000'::uuid),
  observed_at,
  coalesce(price_cents, -1),
  coalesce(cadence, '')
);

create trigger user_preferences_set_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();
create trigger catalog_products_set_updated_at before update on public.catalog_products for each row execute function public.set_updated_at();
create trigger catalog_services_set_updated_at before update on public.catalog_services for each row execute function public.set_updated_at();
create trigger catalog_plans_set_updated_at before update on public.catalog_subscription_plans for each row execute function public.set_updated_at();
create trigger purchases_set_updated_at before update on public.purchases for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger product_sources_set_updated_at before update on public.product_sources for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

insert into public.user_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.catalog_products (brand, name, model_number, category, is_featured, featured_rank)
values
  ('Sony', 'WH-1000XM6', 'WH-1000XM6', 'headphones', true, 1),
  ('Sony', 'WH-1000XM5', 'WH-1000XM5', 'headphones', true, 2),
  ('Bose', 'QuietComfort Ultra Headphones', 'QC ULTRA', 'headphones', true, 3),
  ('Bose', 'QuietComfort Headphones', 'QC', 'headphones', true, 4),
  ('Sennheiser', 'Momentum 4 Wireless', 'MOMENTUM 4', 'headphones', true, 5),
  ('Apple', 'AirPods Max (USB-C)', 'A-PODS-MAX-USB-C', 'headphones', true, 6),
  ('Sonos', 'Ace', 'ACE', 'headphones', true, 7),
  ('Beats', 'Studio Pro', 'STUDIO PRO', 'headphones', true, 8)
on conflict (identity_key) do update set
  is_featured = excluded.is_featured,
  featured_rank = excluded.featured_rank,
  updated_at = now();

with aliases(brand, model_number, alias) as (
  values
    ('Sony', 'WH-1000XM6', 'Sony WH-1000XM6'),
    ('Sony', 'WH-1000XM6', 'WH1000XM6'),
    ('Sony', 'WH-1000XM6', 'WH 1000 XM6'),
    ('Sony', 'WH-1000XM5', 'Sony WH-1000XM5'),
    ('Sony', 'WH-1000XM5', 'WH1000XM5'),
    ('Bose', 'QC ULTRA', 'Bose QuietComfort Ultra'),
    ('Bose', 'QC', 'Bose QuietComfort'),
    ('Sennheiser', 'MOMENTUM 4', 'Sennheiser Momentum 4'),
    ('Apple', 'A-PODS-MAX-USB-C', 'Apple AirPods Max'),
    ('Sonos', 'ACE', 'Sonos Ace'),
    ('Beats', 'STUDIO PRO', 'Beats Studio Pro')
)
insert into public.catalog_product_aliases (catalog_product_id, alias)
select p.id, aliases.alias
from aliases
join public.catalog_products p on p.brand = aliases.brand and p.model_number = aliases.model_number
on conflict (catalog_product_id, normalized_alias) do nothing;

insert into public.catalog_services (name, category, website_url, manage_url, supported_capabilities)
values
  ('Spotify', 'music_streaming', 'https://www.spotify.com/', 'https://www.spotify.com/account/', '{"renewal": true, "public_plan_monitoring": true}'::jsonb),
  ('Netflix', 'video_streaming', 'https://www.netflix.com/', 'https://www.netflix.com/account/', '{"renewal": true, "public_plan_monitoring": true}'::jsonb),
  ('ChatGPT', 'ai_subscription', 'https://chatgpt.com/', 'https://chatgpt.com/settings/', '{"renewal": true, "public_plan_monitoring": true, "personal_usage": false}'::jsonb),
  ('Claude', 'ai_subscription', 'https://claude.ai/', 'https://claude.ai/settings', '{"renewal": true, "public_plan_monitoring": true, "personal_usage": false}'::jsonb),
  ('Notion', 'productivity', 'https://www.notion.so/', 'https://www.notion.so/my-account', '{"renewal": true, "public_plan_monitoring": true}'::jsonb)
on conflict (normalized_name) do update set
  website_url = excluded.website_url,
  manage_url = excluded.manage_url,
  supported_capabilities = excluded.supported_capabilities,
  updated_at = now();

alter table public.user_preferences enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_product_aliases enable row level security;
alter table public.catalog_product_identifiers enable row level security;
alter table public.catalog_services enable row level security;
alter table public.catalog_subscription_plans enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_usage_events enable row level security;
alter table public.alerts enable row level security;
alter table public.product_sources enable row level security;
alter table public.price_observations enable row level security;
alter table public.subscription_plan_observations enable row level security;

drop policy if exists user_preferences_select_own on public.user_preferences;
drop policy if exists user_preferences_insert_own on public.user_preferences;
drop policy if exists user_preferences_update_own on public.user_preferences;
drop policy if exists user_preferences_delete_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy user_preferences_insert_own on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy user_preferences_update_own on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_preferences_delete_own on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists catalog_products_read_authenticated on public.catalog_products;
drop policy if exists catalog_aliases_read_authenticated on public.catalog_product_aliases;
drop policy if exists catalog_identifiers_read_authenticated on public.catalog_product_identifiers;
drop policy if exists catalog_services_read_authenticated on public.catalog_services;
drop policy if exists catalog_plans_read_authenticated on public.catalog_subscription_plans;
create policy catalog_products_read_authenticated on public.catalog_products for select to authenticated using (true);
create policy catalog_aliases_read_authenticated on public.catalog_product_aliases for select to authenticated using (true);
create policy catalog_identifiers_read_authenticated on public.catalog_product_identifiers for select to authenticated using (true);
create policy catalog_services_read_authenticated on public.catalog_services for select to authenticated using (true);
create policy catalog_plans_read_authenticated on public.catalog_subscription_plans for select to authenticated using (true);

drop policy if exists purchases_select_own on public.purchases;
drop policy if exists purchases_insert_own on public.purchases;
drop policy if exists purchases_update_own on public.purchases;
drop policy if exists purchases_delete_own on public.purchases;
create policy purchases_select_own on public.purchases for select to authenticated using ((select auth.uid()) = user_id);
create policy purchases_insert_own on public.purchases for insert to authenticated with check ((select auth.uid()) = user_id);
create policy purchases_update_own on public.purchases for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy purchases_delete_own on public.purchases for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists subscriptions_select_own on public.subscriptions;
drop policy if exists subscriptions_insert_own on public.subscriptions;
drop policy if exists subscriptions_update_own on public.subscriptions;
drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);
create policy subscriptions_insert_own on public.subscriptions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy subscriptions_update_own on public.subscriptions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy subscriptions_delete_own on public.subscriptions for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists usage_events_select_own on public.subscription_usage_events;
drop policy if exists usage_events_insert_own on public.subscription_usage_events;
drop policy if exists usage_events_update_own on public.subscription_usage_events;
drop policy if exists usage_events_delete_own on public.subscription_usage_events;
create policy usage_events_select_own on public.subscription_usage_events for select to authenticated using (
  (select auth.uid()) = user_id
  and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
);
create policy usage_events_insert_own on public.subscription_usage_events for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
);
create policy usage_events_update_own on public.subscription_usage_events for update to authenticated using (
  (select auth.uid()) = user_id
  and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
) with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
);
create policy usage_events_delete_own on public.subscription_usage_events for delete to authenticated using (
  (select auth.uid()) = user_id
  and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
);

drop policy if exists alerts_select_own on public.alerts;
drop policy if exists alerts_update_own on public.alerts;
create policy alerts_select_own on public.alerts for select to authenticated using ((select auth.uid()) = user_id);
create policy alerts_update_own on public.alerts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists product_sources_read_authenticated on public.product_sources;
drop policy if exists price_observations_read_authenticated on public.price_observations;
drop policy if exists plan_observations_read_authenticated on public.subscription_plan_observations;
create policy product_sources_read_authenticated on public.product_sources for select to authenticated using (true);
create policy price_observations_read_authenticated on public.price_observations for select to authenticated using (true);
create policy plan_observations_read_authenticated on public.subscription_plan_observations for select to authenticated using (true);

grant usage on schema public to authenticated;
revoke all on public.user_preferences, public.catalog_products, public.catalog_product_aliases, public.catalog_product_identifiers, public.catalog_services, public.catalog_subscription_plans, public.purchases, public.subscriptions, public.subscription_usage_events, public.alerts, public.product_sources, public.price_observations, public.subscription_plan_observations from anon;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select on public.catalog_products, public.catalog_product_aliases, public.catalog_product_identifiers, public.catalog_services, public.catalog_subscription_plans, public.product_sources, public.price_observations, public.subscription_plan_observations to authenticated;
grant select, insert, update, delete on public.purchases, public.subscriptions, public.subscription_usage_events to authenticated;
grant select on public.alerts to authenticated;
grant update (is_read, read_at) on public.alerts to authenticated;

comment on table public.catalog_products is 'Shared canonical product identity. Writes are reserved for trusted catalogue ingestion.';
comment on table public.catalog_services is 'Shared canonical subscription service identity. Prices belong in observations, not permanent constants.';
comment on table public.purchases is 'Authenticated user purchase baselines. User identity is enforced by RLS.';
comment on table public.price_observations is 'Append-only shared observations from authorised monitoring sources.';
comment on table public.subscription_plan_observations is 'Append-only public subscription plan snapshots from authorised sources.';


