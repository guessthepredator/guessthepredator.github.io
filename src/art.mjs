// Stable, single-source look for 22 early Legends: same masked vertical
// medium renders used in the public Raddy fan project. Both Loba and Gibraltar
// have real existing portrait files here (the 2.24 fallback omitted them).
// Remaining 6 Legends use *real listed* full-body skin file names on wiki.gg,
// never the often-missing assumed "Original Name.png" path.
export const stableFanPortraits=Object.freeze({
  "wraith":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0000_Wraith.png",
  "wattson":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0001_Wattson.png",
  "vantage":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0002_Vantage.png",
  "valkyrie":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0003_Valkyrie.png",
  "seer":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0004_Seer.png",
  "revenant":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0005_Revenant.png",
  "rampart":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0006_Rampart.png",
  "pathfinder":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0007_Pathfinder.png",
  "octane":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0008_Octane.png",
  "newcastle":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0009_Newcastle.png",
  "mirage":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0010_Mirage.png",
  "mad-maggie":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0011_Maggie.png",
  "loba":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0012_Loba.png",
  "lifeline":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0013_Lifeline.png",
  "horizon":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0014_Horizon.png",
  "gibraltar":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0015_Gibraltar.png",
  "fuse":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0016_Fuse.png",
  "crypto":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0017_Crypto.png",
  "caustic":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0018_Caustic.png",
  "bloodhound":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0019_Bloodhound.png",
  "bangalore":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0020_Bangalore.png",
  "ash":"https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0021_Ash.png"
});
export const verifiedSkinPortraits=Object.freeze({
  "alter":"Crimson Dynasty Alter.png",
  "axle":"Cyber Racer Axle.png",
  "ballistic":"Earl Grey Ballistic.png",
  "catalyst":"Crimson Goddess Catalyst.png",
  "conduit":"Clearwater Conduit.png",
  "sparrow":"Char Sparrow.png"
});
export const portraitOriginalNames=Object.freeze({
  "alter":"Alter",
  "ash":"Ash",
  "axle":"Axle",
  "ballistic":"Ballistic",
  "bangalore":"Bangalore",
  "bloodhound":"Bloodhound",
  "catalyst":"Catalyst",
  "caustic":"Caustic",
  "conduit":"Conduit",
  "crypto":"Crypto",
  "fuse":"Fuse",
  "gibraltar":"Gibraltar",
  "horizon":"Horizon",
  "lifeline":"Lifeline",
  "loba":"Loba",
  "mad-maggie":"Mad Maggie",
  "mirage":"Mirage",
  "newcastle":"Newcastle",
  "octane":"Octane",
  "pathfinder":"Pathfinder",
  "rampart":"Rampart",
  "revenant":"Revenant",
  "seer":"Seer",
  "sparrow":"Sparrow",
  "valkyrie":"Valkyrie",
  "vantage":"Vantage",
  "wattson":"Wattson",
  "wraith":"Wraith"
});
export function portraitSourcesFor(slug,{pixel=false}={}){
 const direct=stableFanPortraits[slug];
 const skin=verifiedSkinPortraits[slug];
 const name=portraitOriginalNames[slug];
 const knownSkin=skin?[
  'https://apexlegends.wiki.gg/wiki/Special:Redirect/file/'+encodeURIComponent(skin),
  'https://apexlegends.fandom.com/wiki/Special:FilePath/'+encodeURIComponent(skin)
 ]:[];
 const defaultName=slug==='axle'?'Axle Pose Stand Tall.png':'Original '+name+'.png';
 const originals=name?[
  'https://apexlegends.wiki.gg/wiki/Special:Redirect/file/'+encodeURIComponent(defaultName),
  'https://apexlegends.fandom.com/wiki/Special:FilePath/'+encodeURIComponent(defaultName)
 ]:[];
 const previous=artCatalog[slug]||[];
 const alternate=pixel?previous.filter(url=>!url.includes('dexerto.com')&&!url.includes('portrait.jpg')):previous;
 return [...new Set([...(direct?[direct]:[]),...knownSkin,...originals,...alternate])];
}

// Public artwork source catalog. Host permission and availability may change.
export const artCatalog = {
  "alter": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Alter.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Alter.png",
    "https://www.apexfoundry.gg/images/legend-portraits/alter.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Falter.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Alter%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Alter%20square.png"
  ],
  "ash": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0021_Ash.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Ash%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Ash%20square.png"
  ],
  "axle": [
    "https://media.dexerto.com/media/apex-axle-portrait.jpg?format=auto&quality=75&width=768",
    "https://media.dexerto.com/media/apex-axle-portrait.jpg",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Axle%20Pose%20Stand%20Tall.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Axle%20Pose%20Stand%20Tall.png"
  ],
  "ballistic": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Ballistic.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Ballistic.png",
    "https://www.apexfoundry.gg/images/legend-portraits/ballistic.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fballistic.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Ballistic%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Ballistic%20square.png"
  ],
  "bangalore": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0020_Bangalore.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Bangalore%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Bangalore%20square.png"
  ],
  "bloodhound": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0019_Bloodhound.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Bloodhound%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Bloodhound%20square.png"
  ],
  "catalyst": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Catalyst.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Catalyst.png",
    "https://www.apexfoundry.gg/images/legend-portraits/catalyst.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fcatalyst.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Catalyst%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Catalyst%20square.png"
  ],
  "caustic": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0018_Caustic.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Caustic%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Caustic%20square.png"
  ],
  "conduit": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Conduit.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Conduit.png",
    "https://www.apexfoundry.gg/images/legend-portraits/conduit.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fconduit.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Conduit%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Conduit%20square.png"
  ],
  "crypto": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0017_Crypto.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Crypto%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Crypto%20square.png"
  ],
  "fuse": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0016_Fuse.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Fuse%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Fuse%20square.png"
  ],
  "gibraltar": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Gibraltar.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Gibraltar.png",
    "https://www.apexfoundry.gg/images/legend-portraits/gibraltar.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fgibraltar.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Gibraltar%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Gibraltar%20square.png"
  ],
  "horizon": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0014_Horizon.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Horizon%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Horizon%20square.png"
  ],
  "lifeline": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0013_Lifeline.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Lifeline%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Lifeline%20square.png"
  ],
  "loba": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Loba.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Loba.png",
    "https://www.apexfoundry.gg/images/legend-portraits/loba.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Floba.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Loba%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Loba%20square.png"
  ],
  "mad-maggie": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0011_Maggie.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Mad%20Maggie%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Mad%20Maggie%20square.png"
  ],
  "mirage": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0010_Mirage.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Mirage%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Mirage%20square.png"
  ],
  "newcastle": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0009_Newcastle.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Newcastle%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Newcastle%20square.png"
  ],
  "octane": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0008_Octane.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Octane%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Octane%20square.png"
  ],
  "pathfinder": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0007_Pathfinder.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Pathfinder%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Pathfinder%20square.png"
  ],
  "rampart": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Rampart.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Rampart.png",
    "https://www.apexfoundry.gg/images/legend-portraits/rampart.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Frampart.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Rampart%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Rampart%20square.png"
  ],
  "revenant": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Revenant.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Revenant.png",
    "https://www.apexfoundry.gg/images/legend-portraits/revenant.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Frevenant.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Revenant%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Revenant%20square.png"
  ],
  "seer": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0004_Seer.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Seer%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Seer%20square.png"
  ],
  "sparrow": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Sparrow.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Sparrow.png",
    "https://www.apexfoundry.gg/images/legend-portraits/sparrow.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fsparrow.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Sparrow%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Sparrow%20square.png"
  ],
  "valkyrie": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_large_0003_Valkyrie.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Valkyrie%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Valkyrie%20square.png"
  ],
  "vantage": [
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Original%20Vantage.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Original%20Vantage.png",
    "https://www.apexfoundry.gg/images/legend-portraits/vantage.webp",
    "https://www.apexfoundry.gg/_next/image?q=75&url=%2Fimages%2Flegend-portraits%2Fvantage.webp&w=3840",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Vantage%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Vantage%20square.png"
  ],
  "wattson": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0001_Wattson.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Wattson%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Wattson%20square.png"
  ],
  "wraith": [
    "https://raddythebrand.github.io/apex-legends/img/legends/apex_medium_0000_Wraith.png",
    "https://apexlegends.wiki.gg/wiki/Special:Redirect/file/Portrait%20Wraith%20square.png",
    "https://apexlegends.fandom.com/wiki/Special:FilePath/Portrait%20Wraith%20square.png"
  ]
};
