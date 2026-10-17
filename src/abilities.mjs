import {installedAbilityFiles} from './ability_media_manifest.mjs?v=2.6.0';
/**
 * User-provided screenshot supplies eight locally cropped genuine passive ability icons.
 * Other entries use candidate filenames from the public Apex ability wiki. These remote
 * candidates are NOT guaranteed accessible; no abstract substitute icon is used.
 * Names are metadata only and must NOT be rendered as clue text before the guess.
 */
export const abilityNames = Object.freeze({
  alter:'Gift From The Rift',
  ash:'Marked for Death',
  axle:'Nitro Gate',
  ballistic:'Sling',
  bangalore:'Double Time',
  bloodhound:'Tracker',
  catalyst:'Barricade',
  caustic:'Nox Vision',
  conduit:"Savior's Speed",
  crypto:'Neurolink',
  fuse:'Grenadier',
  gibraltar:'Gun Shield',
  horizon:'Spacewalk',
  lifeline:'Combat Glide',
  loba:'Eye for Quality',
  'mad-maggie':"Warlord's Ire",
  mirage:'Now You See Me',
  newcastle:'Retrieve the Wounded',
  octane:'Swift Mend',
  pathfinder:'Insider Knowledge',
  rampart:'Modded Loader',
  revenant:"Assassin's Instinct",
  seer:'Heart Seeker',
  sparrow:'Double Jump',
  valkyrie:'VTOL Jets',
  vantage:"Spotter's Lens",
  wattson:'Spark of Genius',
  wraith:'Voices from the Void',
});
const bundled = ['revenant','catalyst','lifeline','bangalore','loba','alter','fuse','gibraltar'];
const imported = Object.entries(installedAbilityFiles)
  .filter(([slug,filename])=>abilityNames[slug] && typeof filename==='string' && /^[a-z0-9-]+\.(?:png|webp|jpg|jpeg)$/i.test(filename))
  .map(([slug])=>slug);
export const localAbilitySlugs = Object.freeze([...new Set([...bundled,...imported])]);
const local=new Set(localAbilitySlugs);
/** Only bundled or explicitly imported local files are offered as mystery icons. */
export function abilityCandidates(slug){
 if(!local.has(slug))return [];
 const importedFile=installedAbilityFiles[slug];
 return [...(importedFile?[`./assets/ability-icons/${importedFile}`]:[]),
   `./assets/ability-icons/${slug}.png`,
   `./assets/ability-icons/${slug}.webp`,
   `./assets/ability-icons/${slug}.jpg`,
   `./assets/ability-icons/${slug}.jpeg`];
}
