// Only run against the loopback production-preview Worker, never the public site.
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:8787';
const run=crypto.randomUUID().slice(0,8),a='qa-a-'+run,b='qa-b-'+run;
async function call(user,path,body,method='POST',expected=200){const r=await fetch(origin+path,{method:body===undefined?'GET':method,headers:{...(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'}:{}),origin,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;}
await call(null,'/api/rooms/nope',undefined,'GET',401);
const p=await call(a,'/api/world',{action:'add',title:'The sound of a station',body:'I collect recordings of footsteps and announcements in railway stations. I want to use these sounds to tell a story from two perspectives.',kind:'memory'});
const privateB=await call(b,'/api/world');assert.equal(privateB.pieces.length,0);
const {room,invite}=await call(a,'/api/rooms',{kind:'story',withSample:true});
await call(b,'/api/rooms/'+room.id,undefined,'GET',404);
await call(b,'/api/rooms/'+room.id+'/join',{invite:'wrong'},'POST',403);
const pending=await call(b,'/api/rooms/'+room.id+'/join',{invite});assert.equal(pending.pending,true);
await call(b,'/api/rooms/'+room.id,undefined,'GET',404);
await call(b,'/api/rooms/'+room.id,{action:'approve',user:b},'PATCH',404);
await call(a,'/api/rooms/'+room.id,{action:'approve',user:b},'PATCH');
let state=await call(b,'/api/rooms/'+room.id);assert.equal(state.members.length,2);assert(!state.state.pieces.some(x=>x.id===p.id));
await call(b,'/api/rooms/'+room.id,{action:'share',ids:[p.id],rev:0,operationId:crypto.randomUUID()},'PATCH',403);
const op=crypto.randomUUID();state=await call(a,'/api/rooms/'+room.id,{action:'share',ids:[p.id],rev:0,operationId:op},'PATCH');assert(state.state.pieces.some(x=>x.id===p.id));
const repeat=await call(a,'/api/rooms/'+room.id,{action:'share',ids:[p.id],rev:0,operationId:op},'PATCH');assert.equal(repeat.rev,1);
await call(b,'/api/rooms/'+room.id,{action:'share',ids:[p.id],rev:0,operationId:crypto.randomUUID()},'PATCH',403);
await call(a,'/api/rooms/'+room.id,{action:'invite',rev:0,operationId:crypto.randomUUID()},'PATCH',409);
if(process.argv.includes('--live')){
 const selected=await call(a,'/api/ai',{action:'select',room:room.id});assert(selected.selections.some(x=>x.id===p.id));
 const generated=await call(a,'/api/ai',{action:'create',room:room.id,rev:state.rev,direction:'Let the sound recording reveal the difference between Ada and Elin’s memories.'});state=generated.room;assert(generated.creation.sources.includes(p.id));assert.equal(generated.creation.mode,'live');
 state=await call(b,'/api/rooms/'+room.id,{action:'revise',id:generated.creation.id,body:generated.creation.body+'\nA second participant adds: a train arrives, but nobody steps out.',rev:state.rev,operationId:crypto.randomUUID()},'PATCH');assert.equal(state.state.creations.length,2);
 console.log('PASS: live Astra private selection, grounded creation, second participant branch');
}
state=await call(a,'/api/rooms/'+room.id,{action:'withdraw',id:p.id,rev:state.rev,operationId:crypto.randomUUID()},'PATCH');assert(!state.state.pieces.some(x=>x.id===p.id));assert.equal(state.state.creations.length,0);
const own=await call(a,'/api/world');assert(own.pieces.some(x=>x.id===p.id));
await call(a,'/api/rooms/'+room.id,{action:'revoke',user:b},'PATCH');
await call(b,'/api/rooms/'+room.id,undefined,'GET',404);
const forwarded=await call(b,'/api/rooms/'+room.id+'/join',{invite});assert.equal(forwarded.pending,true);
await call(b,'/api/rooms/'+room.id,undefined,'GET',404);
console.log('PASS: auth, private isolation, invitation, two members, ownership, idempotency, stale revision, withdrawal');
console.log('PASS: forwarded link requires approval; revoked account cannot read or rejoin automatically');
