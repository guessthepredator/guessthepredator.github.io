/** Pixel challenge composite: a centered Legend on one consistent neutral
 * studio stage. No second/background character image or busy geometry.
 * Remote image drawing is allowed without reading cross-origin pixels.
 */
export const PIXEL_SIZES=Object.freeze([9,12,17,29,48,100,900]);
export function scenePalette(seed='legend'){
 const hash=Array.from(String(seed)).reduce((a,c)=>(Math.imul(a^c.charCodeAt(0),16777619))>>>0,2166136261);
 return {hue:[197,260,320,177,28,227][hash%6],variation:hash%5};
}
export function paintPixelScene(canvas,portrait,{resolution=24,seed='legend'}={}){
 const ctx=canvas?.getContext?.('2d');
 if(!ctx||!portrait?.naturalWidth||!portrait?.naturalHeight)return false;
 const w=Math.max(9,Math.min(900,Math.round(resolution))),h=Math.round(w*.72);
 canvas.width=w;canvas.height=h;
 const S=x=>x*w,T=y=>y*h;
 const bg=ctx.createLinearGradient(0,0,0,h);
 bg.addColorStop(0,'#0c1530');bg.addColorStop(.54,'#293053');bg.addColorStop(1,'#101c32');
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 const glow=ctx.createRadialGradient(S(.5),T(.44),0,S(.5),T(.44),S(.53));
 glow.addColorStop(0,'rgba(118,193,230,.28)');
 glow.addColorStop(.6,'rgba(122,94,189,.10)');
 glow.addColorStop(1,'rgba(10,22,42,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='rgba(8,15,32,.78)';ctx.fillRect(0,T(.90),w,T(.10));
 ctx.strokeStyle='rgba(155,232,233,.24)';ctx.lineWidth=Math.max(.7,w/750);
 ctx.beginPath();ctx.moveTo(S(.06),T(.9));ctx.lineTo(S(.94),T(.9));ctx.stroke();
 const pw=portrait.naturalWidth,ph=portrait.naturalHeight;
 const scale=Math.min(S(.69)/pw,T(.86)/ph);
 const dw=pw*scale,dh=ph*scale,dx=S(.5)-dw/2,dy=T(.91)-dh;
 ctx.save();
 ctx.shadowColor='rgba(5,8,25,.65)';ctx.shadowBlur=Math.max(.5,w*.018);
 ctx.shadowOffsetY=Math.max(1,w*.006);
 try{ctx.drawImage(portrait,dx,dy,dw,dh);}catch{return false;}finally{ctx.restore();}
 return true;
}
