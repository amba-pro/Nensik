import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
test('fresh local server serves every game asset and rejects non-game paths',async()=>{
 const child=spawn(process.execPath,['server.mjs','--port','0'],{cwd:fileURLToPath(new URL('..',import.meta.url)),stdio:['ignore','pipe','pipe']});
 try{
  let output='';const url=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Server startup timed out')),5000);child.once('error',e=>{clearTimeout(timeout);reject(e);});child.stdout.on('data',data=>{output+=data;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);resolve(match[0]);}});});
  for(const file of ['/','/style.css','/game.js','/core.js','/cat.png','/assets/cat-run.png','/assets/cat-duck.png']){const res=await fetch(url+file);assert.equal(res.status,200,file);const bytes=await res.arrayBuffer();assert.ok(bytes.byteLength>0,file);if(file.endsWith('.png'))assert.equal(res.headers.get('content-type'),'image/png');}
  assert.equal((await fetch(url+'/README.md')).status,404);
  assert.equal((await fetch(url+'/.git/config')).status,404);
  assert.equal((await fetch(url+'/missing.png')).status,404);
  assert.equal((await fetch(url+'/%E0%A4%A')).status,400);
  assert.equal((await fetch(url+'/',{method:'POST'})).status,405);
  const head=await fetch(url+'/',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
 }finally{child.kill();await once(child,'exit');}
});
