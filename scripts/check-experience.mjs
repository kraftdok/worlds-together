import assert from 'node:assert/strict';
// One paid generation using only fictional data in the loopback development account.
const origin='http://localhost:5173';
async function call(path,body,method='POST'){const r=await fetch(origin+path,{method,headers:{origin,'Content-Type':'application/json',cookie:'__sites_local_auth=1'},body:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
const piece=await call('/api/world',{action:'add',title:'An early-morning photography walk',body:'I would like to meet people who enjoy quiet city photography and compare what we notice over breakfast afterward.',kind:'imagination'});
const opened=await call('/api/rooms',{kind:'city',invitation:'experience',title:'A morning together',brief:'Fictional hotel-salon invitation: propose a quiet photography walk and breakfast discussion. The room creator is the demo host. No availability, venue agreement, payment or booking is established.',withSample:true});
let room=opened.room;
async function change(body){room=await call('/api/rooms/'+room.id,{...body,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');return room;}
await change({action:'share',ids:[piece.id]});
const generated=await call('/api/ai',{action:'create',room:room.id,rev:room.rev,direction:'Propose one shared morning experience and explain what the host must confirm.'});room=generated.room;
assert.equal(room.state.invitation,'experience');assert(generated.creation.sources.includes(piece.id));
await change({action:'request',id:generated.creation.id,message:'Could we arrange a fictional rehearsal photography walk and breakfast discussion for two?'});let item=room.state.activityRequests.at(-1);assert.equal(item.status,'requested');
await change({action:'reply',id:item.id,reply:'For this fictional rehearsal, I can propose an 8am walk. This is not a confirmed booking.'});assert.equal(room.state.activityRequests.at(-1).status,'answered');
await change({action:'accept',id:item.id});assert.equal(room.state.activityRequests.at(-1).status,'accepted');
await change({action:'report',id:item.id,outcome:'Rehearsal only: we tested the flow, not an actual event.'});assert.equal(room.state.activityRequests.at(-1).status,'reported');
const form=new FormData();form.set('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAqkAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'test-pixel.png');
const upload=await fetch(origin+'/api/media',{method:'POST',headers:{origin,cookie:'__sites_local_auth=1'},body:form});assert.equal(upload.status,200);const media=await upload.json();
await change({action:'contribute',parent:generated.creation.id,title:'Test image response',body:'A tiny synthetic image to verify upload and source-linked contribution, not a real photograph.',media:media.id});assert.equal(room.state.creations.at(-1).mediaKind,'image');
const file=await fetch(origin+'/api/media/'+media.id+'?room='+room.id,{headers:{cookie:'__sites_local_auth=1'}});assert.equal(file.status,200);assert.equal(file.headers.get('content-type'),'image/png');
console.log(JSON.stringify({passed:true,checks:['editable invitation','live grounded proposal','request','host answer','acceptance','reported return','image upload','credited contribution'],room:room.id}));
