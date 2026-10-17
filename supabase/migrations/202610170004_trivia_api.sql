-- Server-authoritative Trivia RPC: clients never read the correct answers until after submission.
create or replace function public.gtp_trivia_api(p_payload jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
 v_user uuid := auth.uid();
 v_action text := p_payload ->> 'action';
 v_mode text;
 v_name text;
 v_seed text;
 v_day date := (now() at time zone 'UTC')::date;
 v_run public.gtp_trivia_runs%rowtype;
 v_q public.gtp_trivia_questions%rowtype;
 v_ids jsonb;
 v_feedback jsonb;
 v_input text;
 v_answer text;
 v_correct boolean := false;
 v_timeout boolean := false;
 v_index integer;
 v_run_id text;
 v_finished boolean;
 v_question jsonb;
 v_result jsonb;
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
     with categories as (
       select q.category,(array_agg(q.id order by md5(v_seed||':pick:'||q.id)))[1] as selected
       from public.gtp_trivia_questions q
       where q.active and q.category in ('classes','abilities','odd-one-out','write','maps')
       group by q.category
     ) select jsonb_agg(selected order by md5(v_seed||':order:'||selected)) into v_ids from categories;
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
        'options',v_q.options,'category',v_q.category);
 end if;
 v_result:=jsonb_build_object('ok',true,'runId',v_run.id,'mode',v_run.mode,
   'score',v_run.score,'number',least(v_run.question_index+1,5),'total',5,
   'secondsPerQuestion',20,'finished',v_run.finished,'waitingNext',v_run.awaiting_next,
   'question',v_question,
   'deadlineAt',case when v_question is null then null
       else to_char((v_run.question_started_at + interval '20 seconds') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end,
   'feedback',case when v_action='answer' and v_feedback is not null then v_feedback
       when v_run.awaiting_next then v_run.last_feedback else null end);
 return v_result;
end;
$$;
revoke all on function public.gtp_trivia_api(jsonb) from public;
grant execute on function public.gtp_trivia_api(jsonb) to authenticated;
