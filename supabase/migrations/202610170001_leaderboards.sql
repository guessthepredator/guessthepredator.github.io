-- GTP2 global rankings: public read via narrowed SQL functions, writes only via Edge Function.
create table if not exists public.gtp_daily_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  display_name varchar(18) not null check (display_name ~ '^[A-Za-z0-9 _-]{3,18}$'),
  base_score integer not null check (base_score between 0 and 12000),
  streak_bonus integer not null check (streak_bonus between 0 and 6000),
  total_score integer generated always as (base_score + streak_bonus) stored,
  streak integer not null check (streak between 0 and 3650),
  all_won boolean not null,
  round_results jsonb not null,
  created_at timestamptz not null default now(),
  primary key(user_id,day)
);
create index if not exists gtp_daily_day_rank_idx on public.gtp_daily_scores(day,total_score desc);
create index if not exists gtp_daily_user_day_idx on public.gtp_daily_scores(user_id,day);
alter table public.gtp_daily_scores enable row level security;
revoke all on public.gtp_daily_scores from anon,authenticated;
-- No SELECT/INSERT/UPDATE policy. Only the secret server client can write raw rows.

create or replace function public.get_daily_leaderboard(p_day date, p_limit integer default 25)
returns table (position bigint, player_name text, score integer, streak integer)
language sql stable security definer set search_path = '' as $$
 select row_number() over (order by d.total_score desc,d.created_at asc),
        d.display_name::text, d.total_score, d.streak
 from (select display_name,total_score,streak,created_at from public.gtp_daily_scores
       where day=p_day order by total_score desc,created_at asc limit greatest(1,least(coalesce(p_limit,25),50))) d
$$;
create or replace function public.get_overall_leaderboard(p_limit integer default 25)
returns table (position bigint,player_name text,score bigint,days_played bigint, best_streak integer)
language sql stable security definer set search_path = '' as $$
 with totals as (
   select user_id,sum(total_score)::bigint as score,count(*)::bigint as days_played,max(streak)::integer as best_streak
   from public.gtp_daily_scores group by user_id
 ), ranked as (
   select t.*, (select d.display_name from public.gtp_daily_scores d where d.user_id=t.user_id order by d.day desc limit 1) as player_name
   from totals t
 )
 select row_number() over (order by x.score desc,x.days_played desc),x.player_name::text,x.score,x.days_played,x.best_streak
 from (select * from ranked order by score desc,days_played desc limit greatest(1,least(coalesce(p_limit,25),50))) x
$$;
revoke all on function public.get_daily_leaderboard(date,integer) from public;
revoke all on function public.get_overall_leaderboard(integer) from public;
grant execute on function public.get_daily_leaderboard(date,integer) to anon,authenticated;
grant execute on function public.get_overall_leaderboard(integer) to anon,authenticated;
