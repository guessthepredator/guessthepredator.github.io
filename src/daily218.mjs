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
      "title": "HOLSTER BEFORE THE CROSS",
      "tip": "Holster your weapon when travelling between fights. Draw it again before reaching the corner where you expect contact, rather than sprinting into an enemy empty-handed.",
      "drill": "On PC, practise 3 to holster, sprint between two rocks, then draw your weapon before the second rock.",
      "category": "MOVEMENT",
      "source": "https://help.ea.com/en/articles/apex-legends/pc-and-controller-settings/"
    },
    {
      "title": "TURN A SLOPE INTO A ROTATION",
      "tip": "Sprint into a downhill slide to cover ground. Pick the next piece of cover before sliding, so the extra movement carries you somewhere useful.",
      "drill": "Find a slope in the Firing Range. Repeat the same route with a sprint and with a slide; compare where you finish.",
      "category": "MOVEMENT",
      "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
    },
    {
      "title": "PING THE EXACT LOOT",
      "tip": "Use a loot ping on the item itself. Your squad can find the attachment or ammo without searching the entire building or relying on a vague callout.",
      "drill": "When you find an attachment you do not need, aim at it and ping it before leaving the room.",
      "category": "COMMUNICATION",
      "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
    },
    {
      "title": "SPLIT ROOMS, NOT THE SQUAD",
      "tip": "Land in nearby rooms instead of competing for the same floor loot. Stay close enough that you can reach a teammate before their first fight ends.",
      "drill": "Assign one room or floor to each player, then meet at the same exit before moving to the next building.",
      "category": "LOOT ROUTE",
      "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
    },
    {
      "title": "MATCH AMMO BEFORE MOVING",
      "tip": "Check that the ammo in your backpack matches both equipped weapons. Unused ammo occupies space that could hold healing items or a grenade.",
      "drill": "After your first weapon swap, open the inventory and remove the ammo type you no longer use.",
      "category": "INVENTORY",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "MAKE THE PING MEAN SOMETHING",
      "tip": "Open the ping wheel and choose the message you intend: enemy, movement or looting. One accurate ping saves teammates from interpreting repeated generic markers.",
      "drill": "Use a movement ping on your next destination, then an enemy ping only if you actually spot a player.",
      "category": "CONTROLS",
      "source": "https://help.ea.com/en/articles/apex-legends/pc-and-controller-settings/"
    },
    {
      "title": "BUILD A TWO-RANGE LOADOUT",
      "tip": "Pair weapons for different engagement distances. Before looting another gun, decide which role it would replace rather than carrying two weapons you cannot use comfortably.",
      "drill": "In the Firing Range, use one weapon on a nearby dummy and the other on a farther target, then swap without opening inventory.",
      "category": "LOADOUT",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "PRACTISE THE HEAL INPUT",
      "tip": "Learn your healing item controls before a fight. Choosing an item quickly means you can spend your attention checking cover instead of searching through menus.",
      "drill": "In the Firing Range, select a shield item, then a health item using your normal bindings without looking at the keyboard.",
      "category": "CONTROLS",
      "source": "https://help.ea.com/en/articles/apex-legends/pc-and-controller-settings/"
    }
  ],
  "2": [
    {
      "title": "SWAP OR RELOAD: TEST BOTH",
      "tip": "When a magazine runs dry at close range, a ready second weapon gives you another option. Compare the swap with your reload before relying on either.",
      "drill": "Empty a magazine into a dummy, switch weapons and finish it. Repeat with a reload and compare your exposure.",
      "category": "WEAPON HANDLING",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "AIM FIRST, THEN ADD MOVEMENT",
      "tip": "Build a repeatable firing pattern before adding a full strafe. If movement makes your shots scatter, shorten the burst instead of spraying through an entire magazine.",
      "drill": "Fire three short bursts at the same target while stationary; repeat while strafing and compare the spread.",
      "category": "AIM DRILL",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "TEST HIPFIRE UP CLOSE",
      "tip": "Try hipfire at close range instead of automatically aiming down sights. Different weapons behave differently, so learn the distance where your own shots remain reliable.",
      "drill": "Use the same nearby dummy for one hipfire magazine and one aimed magazine. Repeat while moving sideways.",
      "category": "CLOSE RANGE",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "STOP WHEN THE TARGET DISAPPEARS",
      "tip": "Break your spray when the opponent reaches solid cover. Use that moment to reload or move your crosshair to the exit they can actually use.",
      "drill": "Track a moving dummy, stop firing when it crosses cover, and aim at the far edge before shooting again.",
      "category": "TRIGGER DISCIPLINE",
      "source": "https://help.ea.com/en/articles/apex-legends/guns-and-weapons/"
    },
    {
      "title": "GRENADE THE COVER, HOLD THE EXIT",
      "tip": "Use a grenade to make an enemy leave cover, then aim at their escape route. Watching the explosion alone wastes the opening you just created.",
      "drill": "Throw toward one side of a rock and immediately aim at the other side with your weapon ready.",
      "category": "GRENADES",
      "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
    },
    {
      "title": "MOVE WHILE THE ENEMY HEALS",
      "tip": "After forcing an opponent to retreat, take a nearby angle that can see their next move. Avoid running straight past cover just to chase the damage.",
      "drill": "Call your damage, move one cover closer, then wait for a teammate to hold the original angle.",
      "category": "PRESSURE",
      "source": "https://help.ea.com/en/articles/apex-legends/terms-guide/"
    },
    {
      "title": "KNOCKED: FACE THE THREAT",
      "tip": "When knocked, use your knockdown shield toward incoming fire while moving toward cover. Give the teammate reviving you a protected side to work from.",
      "drill": "Ping the attacker, turn your shield toward them, and crawl to the nearest cover instead of facing your teammate.",
      "category": "RECOVERY",
      "source": "https://help.ea.com/en/articles/apex-legends/how-to-play/"
    },
    {
      "title": "TURN ONE ANGLE INTO TWO",
      "tip": "A second nearby angle can expose an opponent hiding from your teammate. Keep the angle close enough that either of you can retreat back to shared cover.",
      "drill": "When your teammate holds a doorway, take the adjacent window rather than standing directly behind their weapon.",
      "category": "CROSSFIRE",
      "source": "https://help.ea.com/en/articles/apex-legends/terms-guide/"
    }
  ],
  "3": [
    {
      "title": "BANGALORE: SMOKE THE CROSSING",
      "tip": "Use Smoke Launcher to interrupt the sightline covering your route. Plan where you will exit the smoke before firing it, so your squad moves together.",
      "drill": "Ping your destination, smoke the exposed sightline, then cross to that cover as a group.",
      "category": "BANGALORE",
      "source": "https://www.ea.com/games/apex-legends/apex-legends/characters-hub/bangalore"
    },
    {
      "title": "LIFELINE: REVIVE BEHIND COVER",
      "tip": "Use Combat Revive after your knocked teammate reaches a safer position. While the revive runs, watch the angle an opponent would use to interrupt it.",
      "drill": "Ping cover for the knocked player, start the revive there, and keep your weapon on the closest approach.",
      "category": "LIFELINE",
      "source": "https://www.ea.com/games/apex-legends/apex-legends/characters-hub/lifeline"
    },
    {
      "title": "LOBA: LOOT WITH AN EXIT",
      "tip": "Place Black Market Boutique near cover your squad can actually defend. Decide your two priority pickups before browsing so looting does not stall the rotation.",
      "drill": "Call the next rotation first, place the shop near that exit, and take the items you need for the next fight.",
      "category": "LOBA",
      "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
    },
    {
      "title": "WATTSON: SAVE AN ACCELERANT",
      "tip": "Wattson can fully charge her ultimate with an Ultimate Accelerant. Keep one ready when your next position needs an Interception Pylon.",
      "drill": "Before rotating, check your ultimate. If it is unavailable, prepare the accelerant before enemies pressure the next building.",
      "category": "WATTSON",
      "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
    },
    {
      "title": "GIBRALTAR: WORK THE DOME EDGE",
      "tip": "Use the Dome of Protection edge to control when you expose yourself. Step out for a short shot, then move back into protection instead of remaining outside.",
      "drill": "In a safe practice fight, take one shot from the dome edge and return inside before preparing the next shot.",
      "category": "GIBRALTAR",
      "source": "https://help.ea.com/en/articles/apex-legends/terms-guide/"
    },
    {
      "title": "CATALYST: REBUILD THE ENTRY",
      "tip": "Barricade can reinforce a doorway even after its doors are destroyed. Use that entry to buy recovery time while your teammate watches another route.",
      "drill": "After taking a building, inspect the broken doorway and reinforce it before healing or opening a death box.",
      "category": "CATALYST",
      "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
    },
    {
      "title": "PATHFINDER: ZIPLINE TO COVER",
      "tip": "Choose a Zipline Gun destination with cover at the far end. Reaching high ground matters less if the entire squad arrives exposed on the same edge.",
      "drill": "Ping the landing cover before placing the line, and agree where the first player will move after getting off.",
      "category": "PATHFINDER",
      "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
    },
    {
      "title": "RAMPART: FIRE THROUGH THE WALL",
      "tip": "Amped Cover improves outgoing shots through its amped section. Set it where you can shoot a useful lane while still stepping away from incoming pressure.",
      "drill": "Build behind solid cover, check the outgoing firing lane, and keep a route back behind that solid cover.",
      "category": "RAMPART",
      "source": "https://help.ea.com/en/articles/apex-legends/abilities/"
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

/** Ranked progression never routes into practice, including after the second stage. */
export function nextDailyStep(rounds,triviaComplete=false){
 if(!rounds.full?.finished)return 'full';
 if(!rounds.signal?.finished)return 'signal';
 return triviaComplete?'leaderboard':'trivia';
}
