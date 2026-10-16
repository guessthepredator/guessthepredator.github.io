// Kenney's CC0 human-spoken announcements. Not impersonations of Apex characters.
// The optional pack is installed locally via scripts/install_cc0_announcer.py.
let availability=null,nowPlaying=null;
const base='./assets/announcer/';
export async function announcerAvailable(){
  if(availability!==null)return availability;
  try{
    const resp=await fetch(base+'manifest.json',{cache:'no-store'});
    if(!resp.ok){availability=false;return false;}
    const data=await resp.json();
    availability=data.human_recorded===true&&data.license==='CC0 1.0'&&Array.isArray(data.clips)&&data.clips.length>0;
    return availability;
  }catch{availability=false;return false;}
}
export async function say(cue,enabled=true){
  if(!enabled||!await announcerAvailable())return false;
  const allowed=['ready','mission_completed','mission_failed','objective_achieved','correct','wrong','you_win','time_over'];
  if(!allowed.includes(cue))return false;
  try{
    nowPlaying?.pause();
    const audio=new Audio(base+cue+'.ogg');audio.volume=.54;nowPlaying=audio;
    await audio.play();return true;
  }catch{return false;}
}
export function stopAnnouncer(){try{nowPlaying?.pause()}catch{}nowPlaying=null;}
