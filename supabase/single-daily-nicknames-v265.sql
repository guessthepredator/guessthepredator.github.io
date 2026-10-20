create schema if not exists tac_private;
revoke all on schema tac_private from public,anon,authenticated;
create table if not exists tac_private.nickname_claims(name_key text primary key,user_id uuid not null,display_name text not null,created_at timestamptz not null default now());
alter table tac_private.nickname_claims enable row level security;
revoke all on tac_private.nickname_claims from public,anon,authenticated;
insert into tac_private.nickname_claims(name_key,user_id,display_name,created_at)
select distinct on(k) k,user_id,display_name,created_at from (
 select lower(regexp_replace(trim(display_name),'\s+',' ','g')) k,user_id,display_name,created_at from public.gtp_daily_scores
 union all select lower(regexp_replace(trim(display_name),'\s+',' ','g')),user_id,display_name,created_at from public.gtp_trivia_runs where mode='daily'
) names order by k,created_at,user_id on conflict(name_key) do nothing;
create or replace function tac_private.claim_nickname(p_user uuid,p_name text) returns void language plpgsql security definer set search_path='' as $$
declare k text:=lower(regexp_replace(trim(p_name),'\s+',' ','g')); owner_id uuid;
begin
 if p_user is null or k is null or length(k)<3 or length(k)>18 then raise exception 'Invalid nickname';end if;
 insert into tac_private.nickname_claims(name_key,user_id,display_name) values(k,p_user,regexp_replace(trim(p_name),'\s+',' ','g')) on conflict(name_key) do nothing;
 select user_id into owner_id from tac_private.nickname_claims where name_key=k;
 if owner_id<>p_user then raise exception using errcode='23505',message='Nickname already taken. Choose another nickname.';end if;
end $$;
revoke all on function tac_private.claim_nickname(uuid,text) from public,anon,authenticated;
create or replace function tac_private.guard_score_nickname() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='gtp_daily_scores' then perform tac_private.claim_nickname(new.user_id,new.display_name);
 elsif new.mode='daily' then perform tac_private.claim_nickname(new.user_id,new.display_name);end if;
 return new;
end $$;
revoke all on function tac_private.guard_score_nickname() from public,anon,authenticated;
drop trigger if exists tac_unique_nickname on public.gtp_daily_scores;
create trigger tac_unique_nickname before insert or update of display_name on public.gtp_daily_scores for each row execute function tac_private.guard_score_nickname();
drop trigger if exists tac_unique_nickname on public.gtp_trivia_runs;
create trigger tac_unique_nickname before insert or update of display_name on public.gtp_trivia_runs for each row execute function tac_private.guard_score_nickname();
create or replace function tac_private.rank_name(p_user uuid,p_name text) returns text language sql stable set search_path='' as $$
 with name_key as(select lower(regexp_replace(trim(p_name),'\s+',' ','g')) k),owner as(select c.user_id from tac_private.nickname_claims c,name_key where c.name_key=name_key.k),others as(
 select distinct user_id from public.gtp_daily_scores,name_key where lower(regexp_replace(trim(display_name),'\s+',' ','g'))=k
 union select distinct user_id from public.gtp_trivia_runs,name_key where mode='daily' and lower(regexp_replace(trim(display_name),'\s+',' ','g'))=k
 ) select case when p_user=(select user_id from owner) or not exists(select 1 from owner) then p_name else p_name||' ['||(2+(select count(*) from others where user_id<p_user and user_id<>(select user_id from owner)))::text||']' end
$$;
revoke all on function tac_private.rank_name(uuid,text) from public,anon,authenticated;
CREATE OR REPLACE FUNCTION public.get_daily_leaderboard(p_day date, p_limit integer DEFAULT 25)
 RETURNS TABLE("position" bigint, player_name text, score integer, streak integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 SELECT row_number() OVER (ORDER BY d.total_score DESC,d.created_at ASC),
        tac_private.rank_name(d.user_id,d.display_name)::text, d.total_score,d.streak
 FROM (SELECT user_id,display_name,total_score,streak,created_at FROM public.gtp_daily_scores
       WHERE day=p_day ORDER BY total_score DESC,created_at ASC LIMIT greatest(1,least(coalesce(p_limit,25),50))) d
$function$
;
CREATE OR REPLACE FUNCTION public.get_overall_leaderboard(p_limit integer DEFAULT 25)
 RETURNS TABLE("position" bigint, player_name text, score bigint, days_played bigint, best_streak integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 WITH totals AS (
  SELECT user_id,sum(total_score)::bigint score,count(*)::bigint days_played,max(streak)::integer best_streak
  FROM public.gtp_daily_scores GROUP BY user_id
 ),ranked AS (
  SELECT t.*, (SELECT d.display_name FROM public.gtp_daily_scores d WHERE d.user_id=t.user_id ORDER BY d.day DESC LIMIT 1) player_name
  FROM totals t
 )
 SELECT row_number() OVER (ORDER BY x.score DESC,x.days_played DESC),
 tac_private.rank_name(x.user_id,x.player_name)::text,x.score,x.days_played,x.best_streak
 FROM (SELECT * FROM ranked ORDER BY score DESC,days_played DESC LIMIT greatest(1,least(coalesce(p_limit,25),50))) x
$function$
;
CREATE OR REPLACE FUNCTION public.get_trivia_daily_leaderboard(p_day date, p_limit integer DEFAULT 25)
 RETURNS TABLE("position" bigint, player_name text, score integer, questions_correct integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select row_number() over(order by x.score desc,x.completed_at asc),
        tac_private.rank_name(x.user_id,x.display_name)::text,x.score,(x.correct_answers)::integer
 from (select user_id,display_name,score,completed_at,correct_answers from public.gtp_trivia_runs
   where day=p_day and mode='daily' and finished
   order by score desc,completed_at asc limit greatest(1,least(coalesce(p_limit,25),50))) x;
$function$
;
CREATE OR REPLACE FUNCTION public.get_trivia_overall_leaderboard(p_limit integer DEFAULT 25)
 RETURNS TABLE("position" bigint, player_name text, score bigint, days_played bigint, perfect_days bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 with totals as (
  select user_id,sum(score)::bigint as score,count(*)::bigint as days_played,
    count(*) filter(where score=100)::bigint as perfect_days
  from public.gtp_trivia_runs where mode='daily' and finished group by user_id
 ), named as (
   select t.*, (select d.display_name from public.gtp_trivia_runs d
     where d.user_id=t.user_id and d.mode='daily' and d.finished
     order by d.day desc limit 1) as player_name from totals t
 )
 select row_number() over(order by x.score desc,x.days_played desc),
        tac_private.rank_name(x.user_id,x.player_name)::text,x.score,x.days_played,x.perfect_days
 from (select * from named order by score desc,days_played desc limit greatest(1,least(coalesce(p_limit,25),50))) x;
$function$
;
