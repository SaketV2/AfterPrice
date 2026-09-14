create table if not exists public.catalog_product_popularity (
  catalog_product_id uuid primary key references public.catalog_products(id) on delete cascade,
  purchase_count integer not null default 0 check (purchase_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_product_popularity_rank_idx on public.catalog_product_popularity (purchase_count desc, updated_at desc);

create or replace function public.update_catalog_product_popularity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and old.catalog_product_id is distinct from new.catalog_product_id) then
    if old.catalog_product_id is not null then
      update public.catalog_product_popularity
      set purchase_count = greatest(purchase_count - 1, 0), updated_at = now()
      where catalog_product_id = old.catalog_product_id;
    end if;
  end if;

  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.catalog_product_id is distinct from new.catalog_product_id) then
    if new.catalog_product_id is not null then
      insert into public.catalog_product_popularity (catalog_product_id, purchase_count)
      values (new.catalog_product_id, 1)
      on conflict (catalog_product_id) do update
      set purchase_count = public.catalog_product_popularity.purchase_count + 1, updated_at = now();
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.update_catalog_product_popularity() from public, anon, authenticated;

drop trigger if exists purchases_catalog_popularity_after_change on public.purchases;
create trigger purchases_catalog_popularity_after_change
after insert or update of catalog_product_id or delete on public.purchases
for each row execute function public.update_catalog_product_popularity();

insert into public.catalog_product_popularity (catalog_product_id, purchase_count)
select catalog_product_id, count(*)::integer
from public.purchases
where catalog_product_id is not null
group by catalog_product_id
on conflict (catalog_product_id) do update set purchase_count = excluded.purchase_count, updated_at = now();

alter table public.catalog_product_popularity enable row level security;
drop policy if exists catalog_product_popularity_read_authenticated on public.catalog_product_popularity;
create policy catalog_product_popularity_read_authenticated on public.catalog_product_popularity for select to authenticated using (true);
revoke all on public.catalog_product_popularity from anon;
grant select on public.catalog_product_popularity to authenticated;

comment on table public.catalog_product_popularity is 'Aggregate purchase counts only. No user identity or private purchase data is exposed.';
