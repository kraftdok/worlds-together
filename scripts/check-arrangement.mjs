import assert from 'node:assert/strict';
const origin='http://localhost:5173',roomId=process.argv[2];
if(!roomId)throw Error('Pass a local rehearsal room. This creates synthetic test audio and makes one paid arrangement request.');
async function call(path,body,method=body?'POST':'GET'){const r=await fetch(origin+path,{method,headers:{origin,cookie:'__sites_local_auth=1','content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
// Original synthetic three-beat test signal, not a person's recording or musical performance.
const rate=16000,samples=rate*4,wav=Buffer.alloc(44+samples*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40);
for(let i=0;i<samples;i++){const t=i/rate,phase=t%1;const tone=t<3&&phase<.15?Math.sin(2*Math.PI*220*phase)*Math.exp(-phase*35)*.25:0;wav.writeInt16LE(Math.round(tone*32767),44+i*2);}
const form=new FormData();form.set('file',new Blob([wav],{type:'audio/wav'}),'synthetic-three-beat-rehearsal.wav');
const upload=await fetch(origin+'/api/media',{method:'POST',headers:{origin,cookie:'__sites_local_auth=1'},body:form});assert.equal(upload.status,200);const media=await upload.json();
const added=await call('/api/world',{action:'add',title:'Three beats — synthetic rehearsal audio',body:'Original programmatically synthesized test tones. Three short low tones one second apart, then silence. Not a human recording or an athlete contribution.',kind:'sound',media:media.id});
let room=await call('/api/rooms/'+roomId);
room=await call('/api/rooms/'+roomId,{action:'share',ids:[added.id],rev:room.rev,operationId:crypto.randomUUID()},'PATCH');
const count=room.state.creations.length;
room=(await call('/api/ai',{action:'agent-propose',arrange:true,room:roomId,rev:room.rev,ids:['source',added.id],task:'Arrange exactly two four-second moments: use the supplied original image and synthetic three-beat audio. A fan response about beginning, not athlete approval. Each caption should be under ten words. Credit both sources. The second moment is silent.'})).room;
const p=room.state.agentProposals.at(-1);assert.equal(room.state.creations.length,count);assert.equal(p.status,'proposed');assert(p.draft.frames.length>0);assert(p.draft.frames.some(f=>f.sound===added.id));assert(p.draft.sources.includes(added.id));
room=await call('/api/rooms/'+roomId,{action:'agent-accept',id:p.id,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');
assert.equal(room.state.creations.at(-1).agent.principal,p.principal);assert.deepEqual(room.state.creations.at(-1).frames,p.draft.frames);
console.log(JSON.stringify({passed:true,room:roomId,creation:p.draft.id,checks:['actual original test audio upload','explicit sharing','one live AI arrangement with supplied media IDs','proposal not auto-saved','human approval preserves arrangement and agent credit']}));
