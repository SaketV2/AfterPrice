alter table public.catalog_product_popularity
  add column if not exists tracking_user_count integer not null default 0,
  add column if not exists recent_additions_30d integer not null default 0,
  add column if not exists recent_additions_90d integer not null default 0;

alter table public.catalog_product_popularity
  drop constraint if exists catalog_product_popularity_tracking_user_count_check,
  drop constraint if exists catalog_product_popularity_recent_additions_30d_check,
  drop constraint if exists catalog_product_popularity_recent_additions_90d_check;

alter table public.catalog_product_popularity
  add constraint catalog_product_popularity_tracking_user_count_check check (tracking_user_count >= 0),
  add constraint catalog_product_popularity_recent_additions_30d_check check (recent_additions_30d >= 0),
  add constraint catalog_product_popularity_recent_additions_90d_check check (recent_additions_90d >= 0);

create or replace function public.refresh_catalog_product_popularity(target_product_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_product_id is null then
    return;
  end if;

  insert into public.catalog_product_popularity (
    catalog_product_id,
    purchase_count,
    tracking_user_count,
    recent_additions_30d,
    recent_additions_90d,
    updated_at
  )
  select
    target_product_id,
    count(*)::integer,
    count(distinct user_id)::integer,
    count(*) filter (where created_at >= now() - interval '30 days')::integer,
    count(*) filter (where created_at >= now() - interval '90 days')::integer,
    now()
  from public.purchases
  where catalog_product_id = target_product_id
  on conflict (catalog_product_id) do update set
    purchase_count = excluded.purchase_count,
    tracking_user_count = excluded.tracking_user_count,
    recent_additions_30d = excluded.recent_additions_30d,
    recent_additions_90d = excluded.recent_additions_90d,
    updated_at = now();
end;
$$;

revoke all on function public.refresh_catalog_product_popularity(uuid) from public, anon, authenticated;

create or replace function public.update_catalog_product_popularity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and old.catalog_product_id is distinct from new.catalog_product_id) then
    perform public.refresh_catalog_product_popularity(old.catalog_product_id);
  end if;

  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.catalog_product_id is distinct from new.catalog_product_id) then
    perform public.refresh_catalog_product_popularity(new.catalog_product_id);
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.update_catalog_product_popularity() from public, anon, authenticated;

do $$
declare
  product_id uuid;
begin
  for product_id in select id from public.catalog_products loop
    perform public.refresh_catalog_product_popularity(product_id);
  end loop;
end;
$$;
