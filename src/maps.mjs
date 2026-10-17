import {externalMapSources} from './external_map_sources.mjs';
import {mapMediaManifest} from './map_media_manifest.mjs';
/** Actual POI screenshots are referenced by their documented Wiki filenames.
 * Real game assets are NOT manufactured or silently replaced by generic art.
 * Local files under assets/maps are always preferred when present.
 */
export const MAPS=Object.freeze(["Kings Canyon", "World’s Edge", "Olympus", "Storm Point", "Broken Moon", "E-District"]);
export const LOCATIONS=Object.freeze([
 {
  "id": "kc-caustic-exterior",
  "map": "Kings Canyon",
  "poi": "Caustic Treatment · Exterior",
  "kind": "Exterior",
  "file": "CausticTreatment 01.jpg",
  "clue": "Yellow industrial processing towers surrounded by canyon rock."
 },
 {
  "id": "kc-caustic-interior",
  "map": "Kings Canyon",
  "poi": "Caustic Treatment · Interior",
  "kind": "Interior",
  "file": "CausticTreatment 02.jpg",
  "clue": "A multilevel industrial room with bright containment chambers."
 },
 {
  "id": "kc-crypto-interior",
  "map": "Kings Canyon",
  "poi": "Crypto’s Map Room · Interior",
  "kind": "Interior",
  "file": "MapRoom 01.png",
  "clue": "A high-tech surveillance space filled with giant screens."
 },
 {
  "id": "kc-bunker",
  "map": "Kings Canyon",
  "poi": "Bunker · Corridor",
  "kind": "Interior",
  "file": "",
  "clue": "A long protected concrete corridor cutting through the mountain."
 },
 {
  "id": "kc-gauntlet",
  "map": "Kings Canyon",
  "poi": "Octane’s Gauntlet",
  "kind": "Exterior",
  "file": "Gauntlet 01.jpg",
  "clue": "An arena-like course with ramps and distinctive obstacle structures."
 },
 {
  "id": "kc-cage",
  "map": "Kings Canyon",
  "poi": "The Cage",
  "kind": "Exterior",
  "file": "",
  "clue": "Tall open structures and scaffolds loom over rocky land."
 },
 {
  "id": "we-big-maude",
  "map": "World’s Edge",
  "poi": "Big Maude",
  "kind": "Exterior",
  "file": "Big Maude 1.png",
  "clue": "A heavily customized ship set into a volcanic landscape."
 },
 {
  "id": "we-big-maude-interior",
  "map": "World’s Edge",
  "poi": "Big Maude · Workshop",
  "kind": "Interior",
  "file": "",
  "clue": "A dense industrial shop with customized machinery inside a ship."
 },
 {
  "id": "we-lava",
  "map": "World’s Edge",
  "poi": "Lava Siphon",
  "kind": "Exterior",
  "file": "S10 lavasiphon after.jpg",
  "clue": "Raised platforms cut across glowing magma and volcanic rock."
 },
 {
  "id": "we-climatizer",
  "map": "World’s Edge",
  "poi": "Climatizer",
  "kind": "Exterior",
  "file": "",
  "clue": "An enormous ice and science facility with bright blue machinery."
 },
 {
  "id": "we-countdown",
  "map": "World’s Edge",
  "poi": "Countdown",
  "kind": "Exterior",
  "file": "",
  "clue": "A large circular industrial launch-style structure."
 },
 {
  "id": "we-trials",
  "map": "World’s Edge",
  "poi": "Bloodhound’s Trials · Arena",
  "kind": "Interior",
  "file": "",
  "clue": "An enclosed trial arena surrounded by icy stone."
 },
 {
  "id": "ol-bonsai",
  "map": "Olympus",
  "poi": "Bonsai Plaza",
  "kind": "Exterior",
  "file": "S7 Olympus bonsaiplaza1.jpg",
  "clue": "Elegant elevated towers and plazas above the clouds."
 },
 {
  "id": "ol-estates",
  "map": "Olympus",
  "poi": "Autumn Estates",
  "kind": "Exterior",
  "file": "S7 Olympus autumnestates.jpg",
  "clue": "Villas and lawns set among graceful landscaped paths."
 },
 {
  "id": "ol-estates-interior",
  "map": "Olympus",
  "poi": "Autumn Estates · Villa",
  "kind": "Interior",
  "file": "",
  "clue": "A modern residential interior with clean angles and wide windows."
 },
 {
  "id": "ol-hammond",
  "map": "Olympus",
  "poi": "Hammond Labs · Interior",
  "kind": "Interior",
  "file": "",
  "clue": "A large technological research building beneath sleek glass."
 },
 {
  "id": "ol-rift",
  "map": "Olympus",
  "poi": "Rift",
  "kind": "Exterior",
  "file": "",
  "clue": "An unstable vortex dominates broad futuristic platforms."
 },
 {
  "id": "ol-oasis",
  "map": "Olympus",
  "poi": "Oasis",
  "kind": "Exterior",
  "file": "",
  "clue": "Twin tower buildings and gardens over a floating city."
 },
 {
  "id": "sp-barometer",
  "map": "Storm Point",
  "poi": "Barometer",
  "kind": "Exterior",
  "file": "S11 stormpoint barometer.png",
  "clue": "A monumental weather research platform against a tropical coast."
 },
 {
  "id": "sp-command",
  "map": "Storm Point",
  "poi": "Command Center",
  "kind": "Exterior",
  "file": "S11 stormpoint commandcenter.jpg",
  "clue": "A huge mountain fortification overlooking jungle terrain."
 },
 {
  "id": "sp-command-interior",
  "map": "Storm Point",
  "poi": "Command Center · Interior",
  "kind": "Interior",
  "file": "",
  "clue": "A towering internal vertical complex built into the mountain."
 },
 {
  "id": "sp-catcher",
  "map": "Storm Point",
  "poi": "Storm Catcher",
  "kind": "Exterior",
  "file": "",
  "clue": "A massive circular facility rises across steep tropical hills."
 },
 {
  "id": "sp-mill",
  "map": "Storm Point",
  "poi": "The Mill",
  "kind": "Exterior",
  "file": "",
  "clue": "Coastal round buildings topped by striking wind turbines."
 },
 {
  "id": "sp-lightning",
  "map": "Storm Point",
  "poi": "Lightning Rod",
  "kind": "Exterior",
  "file": "",
  "clue": "High-altitude engineering towers rise above the island."
 },
 {
  "id": "bm-terraformer",
  "map": "Broken Moon",
  "poi": "Terraformer",
  "kind": "Exterior",
  "file": "S15 brokenmoon terraformer.png",
  "clue": "A colossal terraforming installation on the lunar horizon."
 },
 {
  "id": "bm-production",
  "map": "Broken Moon",
  "poi": "Production Yard",
  "kind": "Exterior",
  "file": "S15 brokenmoon productionyard.png",
  "clue": "A long symmetrical factory stretches toward a cliff."
 },
 {
  "id": "bm-production-interior",
  "map": "Broken Moon",
  "poi": "Production Yard · Interior",
  "kind": "Interior",
  "file": "",
  "clue": "An enclosed industrial factory with a wide central entry."
 },
 {
  "id": "bm-core",
  "map": "Broken Moon",
  "poi": "Perpetual Core · Turbine",
  "kind": "Interior",
  "file": "S15 brokenmoon perpetualcore.png",
  "clue": "A huge central rotating turbine surrounded by a circular chamber."
 },
 {
  "id": "bm-stasis",
  "map": "Broken Moon",
  "poi": "Stasis Array",
  "kind": "Exterior",
  "file": "S15 brokenmoon stasisnetarray.png",
  "clue": "Arrays of technological structures stand under a damaged moon."
 },
 {
  "id": "bm-alpha",
  "map": "Broken Moon",
  "poi": "Alpha Base",
  "kind": "Exterior",
  "file": "",
  "clue": "A lunar outpost extends across a field of exposed rock."
 },
 {
  "id": "ed-city-hall",
  "map": "E-District",
  "poi": "City Hall",
  "kind": "Exterior",
  "file": "S22 cityhall.png",
  "clue": "A cluster of monumental civic buildings surrounding a fountain."
 },
 {
  "id": "ed-city-hall-interior",
  "map": "E-District",
  "poi": "City Hall · Lobby",
  "kind": "Interior",
  "file": "",
  "clue": "A towering two-storey civic lobby inside modern buildings."
 },
 {
  "id": "ed-boardwalk",
  "map": "E-District",
  "poi": "Boardwalk",
  "kind": "Exterior",
  "file": "S22 boardwalk.png",
  "clue": "Nightlife buildings and a coastal street illuminated by neon."
 },
 {
  "id": "ed-boardwalk-interior",
  "map": "E-District",
  "poi": "Boardwalk · Nightclub",
  "kind": "Interior",
  "file": "",
  "clue": "A moody nightclub overlooking the waterfront."
 },
 {
  "id": "ed-galleria",
  "map": "E-District",
  "poi": "Galleria · Shopping Arcade",
  "kind": "Interior",
  "file": "",
  "clue": "Glass domes above a multi-level enclosed shopping center."
 },
 {
  "id": "ed-neon",
  "map": "E-District",
  "poi": "Neon Square",
  "kind": "Exterior",
  "file": "",
  "clue": "Bright signs and dense city streets beneath futuristic towers."
 }
]);
/** Legacy location IDs retained for compatibility tests only; GTP2 daily puzzles use the new catalog. */
export const LEGACY_LOCATIONS=Object.freeze([
 {id:'kc-gauntlet',map:'Kings Canyon',poi:'Octane’s Gauntlet',legacy:true,clue:'A high-speed course with jumps and a fiery arena.'},
 {id:'kc-crypto',map:'Kings Canyon',poi:'Crypto’s Map Room',legacy:true,clue:'A reconnaissance complex with a giant scanning display.'},
 {id:'we-fragment',map:'World’s Edge',poi:'Fragment East',legacy:true,clue:'Dense ruined city blocks in a cold volcanic landscape.'},
 {id:'we-trials',map:'World’s Edge',poi:'Bloodhound’s Trials',legacy:true,clue:'An icy arena filled with Trials architecture.'},
 {id:'olympus-bonsai',map:'Olympus',poi:'Bonsai Plaza',legacy:true,clue:'Upscale towers and elevated city plazas above the clouds.'},
 {id:'olympus-estates',map:'Olympus',poi:'Autumn Estates',legacy:true,clue:'Low residential buildings with open lawns and ornamental trees.'},
 {id:'sp-barometer',map:'Storm Point',poi:'Barometer',legacy:true,clue:'An enormous weather installation on a tropical island.'},
 {id:'sp-cascade',map:'Storm Point',poi:'Cascade Falls',legacy:true,clue:'A tropical settlement surrounded by waterfalls.'},
 {id:'bm-terraformer',map:'Broken Moon',poi:'Terraformer',legacy:true,clue:'A colossal terraforming facility on the moon.'},
 {id:'bm-prom',map:'Broken Moon',poi:'Promenade',legacy:true,clue:'A glass-and-metal central walkway through lunar buildings.'},
 {id:'ed-cityhall',map:'E-District',poi:'City Hall',legacy:true,clue:'A landmark civic building in a dense futuristic metropolis.'},
 {id:'ed-boardwalk',map:'E-District',poi:'Boardwalk',legacy:true,clue:'A brightly lit commercial district in the city.'},
]);
export const resolveLocation=id=>LOCATIONS.find(x=>x.id===id)||LEGACY_LOCATIONS.find(x=>x.id===id);
/** Source-backed external screenshot references plus explicit local visual-intel fallback. */
export const mapLocalPath=(entry,ext='webp')=>`./assets/maps/${entry.id}.${ext}`;
const safeLocalName=name=>typeof name==='string' && /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)?\.(?:webp|png|jpg|jpeg)$/i.test(name);
export function mapShots(entry,angle=0){
 if(!entry)return [];
 const manifest=(mapMediaManifest[entry.id]||[]).filter(safeLocalName)
   .map(filename=>`./assets/maps/${filename}`);
 if(manifest.length){
   const start=((Math.trunc(Number(angle)||0)%manifest.length)+manifest.length)%manifest.length;
   return [...manifest.slice(start),...manifest.slice(0,start),...externalCandidates(entry),`./assets/map-recon/${entry.id}.svg`];
 }
 // Backward-compatible single-image installation without a manifest.
 return [...externalCandidates(entry),`./assets/map-recon/${entry.id}.svg`];
}
export function mapRound(entry){return {answer:entry.id,stage:1,mapGuesses:[],poiGuesses:[],won:false,finished:false,loss:null,startedAt:null,finishedAt:null,mediaAngle:Math.floor(Math.random()*100000)};}
export function mapGuess(round,value,entry,now=Date.now()){
 if(round.finished)return round;
 if(round.stage===1){
   if(!MAPS.includes(value)||round.mapGuesses.includes(value))return round;
   const guesses=[...round.mapGuesses,value];
   if(value===entry.map)return {...round,mapGuesses:guesses,stage:2,startedAt:round.startedAt??now};
   const finished=guesses.length>=3;
   return {...round,mapGuesses:guesses,finished,loss:finished?'map':null,finishedAt:finished?now:null,startedAt:round.startedAt??now};
 }
 const choices=(entry.legacy?LEGACY_LOCATIONS:LOCATIONS).filter(x=>x.map===entry.map).map(x=>x.poi);
 if(!choices.includes(value)||round.poiGuesses.includes(value))return round;
 const guesses=[...round.poiGuesses,value],won=value===entry.poi;
 const finished=won||guesses.length>=2;
 return {...round,poiGuesses:guesses,won,finished,loss:finished&&!won?'poi':null,finishedAt:finished?now:null};
}
export function dailyMap(day,seed){return LOCATIONS[seed('gtp:v16:map:'+day)%LOCATIONS.length];}

/** In-game screenshots mirrored by community wiki. Remote-hosted, not bundled.
 * Rights/availability may change. UI gracefully falls back to a local landmark sketch.
 */
function externalCandidates(entry){
 const name=externalMapSources[entry.id];
 return name?[`https://apexlegends.wiki.gg/wiki/Special:Redirect/file/${encodeURIComponent(name)}`]:[];
}
export function sourceForLocation(entry){
 const name=externalMapSources[entry.id];
 if(name)return `https://apexlegends.wiki.gg/wiki/File:${encodeURIComponent(name.replace(/ /g,'_'))}`;
 return `https://apexlegends.wiki.gg/wiki/${encodeURIComponent(entry.map.replace(/’/g,"'" ).replace(/ /g,'_'))}`;
}
