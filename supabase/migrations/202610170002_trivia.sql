-- Trivia 2026-10-17: independently scored; server-owned answer keys and 20s per question.
create table if not exists public.gtp_trivia_runs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null,
 display_name varchar(18) not null check (display_name ~ '^[A-Za-z0-9 _-]{3,18}$'),
 mode text not null check (mode in ('daily','practice')),
 question_ids jsonb not null check (jsonb_typeof(question_ids)='array' and jsonb_array_length(question_ids)=5),
 question_index integer not null default 0 check (question_index between 0 and 5),
 question_started_at timestamptz not null default now(),
 awaiting_next boolean not null default false,
 last_feedback jsonb,
 score integer not null default 0 check (score between 0 and 100 and score % 20 = 0),
 finished boolean not null default false,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists gtp_trivia_one_daily_per_user on public.gtp_trivia_runs(user_id,day) where mode='daily';
create index if not exists gtp_trivia_daily_rank_idx on public.gtp_trivia_runs(day,score desc,completed_at) where mode='daily' and finished;
create index if not exists gtp_trivia_overall_idx on public.gtp_trivia_runs(user_id,day) where mode='daily' and finished;
alter table public.gtp_trivia_runs enable row level security;
revoke all on public.gtp_trivia_runs from anon,authenticated;

create or replace function public.get_trivia_daily_leaderboard(p_day date,p_limit integer default 25)
returns table ("position" bigint, player_name text, score integer, questions_correct integer)
language sql stable security definer set search_path = '' as $$
 select row_number() over(order by x.score desc,x.completed_at asc),
        x.display_name::text,x.score,(x.score / 20)::integer
 from (select display_name,score,completed_at from public.gtp_trivia_runs
   where day=p_day and mode='daily' and finished
   order by score desc,completed_at asc limit greatest(1,least(coalesce(p_limit,25),50))) x;
$$;
create or replace function public.get_trivia_overall_leaderboard(p_limit integer default 25)
returns table ("position" bigint,player_name text, score bigint,days_played bigint,perfect_days bigint)
language sql stable security definer set search_path = '' as $$
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
        x.player_name::text,x.score,x.days_played,x.perfect_days
 from (select * from named order by score desc,days_played desc limit greatest(1,least(coalesce(p_limit,25),50))) x;
$$;
revoke all on function public.get_trivia_daily_leaderboard(date,integer) from public;
revoke all on function public.get_trivia_overall_leaderboard(integer) from public;
grant execute on function public.get_trivia_daily_leaderboard(date,integer) to anon,authenticated;
grant execute on function public.get_trivia_overall_leaderboard(integer) to anon,authenticated;
