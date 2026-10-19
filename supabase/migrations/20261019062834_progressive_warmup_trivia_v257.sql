update public.gtp_trivia_questions set prompt=replace(prompt,'P�gos','Pagos'),options=replace(options::text,'P�gos','Pagos')::jsonb,explanation=replace(explanation,'P�gos','Pagos') where prompt like '%P�gos%' or options::text like '%P�gos%' or explanation like '%P�gos%';
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-mirage','Which Legend creates holographic decoys?','choice','["Gibraltar","Lifeline","Mirage","Wraith"]'::jsonb,'["Mirage"]'::jsonb,'warmup','mirage','identity-mirage',1,'Mirage is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-lifeline','Which Legend is known as the Combat Medic?','choice','["Lifeline","Mirage","Octane","Wraith"]'::jsonb,'["Lifeline"]'::jsonb,'warmup','lifeline','identity-lifeline',1,'Lifeline is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-pathfinder','Which friendly robot uses a grappling hook?','choice','["Bangalore","Loba","Pathfinder","Revenant"]'::jsonb,'["Pathfinder"]'::jsonb,'warmup','pathfinder','identity-pathfinder',1,'Pathfinder is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-octane','Which Legend combines Stim with a Launch Pad?','choice','["Caustic","Crypto","Newcastle","Octane"]'::jsonb,'["Octane"]'::jsonb,'warmup','octane','identity-octane',1,'Octane is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-loba','Which Legend runs the Black Market Boutique?','choice','["Fuse","Loba","Rampart","Wattson"]'::jsonb,'["Loba"]'::jsonb,'warmup','loba','identity-loba',1,'Loba is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-gibraltar','Which Legend protects the squad with a Dome of Protection?','choice','["Gibraltar","Mirage","Octane","Wraith"]'::jsonb,'["Gibraltar"]'::jsonb,'warmup','gibraltar','identity-gibraltar',1,'Gibraltar is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-wattson','Which Legend builds electric fences?','choice','["Ash","Loba","Valkyrie","Wattson"]'::jsonb,'["Wattson"]'::jsonb,'warmup','wattson','identity-wattson',1,'Wattson is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
insert into public.gtp_trivia_questions(id,prompt,kind,options,answers,category,topic_key,concept_key,difficulty_level,explanation,source,active) values('v257-starter-wraith','Which Legend uses Into the Void and Dimensional Rift?','choice','["Bangalore","Caustic","Lifeline","Wraith"]'::jsonb,'["Wraith"]'::jsonb,'warmup','wraith','identity-wraith',1,'Wraith is the Legend described by this signature ability or role.','https://www.ea.com/games/apex-legends/apex-legends/characters',true) on conflict(id) do nothing;
CREATE OR REPLACE FUNCTION tac_private.pick_trivia_questions(p_seed text, p_mode text, p_recent jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare
 v_ids jsonb:='[]'::jsonb;v_topics jsonb:='[]'::jsonb;v_categories jsonb:='[]'::jsonb;
 v_prompts jsonb:='[]'::jsonb;v_concepts jsonb:='[]'::jsonb;
 v_id text;v_topic text;v_category text;v_prompt text;v_concept text;
 v_slot integer;v_tier integer;v_relax integer;
begin
 for v_slot in 1..5 loop
  v_tier:=(array[1,1,2,3,4])[v_slot];v_id:=null;
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
$function$
;
DO $patch$ declare body text;begin select pg_get_functiondef('public.gtp_trivia_api(jsonb)'::regprocedure) into body;body:=replace(body,'if v_ids is not null and (','if v_ids is not null and ((select difficulty_level from public.gtp_trivia_questions where id=v_ids->>0)<>1 or ');execute body;end;$patch$;