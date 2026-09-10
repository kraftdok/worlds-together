import assert from 'node:assert/strict';
const origin='http://localhost:5173',id=process.argv[2];
if(!id)throw Error('Pass a local rehearsal room ID. Creates and withdraws a test-only media contribution.');
async function call(path,body,method=body?'POST':'GET'){const r=await fetch(origin+path,{method,headers:{origin,cookie:'__sites_local_auth=1','content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
const world=await call('/api/world');const own=world.pieces.find(p=>p.media?.startsWith('media:')&&p.kind==='sound');assert(own,'Run arrangement rehearsal first.');
let room=await call('/api/rooms/'+id);const patch=async v=>room=await call('/api/rooms/'+id,{...v,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');
await patch({action:'contribute',sources:['source'],title:'Test-only media reuse and withdrawal',body:'Disposable local verification of credit and withdrawal.',media:own.media.slice(6)});
const response=room.state.creations.at(-1),piece=room.state.pieces.find(p=>p.id==='contribution-'+response.id);assert(piece);assert(response.sources.includes(piece.id));
await patch({action:'assemble',title:'Test-only derived arrangement',note:'Disposable local verification.',frames:[{image:'source',sound:piece.id,caption:'Test',seconds:3}]});const derived=room.state.creations.at(-1).id;
await patch({action:'withdraw',id:piece.id});assert(!room.state.creations.some(c=>[response.id,derived].includes(c.id)));assert(!room.state.pieces.some(p=>p.id===piece.id));
console.log(JSON.stringify({passed:true,checks:['uploaded response becomes reusable shared media','response has source credit','withdrawal removes response and derived arrangement'],removed:'two disposable local test versions; original private audio retained'}));
