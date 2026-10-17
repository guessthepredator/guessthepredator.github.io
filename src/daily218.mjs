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
/**
 * Source-linked Apex gameplay intel. Each entry is paraphrased from official
 * EA guides; avoid relying on volatile per-season tuning numbers.
 * Deterministic per UTC day: reopening the checkpoint shows the SAME entry.
 */
export const INTEL_POOL=Object.freeze({
  1:Object.freeze([
  {
    "title": "PING WITH PURPOSE",
    "tip": "Use the ping wheel to mark your intended route and nearby points of interest. A direction ping is much easier for teammates to act on than a vague callout.",
    "category": "SQUAD COMMUNICATION",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "LAND NEAR, NOT ON TOP",
    "tip": "Stay close enough to your squad to reunite quickly after dropping, but check different nearby spaces instead of all landing on the same loot spot.",
    "category": "SMART LANDINGS",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "READ THE RING EARLY",
    "tip": "Check where the Ring is moving before committing to a long detour. Ping a shared destination so every teammate knows the next safe meeting point.",
    "category": "ROTATION PLANNING",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "MAKE A PLAN WITH YOUR PINGS",
    "tip": "Use pings to point out a location or route even if no one has a microphone. A quick agreed route helps squads stay coordinated.",
    "category": "PING SYSTEM",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "STAY IN TEAM RANGE",
    "tip": "Avoid drifting so far away that teammates cannot respond to your pings or follow your rotation. Recheck your map when the squad begins to separate.",
    "category": "TEAM SPACING",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "PICK A BACKUP LEGEND",
    "tip": "Learn two or three Legends you genuinely enjoy. If a teammate chooses your main, you will still have a familiar kit and a useful role for the squad.",
    "category": "LEGEND ROTATION",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "LEARN YOUR CLASS ROLE",
    "tip": "Recon focuses on information, Controller on space, Support on team recovery, Skirmisher on movement, and Assault on combat pressure. Choose the role the squad needs.",
    "category": "CLASS IDENTITY",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "USE MOVEMENT ROUTES TOGETHER",
    "tip": "A jump pad, zipline or other mobility route is more helpful when teammates know where it ends. Ping the landing point before the group rotates.",
    "category": "SQUAD MOBILITY",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  }
]),
  2:Object.freeze([
  {
    "title": "THREE LEGEND ROLES, ONE POOL",
    "tip": "Build a personal pool with a comfort pick, a pressure pick and a squad-value pick. That gives you a reliable choice even when team composition changes.",
    "category": "LEGEND FLEXIBILITY",
    "source": "https://www.ea.com/games/apex-legends/apex-legends/news/building-your-legend-pool"
  },
  {
    "title": "USE RECON AS A TEAM TOOL",
    "tip": "When playing a Recon Legend, share the information you discover with the squad right away. Information is much more useful when everyone adjusts together.",
    "category": "RECON INTEL",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "PLAN CONTROLLER POSITIONS",
    "tip": "Controller Legends specialize in defending an area. Agree on which position the squad wants to hold before committing all your utility to it.",
    "category": "CONTROLLER PLANNING",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "MAKE SUPPORT REACHABLE",
    "tip": "Support abilities are most useful when your squad can actually use them. Avoid taking a separate route that makes it hard for allies to benefit from your kit.",
    "category": "SUPPORT VALUE",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "DON'T SPLIT THE ROTATION",
    "tip": "Before a long reposition, mark the destination and wait for teammates to confirm. Even excellent individual mobility has less value if the squad arrives separately.",
    "category": "SQUAD TEMPO",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "MATCH YOUR LEGEND TO A NEED",
    "tip": "Instead of choosing only by popularity, decide which gap the squad has: scouting, area control, mobility or team recovery. Build a familiar option for several roles.",
    "category": "TEAM COMPOSITION",
    "source": "https://www.ea.com/games/apex-legends/apex-legends/news/building-your-legend-pool"
  },
  {
    "title": "TEST YOUR KIT UNDER PRESSURE",
    "tip": "When evaluating a new Legend, ask whether you can use the Tactical reliably and whether it helps your squad in a difficult moment. Consistency beats novelty.",
    "category": "LEGEND MASTERY",
    "source": "https://www.ea.com/games/apex-legends/apex-legends/news/building-your-legend-pool"
  },
  {
    "title": "ROTATE WITH MAP AWARENESS",
    "tip": "Get familiar with map landmarks and nearby paths so your squad can choose a shared route toward the Ring rather than making last-second individual detours.",
    "category": "MAP KNOWLEDGE",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  }
]),
  3:Object.freeze([
  {
    "title": "TELL ABILITIES APART",
    "tip": "Each Legend has a passive, tactical and ultimate ability. Learn which of these three categories an effect belongs to before attempting a Trivia answer.",
    "category": "ABILITY KNOWLEDGE",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "STUDY CLASS STRENGTHS",
    "tip": "The five Legend classes have different strategic roles. Link each Legend's class to its purpose, then learn the unique kit instead of memorizing only the name.",
    "category": "LEGEND CLASSES",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "PRACTICE TWO OR THREE KITS",
    "tip": "Use a small rotation of familiar Legends to learn how their abilities actually work. Real in-game familiarity makes ability questions less dependent on guessing.",
    "category": "PLAY TO LEARN",
    "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
  },
  {
    "title": "DISTINGUISH CLASS FROM KIT",
    "tip": "A class describes a broad playstyle, while passive, tactical and ultimate abilities belong to each individual Legend. Treat these as two separate facts in Trivia.",
    "category": "CLASS VS ABILITY",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "CHECK THE LEGEND GUIDE",
    "tip": "If two abilities sound similar, compare their descriptions in EA's current Legend guide. Names and ability details may change across live-game updates.",
    "category": "VERIFIED REFERENCE",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  },
  {
    "title": "LEARN BY ROLE AND EXAMPLE",
    "tip": "Pick one Legend from each class and note the team's role that kit supports. Grouping knowledge by purpose is easier to review than a disconnected list.",
    "category": "REVIEW METHOD",
    "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
  }
])
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
