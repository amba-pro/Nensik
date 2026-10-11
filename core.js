// Pure simulation: world distances are metres, time is seconds.
export const LANE_WIDTH=2.25;
export const MAX_SPEED=24;
export const COLLISION_HALF_DEPTH=.65;
export function makeState(random=Math.random){return {mode:'menu',distance:0,coins:0,lane:0,x:0,y:0,vy:0,duck:0,speed:12,elapsed:0,spawnIn:2.3,objects:[],random,rows:0,event:null};}
export function start(s){const random=s.random;Object.assign(s,makeState(random),{mode:'play'});for(let z=14;z<30;z+=3)s.objects.push({kind:'coin',lane:0,z,y:.75});}
export function action(s,name){if(s.mode!=='play')return;if(name==='left')s.lane=Math.max(-1,s.lane-1);if(name==='right')s.lane=Math.min(1,s.lane+1);if(name==='jump'&&s.y===0){s.vy=9;s.duck=0;s.event='jump';}if(name==='duck'&&s.y===0)s.duck=.8;}
export function spawnRow(s){
// Always leave a clear lane; consecutive rows give >1 second to react.
const safe=Math.floor(s.random()*3)-1,lanes=[-1,0,1].filter(l=>l!==safe);
const count=s.rows<3?1:(s.random()<.55?2:1);if(s.random()<.5)lanes.reverse();
for(const lane of lanes.slice(0,count)){const r=s.random(),kind=s.rows<2?'barrier':r<.42?'train':r<.74?'barrier':'arch';s.objects.push({kind,lane,z:85,color:Math.floor(s.random()*3)});}
for(let i=0;i<6;i++)s.objects.push({kind:'coin',lane:safe,z:83+i*2.2,y:.75});s.rows++;
}
export function step(s,dt){
if(s.mode!=='play')return;dt=Math.min(dt,.04);s.elapsed+=dt;s.speed=Math.min(MAX_SPEED,12+s.distance*.009);s.distance+=s.speed*dt;s.x+=(s.lane*LANE_WIDTH-s.x)*(1-Math.exp(-16*dt));
if(s.y>0||s.vy>0){s.vy-=24*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0)s.vy=0;}s.duck=Math.max(0,s.duck-dt);s.spawnIn-=dt;if(s.spawnIn<=0){spawnRow(s);s.spawnIn=1.85+s.random()*.55;}
for(const o of s.objects){const prev=o.z;o.z-=s.speed*dt;if(o.taken)continue;const aligned=Math.abs(o.lane*LANE_WIDTH-s.x)<(o.kind==='coin'?.72:.83);const tail=o.kind==='train'?7:COLLISION_HALF_DEPTH;const crossing=o.z<COLLISION_HALF_DEPTH&&o.z+tail>-COLLISION_HALF_DEPTH;const swept=prev>=0&&o.z<=0;if(!aligned||(!crossing&&!swept))continue;
if(o.kind==='coin'){if(Math.abs((s.y+.75)-o.y)<1){o.taken=true;s.coins++;s.event='coin';}}
else if(o.kind==='train'||(o.kind==='barrier'&&s.y<.92)||(o.kind==='arch'&&s.duck<=0)){s.mode='over';s.event='hit';return;}}
s.objects=s.objects.filter(o=>o.z> -10&&!o.taken);
}
