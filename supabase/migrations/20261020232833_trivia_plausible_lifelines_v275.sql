-- Keep the existing authenticated RPC, timer, scoring and private-function ACL.
-- Input questions may author their own plausible options; every accepted alias is excluded from distractors.
update public.gtp_trivia_questions set options='["Bangalore","Ash","Octane","Loba"]'::jsonb where id='v221-fact-2' and kind='input';
update public.gtp_trivia_questions set options='["6000","9000","12000","18000"]'::jsonb where id='v221-fact-3' and kind='input';
update public.gtp_trivia_questions set options='["500","750","1000","1500"]'::jsonb where id='v221-fact-4' and kind='input';
update public.gtp_trivia_questions set options='["2","3","4","5"]'::jsonb where id='v221-fact-7' and kind='input';

create or replace function tac_private.trivia_lifeline_options(p_question text,p_seed text)
returns jsonb language plpgsql stable security invoker set search_path='' as $function$
declare q public.gtp_trivia_questions%rowtype; correct text; wrongs jsonb; result jsonb; needed integer;
begin
 select * into q from public.gtp_trivia_questions where id=p_question;
 if q.id is null then return '[]'::jsonb; end if;
 correct:=q.answers->>0;
 needed:=case when q.kind='choice' then 1 else 3 end;
 select coalesce(jsonb_agg(z.value),'[]'::jsonb) into wrongs from (
  select candidates.value from (
   select distinct on (regexp_replace(lower(pool.value),'[^a-z0-9]','','g')) pool.value
   from (
    select v.value from jsonb_array_elements_text(q.options) v(value)
    union all
    select x.answers->>0 from public.gtp_trivia_questions x
     where q.kind='input' and jsonb_array_length(q.options)=0
       and x.active and x.kind='input' and x.category=q.category and x.id<>q.id
   ) pool
   where length(trim(pool.value))>0
     and (q.kind='choice' or ((pool.value ~ '^[0-9]+$')=(correct ~ '^[0-9]+$')))
     and not exists (
      select 1 from jsonb_array_elements_text(q.answers) a(value)
      where regexp_replace(lower(a.value),'[^a-z0-9]','','g')=regexp_replace(lower(pool.value),'[^a-z0-9]','','g'))
   order by regexp_replace(lower(pool.value),'[^a-z0-9]','','g'),pool.value
  ) candidates
  order by md5(coalesce(p_seed,'')||q.id||candidates.value)
  limit needed
 ) z;
 select jsonb_agg(v.value order by md5(coalesce(p_seed,'')||q.id||v.value)) into result
 from jsonb_array_elements_text(wrongs||jsonb_build_array(correct)) v(value);
 return result;
end;
$function$;
revoke all on function tac_private.trivia_lifeline_options(text,text) from public,anon,authenticated;
