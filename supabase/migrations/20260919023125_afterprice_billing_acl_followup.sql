-- Follow-up for ACL and query-index corrections identified after the initial
-- hardening migration had already been applied.

revoke all on function public.claim_pending_checkout(text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.claim_pending_checkout(text, text, uuid, text) to service_role;

drop policy if exists api_rate_limits_deny_clients on public.api_rate_limits;
create policy api_rate_limits_deny_clients on public.api_rate_limits
  for all to anon, authenticated using (false) with check (false);

drop policy if exists billing_customers_deny_clients on public.billing_customers;
create policy billing_customers_deny_clients on public.billing_customers
  for all to anon, authenticated using (false) with check (false);

drop policy if exists billing_subscriptions_deny_clients on public.billing_subscriptions;
create policy billing_subscriptions_deny_clients on public.billing_subscriptions
  for all to anon, authenticated using (false) with check (false);

drop policy if exists pending_checkouts_deny_clients on public.pending_checkouts;
create policy pending_checkouts_deny_clients on public.pending_checkouts
  for all to anon, authenticated using (false) with check (false);

drop policy if exists stripe_events_deny_clients on public.stripe_events;
create policy stripe_events_deny_clients on public.stripe_events
  for all to anon, authenticated using (false) with check (false);

create index if not exists pending_checkouts_user_idx
  on public.pending_checkouts (user_id)
  where user_id is not null;
