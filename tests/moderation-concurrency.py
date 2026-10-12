"""Run only against a disposable migrated Supabase database: TEST_DATABASE_URL=... python3 this_file."""
import concurrent.futures
import os
import subprocess
import uuid

database = os.environ['TEST_DATABASE_URL']
users = [str(uuid.uuid4()) for _ in range(4)]
post = str(uuid.uuid4())

def sql(query):
    result = subprocess.run(['psql', database, '-XAt', '-v', 'ON_ERROR_STOP=1'], input=query, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()

ids = ','.join("'" + user + "'" for user in users)
try:
    sql(f"""
      insert into auth.users(id) values {','.join("('"+user+"')" for user in users)};
      insert into public.profiles(id,full_name,date_of_birth,city,intention,status)
      select id,'Concurrent tester','1990-01-01','Karachi','exchange_ideas','approved' from auth.users where id in ({ids});
      insert into public.verification(profile_id,selfie_path,status,reviewed_at)
      select id,'private/selfie','approved',now() from public.profiles where id in ({ids});
      insert into public.posts(id,author_id,post_type,title,body,city)
      values('{post}','{users[0]}','building','Concurrent reports','A useful project','Karachi');
    """)
    def report(user):
        return sql(f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{user}',true); select public.submit_report('post','{post}','harassment','Concurrent report'); commit;")
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(report, users[1:]))
    assert sql(f"select status||':'||moderation_hold from public.posts where id='{post}'") == 'hidden:true'
    assert sql(f"select count(*) from public.reports where post_id='{post}'") == '3'
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(report, [users[1]]*3))
    assert sql(f"select count(*) from public.reports where post_id='{post}'") == '3'
    print('Concurrent reports hide once; concurrent retries do not increase the count.')
finally:
    sql(f"delete from public.reports where reporter_id in ({ids}); delete from public.audit_log where entity_id='{post}'; delete from auth.users where id in ({ids});")
