create index baselines_entity_idx on public.baselines (entity_id);

create policy ingestion_runs_deny_clients on public.ingestion_runs
for all to anon, authenticated
using (false)
with check (false);
