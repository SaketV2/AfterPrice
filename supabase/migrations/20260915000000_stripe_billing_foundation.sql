-- Stripe Billing foundation.
-- These tables are intentionally service-role-only. The application performs
-- its own authenticated-user checks before invoking the billing server code.

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  plan_key text not null,
  status text not null,
  payment_state text not null default 'unknown',
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_status_idx
  on public.billing_subscriptions (user_id, status, updated_at desc);

create table if not exists public.pending_checkouts (
  id uuid primary key,
  checkout_session_id text unique,
  claim_token_hash text not null unique,
  email text not null,
  plan_key text not null,
  stripe_price_id text not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_subscription_status text,
  checkout_payment_status text not null default 'unpaid',
  payment_state text not null default 'unknown',
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  ended_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'claimed', 'expired')),
  user_id uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pending_checkouts_subscription_idx
  on public.pending_checkouts (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  status text not null default 'processing'
    check (status in ('processing', 'processed', 'failed')),
  attempted_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text
);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.pending_checkouts enable row level security;
alter table public.stripe_events enable row level security;

revoke all on table public.billing_customers from anon, authenticated;
revoke all on table public.billing_subscriptions from anon, authenticated;
revoke all on table public.pending_checkouts from anon, authenticated;
revoke all on table public.stripe_events from anon, authenticated;

grant all on table public.billing_customers to service_role;
grant all on table public.billing_subscriptions to service_role;
grant all on table public.pending_checkouts to service_role;
grant all on table public.stripe_events to service_role;

-- Claiming and creating the user's subscription must be one database
-- transaction. Only the server's service-role client can execute this RPC.
create or replace function public.claim_pending_checkout(
  p_checkout_session_id text,
  p_claim_token_hash text,
  p_user_id uuid,
  p_email text
) returns setof public.pending_checkouts
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  pending public.pending_checkouts%rowtype;
begin
  select * into pending
    from public.pending_checkouts
   where checkout_session_id = p_checkout_session_id
     and claim_token_hash = p_claim_token_hash
     and lower(email) = lower(p_email)
     and status = 'paid'
     and user_id is null
     and claimed_at is null
     and expires_at > now()
     and stripe_customer_id is not null
     and stripe_subscription_id is not null
   for update;

  if not found then
    return;
  end if;

  if exists (
    select 1 from public.billing_customers
     where stripe_customer_id = pending.stripe_customer_id
       and user_id <> p_user_id
  ) then
    raise exception 'Billing customer is already associated with another user';
  end if;

  if exists (
    select 1 from public.billing_subscriptions
     where stripe_subscription_id = pending.stripe_subscription_id
       and user_id <> p_user_id
  ) then
    raise exception 'Billing subscription is already associated with another user';
  end if;

  if exists (
    select 1 from public.billing_customers
     where user_id = p_user_id
       and stripe_customer_id <> pending.stripe_customer_id
  ) then
    raise exception 'The user is already associated with a different Stripe customer';
  end if;

  update public.pending_checkouts
     set status = 'claimed',
         user_id = p_user_id,
         claimed_at = now(),
         updated_at = now()
   where id = pending.id
   returning * into pending;

  insert into public.billing_customers (user_id, stripe_customer_id, updated_at)
  values (p_user_id, pending.stripe_customer_id, now())
  on conflict (user_id) do update
    set stripe_customer_id = excluded.stripe_customer_id,
        updated_at = now();

  insert into public.billing_subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    plan_key,
    status,
    payment_state,
    cancel_at_period_end,
    current_period_start,
    current_period_end,
    trial_end,
    ended_at,
    updated_at
  ) values (
    p_user_id,
    pending.stripe_customer_id,
    pending.stripe_subscription_id,
    pending.stripe_price_id,
    pending.plan_key,
    coalesce(pending.stripe_subscription_status, 'unknown'),
    pending.payment_state,
    pending.cancel_at_period_end,
    pending.current_period_start,
    pending.current_period_end,
    pending.trial_end,
    pending.ended_at,
    now()
  )
  on conflict (stripe_subscription_id) do update
    set user_id = excluded.user_id,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_price_id = excluded.stripe_price_id,
        plan_key = excluded.plan_key,
        status = excluded.status,
        payment_state = excluded.payment_state,
        cancel_at_period_end = excluded.cancel_at_period_end,
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        trial_end = excluded.trial_end,
        ended_at = excluded.ended_at,
        updated_at = now();

  return next pending;
end;
$$;

revoke all on function public.claim_pending_checkout(text, text, uuid, text) from public;
grant execute on function public.claim_pending_checkout(text, text, uuid, text) to service_role;
