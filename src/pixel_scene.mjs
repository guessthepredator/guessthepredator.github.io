/** Draws a FULL environment + portrait to one canvas. Progressive render resolution
 * degrades BOTH the architecture and the subject instead of a cut-out alone.
 * No getImageData/toDataURL; remote sources may be tainted and still render.
 */
export const PIXEL_SIZES=Object.freeze([11,14,20,33,54,110,900]);
export function scenePalette(seed='legend'){
  const hash=Array.from(String(seed)).reduce((a,c)=>(Math.imul(a^c.charCodeAt(0),16777619))>>>0,2166136261);
  const hues=[197,260,320,177,28,227];return {hue:hues[hash%hues.length],variation:hash%5};
}
export function paintPixelScene(canvas,portrait,{resolution=24,seed='legend'}={}){
  const ctx=canvas?.getContext?.('2d');if(!ctx||!portrait?.naturalWidth||!portrait?.naturalHeight)return false;
  const w=Math.max(20,Math.min(900,Math.round(resolution))),h=Math.round(w*.72);
  canvas.width=w;canvas.height=h;
  const hue=260,variation=0;
  const S=x=>x*w, T=y=>y*h;
  // Neutral, non-Apex arena: exactly the same for every target, no environmental clue leakage.
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,`hsl(${hue},43%,17%)`);bg.addColorStop(.60,`hsl(${(hue+32)%360},36%,35%)`);bg.addColorStop(1,`hsl(${hue},30%,57%)`);
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(253,222,249,.15)';ctx.beginPath();ctx.ellipse(S(.74),T(.26),S(.17),T(.25),0,0,Math.PI*2);ctx.fill();
  const blocks=[[.025,.24,.16,.58],[.16,.09,.16,.7],[.30,.26,.14,.55],[.55,.19,.15,.56],[.76,.07,.14,.67],[.88,.29,.12,.57]];
  blocks.forEach(([x,y,bh,d],i)=>{
   const grad=ctx.createLinearGradient(S(x),0,S(x+bh),0);grad.addColorStop(0,`hsla(${hue},39%,${17+i*2}%,.84)`);grad.addColorStop(1,`hsla(${hue},36%,${39+i}%,.55)`);
   ctx.fillStyle=grad;ctx.fillRect(S(x),T(y+(variation%2)*.015),S(bh),T(d));
   ctx.fillStyle=i%2?'#79f6eb89':'#ffb9de78';
   for(let k=0;k<5;k++)ctx.fillRect(S(x+.025),T(y+.09+k*.09),S(bh-.05),Math.max(.5,T(.008)));
  });
  ctx.fillStyle='rgba(23,15,46,.83)';ctx.fillRect(0,T(.79),w,T(.21));
  ctx.strokeStyle='rgba(251,212,247,.34)';ctx.lineWidth=Math.max(.65,w/580);
  for(let i=0;i<9;i++){const yy=T(.8+i*.026);ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);ctx.stroke();}
  for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(S(i/11),T(.80));ctx.lineTo(S(.5+(i/11-.5)*1.7),h);ctx.stroke();}
  const bloom=ctx.createRadialGradient(S(.55),T(.52),0,S(.55),T(.52),S(.39));bloom.addColorStop(0,'rgba(251,190,241,.49)');bloom.addColorStop(1,'rgba(251,190,241,0)');ctx.fillStyle=bloom;ctx.fillRect(0,0,w,h);
  const pw=portrait.naturalWidth,ph=portrait.naturalHeight;
  // Uniform contain scaling preserves the FULL POSE and avoids crop-induced unfairness.
  const maxW=S(.64),maxH=T(.91),scale=Math.min(maxW/pw,maxH/ph);
  const dw=pw*scale,dh=ph*scale,px=S(.52)-dw/2,py=T(.94)-dh;
  ctx.save();ctx.shadowColor='rgba(14,10,36,.65)';ctx.shadowBlur=Math.max(1,w*.024);ctx.shadowOffsetY=Math.max(1,w*.008);
  try{ctx.drawImage(portrait,px,py,dw,dh);}catch{return false;}finally{ctx.restore();}
  ctx.fillStyle='rgba(255,178,236,.3)';ctx.fillRect(0,T(.95),w,Math.max(1,T(.012)));
  return true;
}
