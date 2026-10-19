import {MODES,hash,streak,gameScore,puzzleAnswers} from './engine.mjs';
/** Two deterministic UTC challenges: first FULL SCAN, then ONE SIGNAL.
 * Each day rotates which of the five existing game modes the track uses.
 * Older V2.17 day data is retained without modifying it.
 */
export const DAILY_TRACKS=Object.freeze(['full','signal']);
export function dailySchedule(day){
 const pivot=hash('gtp:v218:daily:'+day)%MODES.length;
 return {full:MODES[pivot],signal:MODES[(pivot+2)%MODES.length]};
}
export function dailyAnswers(day,roster){
 const schedule=dailySchedule(day),answers=puzzleAnswers(day,roster);
 return Object.fromEntries(DAILY_TRACKS.map(track=>[track,answers[schedule[track]]]));
}
export const currentDailyRounds=(days,day)=>days?.[day]?.daily218||{};
export const checkpointCount=(days,day)=>DAILY_TRACKS.reduce((n,track)=>n+Number(Boolean(currentDailyRounds(days,day)[track]?.finished)),0);
export function dailyStats(days,day){
 const flat=Object.fromEntries(Object.entries(days||{}).map(([key,entry])=>{
  const two=entry?.daily218||{};
  if(DAILY_TRACKS.every(track=>two[track]?.finished))return [key,two];
  // A legacy five-round clear is still a completed day for local streak display.
  if(MODES.every(mode=>entry?.[mode]?.finished))return [key,{full:{won:MODES.every(m=>entry[m]?.won)},signal:{won:MODES.every(m=>entry[m]?.won)}}];
  return [key,two];
 }));
 // streak() counts days only if both tracks were won.
 const fullyWon=Object.fromEntries(Object.entries(flat).map(([key,entry])=>[key,Object.fromEntries(DAILY_TRACKS.map(track=>[track,{won:!!entry[track]?.won,finished:!!entry[track]?.finished}]))]));
 // Convert incomplete days into empty maps to preserve sequential ordering.
 return streak(fullyWon,day,DAILY_TRACKS);
}
/** Original tactical field notes and practical puzzle tips. No unverifiable EA attribution. */
export const INTEL_POOL=Object.freeze({
  "1": [
    {
      "title": "BREAK THE SECOND ANGLE",
      "tip": "Before healing, move until the cover blocks both the enemy in front and the angle they could swing next. Cover that protects only your first peek is not a safe reset.",
      "category": "COMBAT · RESET",
      "source": null
    },
    {
      "title": "PUNISH THE RELOAD",
      "tip": "When an opponent stops firing to reload, use that window to move to the next cover or take space. Do not spend the entire opening re-peeking from the same predictable edge.",
      "category": "COMBAT · TIMING",
      "source": null
    },
    {
      "title": "TRADE DISTANCE",
      "tip": "Before taking a close fight, check whether a teammate can shoot the same target immediately. If a wall or elevation blocks their angle, wait or change your entry.",
      "category": "COMBAT · TEAMFIGHT",
      "source": null
    },
    {
      "title": "ONE CRACK IS NOT A PUSH",
      "tip": "After breaking a shield, check distance and cover before chasing. If the enemy can heal before you arrive, take the better position instead of sprinting into their teammates.",
      "category": "COMBAT · DECISIONS",
      "source": null
    },
    {
      "title": "RESET BEFORE LOOT",
      "tip": "After a squad wipe, restore your fighting state and watch an approach before opening every death box. A third party wants to catch three players looking at loot.",
      "category": "COMBAT · THIRD PARTIES",
      "source": null
    },
    {
      "title": "CHANGE THE RE-PEEK",
      "tip": "After showing your position, use another edge or elevation for your next shot. Repeating the same wide peek gives the enemy a pre-aimed target.",
      "category": "COMBAT · ANGLES",
      "source": null
    },
    {
      "title": "CROSS THE OPEN ON A RELOAD",
      "tip": "Watch for the opponent to stop firing before crossing a gap. Move from cover to cover rather than treating a single piece of smoke or utility as permanent protection.",
      "category": "COMBAT · MOVEMENT",
      "source": null
    },
    {
      "title": "FINISH THE TRADE, THEN RESET",
      "tip": "When your teammate deals damage, add damage from a safe angle immediately. If the target escapes, regroup rather than turning one short trade into three separate chases.",
      "category": "COMBAT · TEMPO",
      "source": null
    }
  ],
  "2": [
    {
      "title": "ROTATE TO AN EXIT",
      "tip": "Before holding a building, identify the route you would use if a second squad arrived. A position with only one safe doorway can become a trap after the next fight starts.",
      "category": "ROTATION · EXITS",
      "source": null
    },
    {
      "title": "CLEAR THE NEXT COVER",
      "tip": "Before crossing open ground, inspect the cover you plan to reach. A good destination is useful only if another squad is not already holding it.",
      "category": "ROTATION · SCOUTING",
      "source": null
    },
    {
      "title": "DISENGAGE WITH A DESTINATION",
      "tip": "Call the exact rock, roof or building where the squad will regroup. Running away in three directions makes it easier for a chasing squad to isolate someone.",
      "category": "ROTATION · RESET",
      "source": null
    },
    {
      "title": "KEEP YOUR BACK CLEAR",
      "tip": "Before committing to a long ranged fight, look at the route behind your squad. If another team can walk into your back, shorten the trade and reposition.",
      "category": "ROTATION · THIRD PARTIES",
      "source": null
    },
    {
      "title": "TAKE SPACE AFTER DAMAGE",
      "tip": "If your damage forces the enemy into healing, move to a stronger piece of cover while a teammate holds their escape. Progress toward control rather than chasing a damage number.",
      "category": "ROTATION · PRESSURE",
      "source": null
    },
    {
      "title": "DON'T SHARE ONE PEEK",
      "tip": "Hold nearby angles that can support each other instead of stacking three players at one doorway. Keep enough distance that one grenade does not force the whole squad off the position.",
      "category": "ROTATION · SPACING",
      "source": null
    },
    {
      "title": "ARRIVE TOGETHER",
      "tip": "Pause at the final safe cover before an entry. Count teammates in, then cross together; reaching the fight first is not useful if the other two are still rotating.",
      "category": "ROTATION · ENTRY",
      "source": null
    },
    {
      "title": "SAVE A WAY OUT",
      "tip": "Before spending the squad's last movement option to enter a fight, choose a fallback route. If the fight stalls, you still need a way to leave before another squad arrives.",
      "category": "ROTATION · UTILITY",
      "source": null
    }
  ],
  "3": [
    {
      "title": "FULL SCAN: KEEP THE GREEN",
      "tip": "A confirmed green trait is saved across guesses. Use the remaining unknown traits to choose the next Legend; do not spend another guess proving a field you already know.",
      "category": "THE APEX CHALLENGE · CLASSIC",
      "source": null
    },
    {
      "title": "ONE SIGNAL: TEST A DIFFERENCE",
      "tip": "Before guessing again, compare candidates against every confirmed field. Pick a Legend who can resolve an unknown trait rather than one who simply resembles your previous guess.",
      "category": "THE APEX CHALLENGE · ONE SIGNAL",
      "source": null
    },
    {
      "title": "PIXEL: READ THE OUTLINE",
      "tip": "Look at headwear, shoulder shape and equipment placement before chasing face detail. A distinctive silhouette can identify the Legend while the image is still heavily pixelated.",
      "category": "THE APEX CHALLENGE · PIXEL",
      "source": null
    },
    {
      "title": "QUOTE: LISTEN TO DELIVERY",
      "tip": "Replay the line for accent, rhythm and vocabulary. Treat the voice as the clue; the decorative host in the background is never a hint to the hidden answer.",
      "category": "THE APEX CHALLENGE · QUOTE",
      "source": null
    },
    {
      "title": "ABILITY: READ THE SYMBOL",
      "tip": "Separate the ability icon's shape from its visual theme. Compare the ability itself, then use the scanner fields to eliminate Legends with a similar looking kit.",
      "category": "THE APEX CHALLENGE · ABILITY",
      "source": null
    },
    {
      "title": "EMOJI: READ THE COMBINATION",
      "tip": "Treat the revealed symbols as a group: one may describe personality while another describes a gadget or ability. After each guess, reconsider the combination with the newly revealed symbol.",
      "category": "THE APEX CHALLENGE · EMOJI",
      "source": null
    },
    {
      "title": "TRIVIA: ANSWER THE CATEGORY",
      "tip": "Check whether the question asks for a Legend, ability, class or location before committing. A related name is still wrong if it is from the wrong category.",
      "category": "THE APEX CHALLENGE · TRIVIA",
      "source": null
    },
    {
      "title": "DAILY: CHECK THE RULESET",
      "tip": "Daily Full Scan and One Signal are fixed stages, while Free Play lets you practice. Use Free Play to learn an unfamiliar mode without changing your ranked run.",
      "category": "THE APEX CHALLENGE · DAILY",
      "source": null
    }
  ]
});
export function intelFor(day,index){
  const pool=INTEL_POOL[index];
  if(!pool)throw Error('Unknown intel checkpoint');
  return pool[hash('gtp:v223:intel:'+index+':'+day)%pool.length];
}
// Backward compatible API used by earlier release tests.
export function rewardFor(day,index){
  const entry=intelFor(day,index);
  return (index===2?'ADVANCED INTEL · ':'')+entry.title+' · '+entry.tip;
}
