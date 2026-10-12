-- Run after enabling Cron/pg_net and creating the two Vault secrets in the setup guide.
do $$begin
 if not exists(select 1 from vault.decrypted_secrets where name='connectpk_project_url')
 or not exists(select 1 from vault.decrypted_secrets where name='connectpk_push_worker_secret') then
 raise exception 'Create the notification Vault secrets first'; end if;
end;$$;
select cron.unschedule(jobid) from cron.job where jobname='connectpk-push';
select cron.schedule('connectpk-push','* * * * *',$$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='connectpk_project_url')||'/functions/v1/push-notifications',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='connectpk_push_worker_secret')),
  body:='{}'::jsonb,timeout_milliseconds:=120000
 );
$$);
