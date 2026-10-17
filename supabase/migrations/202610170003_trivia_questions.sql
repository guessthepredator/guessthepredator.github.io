-- Private server-side Trivia question bank. Browsers never receive answer keys before submission.
create table if not exists public.gtp_trivia_questions (
 id text primary key,
 prompt text not null,
 kind text not null check (kind in ('choice','input')),
 options jsonb not null default '[]'::jsonb,
 answers jsonb not null,
 explanation text not null,
 source text not null,
 category text not null,
 difficulty text not null default 'regular',
 active boolean not null default true,
 last_reviewed_on date not null default current_date,
 check (jsonb_typeof(options)='array' and jsonb_typeof(answers)='array' and jsonb_array_length(answers)>0)
);
alter table public.gtp_trivia_questions enable row level security;
revoke all on public.gtp_trivia_questions from anon,authenticated;
-- Seed from supabase/functions/trivia/questions.json; canonical references and review notes in TRIVIA_SOURCES.md.
