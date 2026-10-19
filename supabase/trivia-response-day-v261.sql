-- Preserve the authenticated RPC, grants, timing and scoring. Add the saved run's UTC date to its response.
do $review$
declare definition text; needle text := '''mode'',v_run.mode,';
begin
 select pg_get_functiondef(oid) into strict definition from pg_proc where pronamespace='public'::regnamespace and proname='gtp_trivia_api';
 if position('''day'',v_run.day' in definition)=0 then
  if position(needle in definition)=0 then raise exception 'Unexpected Trivia response shape'; end if;
  execute replace(definition,needle,'''mode'',v_run.mode,''day'',v_run.day,');
 end if;
end;
$review$;
