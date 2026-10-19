create schema if not exists tac_private;
revoke all on schema tac_private from public,anon,authenticated;

create or replace function tac_private.pick_trivia_questions(p_seed text,p_mode text,p_recent jsonb default '[]'::jsonb)
returns jsonb language plpgsql stable security invoker set search_path='' as $pick$
declare
 v_ids jsonb:='[]'::jsonb;v_topics jsonb:='[]'::jsonb;v_categories jsonb:='[]'::jsonb;
 v_prompts jsonb:='[]'::jsonb;v_concepts jsonb:='[]'::jsonb;
 v_id text;v_topic text;v_category text;v_prompt text;v_concept text;
 v_slot integer;v_tier integer;v_relax integer;
begin
 for v_slot in 1..5 loop
  v_tier:=(array[3,3,4,4,5])[v_slot];v_id:=null;
  for v_relax in 0..3 loop
   select q.id,coalesce(q.topic_key,q.id),q.category,
     regexp_replace(lower(q.prompt),'[^a-z0-9]','','g'),coalesce(nullif(q.concept_key,''),q.id)
   into v_id,v_topic,v_category,v_prompt,v_concept
   from public.gtp_trivia_questions q
   where q.active and (q.difficulty_level=v_tier or v_relax>=2)
    and not(v_ids ? q.id)
    and not(v_topics ? coalesce(q.topic_key,q.id))
    and not(v_prompts ? regexp_replace(lower(q.prompt),'[^a-z0-9]','','g'))
    and not(v_concepts ? coalesce(nullif(q.concept_key,''),q.id))
    and (v_relax>=1 or not(v_categories ? q.category))
    and (p_mode='daily' or v_relax>=2 or not(coalesce(p_recent,'[]'::jsonb) ? q.id))
   order by case when p_mode='practice' and coalesce(p_recent,'[]'::jsonb) ? q.id then 1 else 0 end,
     abs(q.difficulty_level-v_tier),case when q.id like 'v255-%' then 0 else 1 end,
     md5(p_seed||':'||v_slot::text||':'||q.id)
   limit 1;
   exit when v_id is not null;
  end loop;
  if v_id is null then return null;end if;
  v_ids:=v_ids||to_jsonb(v_id);v_topics:=v_topics||to_jsonb(v_topic);
  v_categories:=v_categories||to_jsonb(v_category);v_prompts:=v_prompts||to_jsonb(v_prompt);
  v_concepts:=v_concepts||to_jsonb(v_concept);
 end loop;
 return v_ids;
end;
$pick$;
revoke all on function tac_private.pick_trivia_questions(text,text,jsonb) from public,anon,authenticated;


CREATE OR REPLACE FUNCTION public.gtp_trivia_api(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
 SET "TimeZone" TO 'UTC'
AS $function$
declare
 v_user uuid := auth.uid(); v_action text := p_payload ->> 'action';
 v_mode text; v_name text; v_seed text;
 v_day date := (now() at time zone 'UTC')::date;
 v_run public.gtp_trivia_runs%rowtype;
 v_q public.gtp_trivia_questions%rowtype;
 v_ids jsonb; v_feedback jsonb; v_input text; v_correct boolean := false;
 v_timeout boolean := false; v_index integer; v_run_id text; v_finished boolean;
 v_question jsonb; v_result jsonb;
 v_recent jsonb := '[]'::jsonb;v_recent_topics jsonb := '[]'::jsonb;v_used_topics jsonb;v_used_categories jsonb;
 v_pick text;v_topic text;v_cat text;v_tier integer;v_relax integer;
begin
 if v_user is null then return jsonb_build_object('error','Anonymous sign-in required'); end if;
 if v_action='start' then
   v_mode := p_payload ->> 'mode';
   v_name := btrim(p_payload ->> 'displayName');
   if v_mode not in ('daily','practice') then return jsonb_build_object('error','Invalid mode');end if;
   if v_name is null or v_name !~ '^[A-Za-z0-9 _-]{3,18}$' then
     return jsonb_build_object('error','Choose a public nickname (3–18 letters/numbers)');
   end if;
   if v_mode='daily' then
     select * into v_run from public.gtp_trivia_runs
       where user_id=v_user and day=v_day and mode='daily' limit 1;
   end if;
   if v_run.id is null then
     v_seed := case when v_mode='daily' then 'gtp:trivia:v220:'||v_day::text
          else 'gtp:trivia:practice:'||random()::text||clock_timestamp()::text end;
     -- Keep today's first published Daily set fixed across a version rollout.
     if v_mode='daily' then
       select r.question_ids into v_ids from public.gtp_trivia_runs r
       where r.day=v_day and r.mode='daily' order by r.created_at asc limit 1;
     end if;
     -- Reuse today's published set only when its prompts and concepts are distinct.
     if v_ids is not null and (
       (select count(distinct regexp_replace(lower(q.prompt),'[^a-z0-9]','','g'))
        from public.gtp_trivia_questions q where v_ids ? q.id)<>5
       or (select count(distinct coalesce(nullif(q.concept_key,''),q.id))
        from public.gtp_trivia_questions q where v_ids ? q.id)<>5
     ) then v_ids:=null;end if;
     if v_ids is null then
       if v_mode='practice' then
         select coalesce(jsonb_agg(x.question_id),'[]'::jsonb) into v_recent
         from (select distinct j.question_id from
           (select r.question_ids from public.gtp_trivia_runs r
            where r.user_id=v_user and r.created_at>clock_timestamp()-interval '30 days'
            order by r.created_at desc limit 12) previous,
           lateral jsonb_array_elements_text(previous.question_ids) as j(question_id)) x;
       end if;
       v_ids:=tac_private.pick_trivia_questions(v_seed,v_mode,v_recent);
     end if;
     if jsonb_array_length(coalesce(v_ids,'[]'::jsonb))<>5 then
       return jsonb_build_object('error','Trivia question database incomplete');
     end if;
     begin
       insert into public.gtp_trivia_runs(user_id,day,display_name,mode,question_ids,
                                         question_index,question_started_at,score,finished)
       values(v_user,v_day,v_name,v_mode,v_ids,0,clock_timestamp(),0,false)
       returning * into v_run;
     exception when unique_violation then
       select * into v_run from public.gtp_trivia_runs
         where user_id=v_user and day=v_day and mode='daily' limit 1;
       if v_run.id is null then return jsonb_build_object('error','Could not resume Daily Trivia');end if;
     end;
   end if;
 elsif v_action in ('resume','answer','next') then
   v_run_id:=p_payload ->> 'runId';
   if v_run_id is null or v_run_id !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' then
     return jsonb_build_object('error','Invalid Trivia session');
   end if;
   select * into v_run from public.gtp_trivia_runs
   where id=v_run_id::uuid and user_id=v_user for update;
   if v_run.id is null then return jsonb_build_object('error','Trivia round not found');end if;
   if not v_run.finished then
     if v_action='next' then
       if not v_run.awaiting_next then return jsonb_build_object('error','Submit an answer first');end if;
       update public.gtp_trivia_runs set awaiting_next=false,last_feedback=null,
         question_started_at=clock_timestamp(),updated_at=clock_timestamp()
         where id=v_run.id returning * into v_run;
     elsif v_action='answer' and not v_run.awaiting_next then
       select * into v_q from public.gtp_trivia_questions
        where id=(v_run.question_ids ->> v_run.question_index);
       if v_q.id is null then return jsonb_build_object('error','Question is unavailable');end if;
       v_input:=left(coalesce(p_payload ->> 'answer',''),120);
       v_timeout:=clock_timestamp()-v_run.question_started_at > interval '21.2 seconds';
       if not v_timeout and length(btrim(v_input))>0 then
         select exists(select 1 from jsonb_array_elements_text(v_q.answers) x(answer)
           where regexp_replace(lower(x.answer),'[^a-z0-9]','','g') =
                 regexp_replace(lower(v_input),'[^a-z0-9]','','g')) into v_correct;
       end if;
       v_feedback:=jsonb_build_object('correct',v_correct,'timedOut',v_timeout,
         'acceptedAnswers',v_q.answers,'explanation',v_q.explanation,'source',v_q.source,
         'earned',case when v_correct then 20 else 0 end);
       v_index:=v_run.question_index+1;
       v_finished:=v_index=5;
       update public.gtp_trivia_runs set question_index=v_index,
        score=v_run.score+(case when v_correct then 20 else 0 end),
        awaiting_next=not v_finished,finished=v_finished,
        completed_at=case when v_finished then clock_timestamp() else null end,
        last_feedback=case when v_finished then null else v_feedback end,
        updated_at=clock_timestamp()
       where id=v_run.id returning * into v_run;
     end if;
   end if;
 else return jsonb_build_object('error','Unknown Trivia action');
 end if;
 if v_run.id is null then return jsonb_build_object('error','Trivia round unavailable');end if;
 if not v_run.finished and not v_run.awaiting_next then
   select * into v_q from public.gtp_trivia_questions
      where id=(v_run.question_ids ->> v_run.question_index);
   if v_q.id is null then return jsonb_build_object('error','Question missing');end if;
   v_question:=jsonb_build_object('id',v_q.id,'prompt',v_q.prompt,'kind',v_q.kind,
        'options',v_q.options,'category',v_q.category,'difficulty',v_q.difficulty_level);
 end if;
 v_result:=jsonb_build_object('ok',true,'runId',v_run.id,'mode',v_run.mode,
   'score',v_run.score,'number',least(v_run.question_index+1,5),'total',5,
   'secondsPerQuestion',20,'finished',v_run.finished,'waitingNext',v_run.awaiting_next,
   'question',v_question,
   'deadlineAt',case when v_question is null then null
       else to_char(v_run.question_started_at + interval '20 seconds','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end,
   'feedback',case when v_action='answer' and v_feedback is not null then v_feedback
       when v_run.awaiting_next then v_run.last_feedback else null end);
 return v_result;
end;
$function$

