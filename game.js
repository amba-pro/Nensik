import {makeState,start,action,step,LANE_WIDTH} from './core.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const s=makeState();let W=1200,H=800,focal=700,camHeight=5,horizon=230,dpr=1,ready=false,clock=0,prev=0,toastUntil=0,muted=true,audio=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let best=0;try{best=Math.max(0,Number(localStorage.getItem('nensik-city-best'))||0);}catch{}
$('best').textContent=`${best} м`;
const atlas=new Image(),duckImage=new Image();
function loadImage(img,src){return new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});}
Promise.all([loadImage(atlas,'assets/cat-run.png'),loadImage(duckImage,'assets/cat-duck.png')]).then(()=>{ready=true;$('start').disabled=false;$('start').innerHTML='Побежали! <span>↗</span>';}).catch(()=>{$('asset-error').hidden=false;$('start').textContent='Кошка не загрузилась';});
function resize(){const r=canvas.getBoundingClientRect();H=800;W=H*r.width/r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);focal=Math.min(720,W*1.05);horizon=H*.28;camHeight=(H*.81-horizon)*9/focal;}
new ResizeObserver(resize).observe(canvas);resize();
function project(x,y,z){const scale=focal/Math.max(1,z+9);return {x:W*.5+x*scale,y:horizon+(camHeight-y)*scale,k:scale};}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}
function plane(x1,x2,y1,y2,z,color){poly([project(x1,y1,z),project(x2,y1,z),project(x2,y2,z),project(x1,y2,z)],color);}
function ground(x1,x2,z1,z2,color,y=0){poly([project(x1,y,z1),project(x2,y,z1),project(x2,y,z2),project(x1,y,z2)],color);}
function cube(x,y,z,w,h,d,front,side,top){const l=x-w/2,r=x+w/2;poly([project(l,y+h,z),project(r,y+h,z),project(r,y+h,z+d),project(l,y+h,z+d)],top);poly([project(x<0?r:l,y,z),project(x<0?r:l,y,z+d),project(x<0?r:l,y+h,z+d),project(x<0?r:l,y+h,z)],side);plane(l,r,y,y+h,z,front);}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fill();}
function rr(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));ctx.fill();}
function label(text,x,y,z,size,color){const p=project(x,y,z);ctx.fillStyle=color;ctx.font=`900 ${Math.max(1,size*p.k)}px "Trebuchet MS",sans-serif`;ctx.textAlign='center';ctx.fillText(text,p.x,p.y);}
const palettes=[['#f6b899','#d57f72','#ffdac1'],['#83cfc2','#4ba5a2','#c0eadd'],['#f5d087','#d9a765','#ffe7b5'],['#9ebcdc','#6a99c0','#d0e1f3'],['#e9a9be','#bb769a','#f8d0d8']];
const hash=n=>{const v=Math.sin(n*127.1+41.7)*43758.5453;return v-Math.floor(v);};
function sky(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#71d3ee');g.addColorStop(.48,'#dbf5e9');g.addColorStop(1,'#f4e6bf');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ellipse(W*.77,125,49,49,'#fff1bc');ellipse(W*.77,125,67,67,'#fff5d32c');
for(let i=0;i<7;i++){const x=(i*W/5+Math.sin(i)*120+W*2)% (W+240)-120,y=95+(i%3)*43;ellipse(x,y,63,14,'#ffffffb3');ellipse(x-18,y-12,28,19,'#ffffffa6');ellipse(x+21,y-8,32,17,'#ffffffb3');}
for(let i=0;i<32;i++){const bw=W/28,x=i*bw,h=20+hash(i)*65;rr(x,horizon-h,bw+2,h+20,5,i%3===0?'#8cc9d6':'#a2d9de');}}
function road(dist){ground(-65,65,-6,240,'#b6cc9a');ground(-4.9,4.9,-6,240,'#f7d7b3');ground(-3.58,3.58,-6,240,'#b3bcc1');
for(let lane=-1;lane<=1;lane++){const x=lane*LANE_WIDTH;ground(x-.9,x+.9,-6,240,'#bfc5c2');for(let side of [-1,1]){ground(x+side*.57-.045,x+side*.57+.045,-6,240,'#7b8996');ground(x+side*.57-.012,x+side*.57+.017,-6,240,'#eaf1e7');}}
for(let z=150-(dist%2);z> -6;z-=2){for(let lane=-1;lane<=1;lane++){const x=lane*LANE_WIDTH;ground(x-.75,x+.75,z,z+.19,'#95a3aa');}for(let side of [-1,1]){ground(side*3.62,side*4.85,z,z+.035,'#d9b694');}}
for(let side of [-1,1]){ground(side*3.5,side*3.67,-6,240,'#fff4d6',.07);ground(side*4.85,side*4.97,-6,240,'#e9f2c8',.12);}
}
function building(side,z,id){const colors=palettes[id%palettes.length],height=6+hash(id)*5,x=side*(6.8+hash(id+9)*.5),width=3.8;cube(x,0,z,width,height,8,...colors);cube(x,height,z-.06,width+.18,.18,8.1,'#fff0da',colors[1],'#fffbe8');
for(let y=2.1;y<height-1;y+=1.55){for(let col=-1;col<=1;col++){const wx=x+col*.98;plane(wx-.31,wx+.31,y,y+.9,z-.03,'#f6f6de');plane(wx-.23,wx+.23,y+.09,y+.8,z-.06,'#56889c');plane(wx-.2,wx+.17,y+.5,y+.72,z-.08,'#8fc8d6');cube(wx,y-.05,z-.2,.79,.12,.25,'#f6e8d5','#cab6a6','#fff6e6');}}
plane(x-.95,x+.95,.1,1.72,z-.08,'#416d80');plane(x-.7,x+.7,.17,1.55,z-.1,'#99d3d1');for(let j=0;j<6;j++)plane(x-1.18+j*.4,x-.78+j*.4,1.55,1.96,z-.22,j%2?'#fff0d2':'#ed8d6e');label(id%2?'CAFÉ':'CITY',x,2.22,z-.11,.4,'#47727b');}
function tree(x,z){cube(x,0,z,.18,2.3,.18,'#a38c6b','#87775e','#bba480');const p=project(x,2.7,z),r=p.k;ellipse(p.x,p.y,r*.72,r*1.1,'#5fae84');ellipse(p.x-r*.22,p.y-r*.31,r*.57,r*.83,'#85c696');ellipse(p.x+r*.22,p.y+r*.18,r*.42,r*.65,'#46997e');}
function lamp(x,z){cube(x,0,z,.065,4.6,.065,'#75979d','#62858c','#b2d1c7');cube(x,4.5,z,.55,.09,.13,'#839fa2','#62858c','#b2d1c7');const p=project(x,4.45,z);ellipse(p.x,p.y,p.k*.21,p.k*.07,'#fffbd8');}
function wall(x,z,side,id){cube(x,0,z,.23,1.6,9,'#caa1cc','#9a81bd','#ecd6de');const p=project(x-side*.16,1.13,z+.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-side*.09);ctx.font=`900 ${p.k*.65}px "Trebuchet MS"`;ctx.textAlign='center';ctx.strokeStyle='#fff7db';ctx.lineWidth=p.k*.055;ctx.strokeText(id%2?'MEOW!':'RUN',0,0);ctx.fillStyle=id%2?'#edcf64':'#77dfcd';ctx.fillText(id%2?'MEOW!':'RUN',0,0);ctx.restore();}
function obstacle(o){const x=o.lane*LANE_WIDTH,z=o.z;
if(o.kind==='train'){const colors=[['#56b7c8','#348eaa','#98dfe2'],['#edaa76','#cc8062','#ffcf9b'],['#b499d2','#8976ae','#d5bce9']][o.color||0];cube(x,.17,z,1.83,3.5,7,...colors);const p=project(x,0,z);rr(p.x-p.k*.77,p.y-p.k*3.38,p.k*1.54,p.k*1.01,p.k*.2,'#244e69');rr(p.x-p.k*.65,p.y-p.k*3.25,p.k*1.3,p.k*.19,p.k*.06,'#8accdc');plane(x-.84,x+.84,1.44,1.73,z-.01,'#fff2cc');plane(x-.62,x+.62,.32,.58,z-.025,'#507786');for(let side of [-1,1]){const h=project(x+side*.56,1.13,z-.02);ellipse(h.x,h.y,p.k*.13,p.k*.13,'#fff5c1');}label('N • 01',x,2.0,z-.02,.25,'#fff9d9');}
else if(o.kind==='barrier'){for(let side of [-1,1])cube(x+side*.74,0,z,.15,1.13,.22,'#e17b57','#be614b','#f7ac77');cube(x,.45,z-.07,1.8,.62,.22,'#fff2cc','#d1ad84','#fff8de');for(let i=0;i<5;i++){const a=x-.88+i*.36;poly([project(a,.47,z-.09),project(a+.18,.47,z-.09),project(a+.4,1.05,z-.09),project(a+.22,1.05,z-.09)],'#ef8861');}label('↑',x,1.4,z,.44,'#fffef0');}
else if(o.kind==='arch'){for(let side of [-1,1])cube(x+side*.86,0,z,.13,2.85,.2,'#548f98','#3e707e','#7db2ac');cube(x,1.67,z,1.9,1.2,.24,'#76c6bd','#438e92','#a9e0cd');plane(x-.8,x+.8,1.72,1.88,z-.02,'#f4d177');label('↓',x,2.32,z-.03,.5,'#fff4d9');label('НИЖЕ',x,2.67,z-.03,.27,'#e9fff1');}
}
function coin(o){const p=project(o.lane*LANE_WIDTH,o.y+Math.sin(clock*4+o.z)*.06,o.z),r=p.k*.27;const rx=r*(.68+Math.sin(clock*4+o.z*.2)*.18);ellipse(p.x+2,p.y+2,rx,r,'#cb932c');ellipse(p.x,p.y,rx,r,'#ffd665');ellipse(p.x,p.y,rx*.72,r*.75,'#ffbf43');ctx.strokeStyle='#ffe69c';ctx.lineWidth=Math.max(.5,p.k*.025);ctx.beginPath();ctx.ellipse(p.x,p.y,rx*.76,r*.8,0,0,Math.PI*2);ctx.stroke();ellipse(p.x,p.y+r*.18,r*.19,r*.19,'#ffeaba');for(let j=-1;j<=1;j++)ellipse(p.x+j*r*.2,p.y-r*.2-Math.abs(j)*r*.04,r*.09,r*.11,'#ffeaba');}
function cat(){if(!ready)return;const p=project(s.x,0,0),air=s.y>0;ellipse(p.x,p.y+3,p.k*(.65-s.y*.08),p.k*.15,`rgba(45,69,80,${.22-s.y*.04})`);const phase=s.mode==='play'?Math.floor(s.distance*1.65)%8:0;const frame=air?3:phase;const cellW=atlas.width/4,cellH=atlas.height/2;
const size=p.k*2.72,y=p.y-s.y*p.k;ctx.save();ctx.translate(p.x,y);ctx.rotate((s.lane*LANE_WIDTH-s.x)*-.025);
// Entire photographic frames are scaled uniformly; no clipped body-part collage.
if(s.duck>0)ctx.drawImage(duckImage,-size*.5,-size*.9,size,size);
else ctx.drawImage(atlas,(frame%4)*cellW,Math.floor(frame/4)*cellH,cellW,cellH,-size*.5,-size*.94,size,size);ctx.restore();}
function draw(){ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);sky();const dist=s.mode==='menu'?18:s.distance;road(dist);
const queue=[];
for(let i=0;i<14;i++){const z=i*12-(dist%12)-5,id=i+Math.floor(dist/12);for(let side of [-1,1]){queue.push({z,draw:()=>building(side,z,id+(side>0?7:0))});if(i%2===0)queue.push({z:z+4,draw:()=>tree(side*4.43,z+4)});if(i%3===0)queue.push({z:z+7,draw:()=>lamp(side*3.94,z+7)});if(i%4===1)queue.push({z:z+1,draw:()=>wall(side*5.03,z+1,side,id)});}}
const objects=s.mode==='menu'?[{kind:'train',lane:-1,z:23,color:0},{kind:'train',lane:1,z:50,color:1},{kind:'barrier',lane:0,z:40},...Array.from({length:7},(_,i)=>({kind:'coin',lane:0,z:8+i*3,y:.75}))]:s.objects;
for(const o of objects)if(o.z> -7.5)queue.push({z:o.z,draw:()=>o.kind==='coin'?coin(o):obstacle(o)});
queue.push({z:0,draw:cat});queue.sort((a,b)=>b.z-a.z);for(const item of queue)item.draw();
// Thin distance haze blends the vanishing point without obscuring obstacles.
const mist=ctx.createLinearGradient(0,horizon-30,0,horizon+48);mist.addColorStop(0,'#d8f4e600');mist.addColorStop(.38,'#d8f4e6aa');mist.addColorStop(1,'#d8f4e600');ctx.fillStyle=mist;ctx.fillRect(0,horizon-30,W,78);
}
function beep(freq,length=.09){if(muted)return;try{audio ||= new AudioContext();if(audio.state==='suspended')void audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,audio.currentTime+length);g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+length);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+length);}catch{}}
function toast(text){$('toast').textContent=text;$('toast').style.opacity='1';toastUntil=clock+3;}
function syncHUD(){$('distance').textContent=Math.floor(s.distance);$('coins').textContent=s.coins;}
function begin(){if(!ready)return;start(s);$('menu').hidden=true;$('game-over').hidden=true;$('pause-menu').hidden=true;$('pause').disabled=false;document.body.classList.add('playing');syncHUD();toast(W<800?'Свайпы или кнопки — управляй лапками':'← → полоса · ↑ прыжок · ↓ пригнуться');canvas.focus();}
function finish(){const distance=Math.floor(s.distance),record=distance>best;if(record){best=distance;try{localStorage.setItem('nensik-city-best',String(best));}catch{}}$('best').textContent=`${best} м`;$('final-distance').textContent=distance;$('final-coins').textContent=s.coins;$('finish-tag').textContent=record?'НОВЫЙ ЛИЧНЫЙ РЕКОРД!':'ЕЩЁ ОДНО ПРИКЛЮЧЕНИЕ?';$('game-over').hidden=false;$('pause').disabled=true;document.body.classList.remove('playing');$('restart').focus();beep(160,.2);}
function pause(){if(s.mode==='play'){s.mode='paused';$('pause-menu').hidden=false;$('pause').setAttribute('aria-label','Продолжить');$('resume').focus();}else if(s.mode==='paused'){s.mode='play';$('pause-menu').hidden=true;$('pause').setAttribute('aria-label','Пауза');canvas.focus();}}
canvas.tabIndex=-1;
$('start').onclick=begin;$('restart').onclick=begin;$('pause').onclick=pause;$('resume').onclick=pause;
$('home').onclick=()=>{Object.assign(s,makeState());$('game-over').hidden=true;$('menu').hidden=false;$('pause').disabled=true;document.body.classList.remove('playing');syncHUD();$('start').focus();};
$('sound').onclick=()=>{muted=!muted;$('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'Включить звук':'Выключить звук');if(!muted)beep(660);};
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',ArrowDown:'duck',KeyS:'duck'};
window.addEventListener('keydown',e=>{if(e.code==='Tab')return;const onButton=e.target instanceof HTMLButtonElement;if((e.code==='Space'||e.code==='Enter')&&onButton)return;if(keys[e.code]||['KeyP','Escape'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyP'||e.code==='Escape')pause();else if((e.code==='Space'||e.code==='Enter')&&(s.mode==='menu'||s.mode==='over'))begin();else if(keys[e.code])action(s,keys[e.code]);});
for(const button of document.querySelectorAll('[data-action]'))button.addEventListener('pointerdown',e=>{e.preventDefault();action(s,button.dataset.action);});
let pointer=null;canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)action(s,'jump');else action(s,Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'duck':'jump'));});canvas.addEventListener('pointercancel',()=>pointer=null);
window.addEventListener('blur',()=>{if(s.mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.mode==='play')pause();});
function frame(now){let dt=Math.min((now-(prev||now))/1000,.1);prev=now;if(s.mode==='play'||(!reduced&&s.mode==='menu'))clock+=dt;if(s.mode==='play'){while(dt>0&&s.mode==='play'){const part=Math.min(dt,1/120);step(s,part);dt-=part;if(s.event==='coin')beep(920,.07);if(s.event==='jump')beep(460,.1);if(s.event==='hit')finish();s.event=null;}syncHUD();}if(clock>toastUntil)$('toast').style.opacity='0';draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
// Opt-in diagnostics for local browser smoke tests, absent in normal play.
if(new URLSearchParams(location.search).has('test'))window.__nensik={state:s,action:name=>action(s,name),start:begin,step:dt=>step(s,dt),draw,ready:()=>ready};
