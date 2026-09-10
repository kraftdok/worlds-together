import assert from 'node:assert/strict';
const origin='http://localhost:5173',roomId=process.argv[2];
if(!roomId)throw new Error('Pass a local rehearsal room ID. This performs one paid bounded agent turn.');
async function call(path,body,method=body?'POST':'GET',expected=200){const r=await fetch(origin+path,{method,headers:{origin,cookie:'__sites_local_auth=1','content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;}
let room=await call('/api/rooms/'+roomId);const before=room.state.creations.length;
const ids=room.state.pieces.map(p=>p.id).slice(0,3);
await call('/api/ai',{action:'agent-propose',room:roomId,rev:room.rev,task:'Test',ids:['not-shared','source']},'POST',400);
room=(await call('/api/ai',{action:'agent-propose',room:roomId,rev:room.rev,ids,task:'Propose a concise 20-second original sound-and-image treatment with a quiet beginning. Explain the sources. Do not claim the media has been generated.'})).room;
const proposal=room.state.agentProposals.at(-1);assert.equal(proposal.status,'proposed');assert.equal(room.state.creations.length,before);assert(proposal.draft.sources.every(id=>ids.includes(id)));assert(new Set(proposal.draft.sources).size>=2);
room=await call('/api/rooms/'+roomId,{action:'agent-accept',id:proposal.id,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');
assert.equal(room.state.creations.length,before+1);assert.equal(room.state.agentProposals.at(-1).status,'accepted');assert.equal(room.state.creations.at(-1).agent.principal,proposal.principal);
await call('/api/rooms/'+roomId,{action:'agent-accept',id:proposal.id,rev:room.rev,operationId:crypto.randomUUID()},'PATCH',409);
console.log(JSON.stringify({passed:true,checks:['unshared source rejected','one live bounded agent proposal','proposal not auto-accepted','grounded distinct sources','explicit human approval','repeat decision rejected'],room:roomId}));
