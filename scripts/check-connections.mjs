import assert from 'node:assert/strict';
const origin='http://localhost:5173',roomId=process.argv[2];
if(!roomId)throw new Error('Provide an existing local rehearsal room. Uses at most two paid AI calls.');
async function call(path,body,method=body?'POST':'GET',expected=200){const r=await fetch(origin+path,{method,headers:{origin,cookie:'__sites_local_auth=1','content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;}
let room=await call('/api/rooms/'+roomId);const world=await call('/api/world');
const ids=world.pieces.slice(0,8).map(p=>p.id);assert(ids.length);
await call('/api/ai',{action:'connections',room:roomId,ids:['not-owned']},'POST',400);
const before=JSON.stringify(room.state);
const {connections}=await call('/api/ai',{action:'connections',room:roomId,ids});
room=await call('/api/rooms/'+roomId);assert.equal(JSON.stringify(room.state),before,'Private search must not share context or change the room');
assert(connections.length<=3);
for(const c of connections){assert(c.yourPieces.length&&c.theirPieces.length);assert(c.yourPieces.every(id=>ids.includes(id)));assert(c.theirPieces.every(id=>room.state.pieces.some(p=>p.id===id&&(p.owner===c.person||p.author===c.person))));}
if(connections.length){const c=connections[0];room=await call('/api/rooms/'+roomId,{action:'share',ids:c.yourPieces,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');const count=room.state.creations.length;room=(await call('/api/ai',{action:'agent-propose',room:roomId,rev:room.rev,ids:[...new Set([...c.yourPieces,...c.theirPieces])],task:(c.project+'\n'+c.firstStep).slice(0,1800)})).room;const p=room.state.agentProposals.at(-1);assert.equal(p.status,'proposed');assert.equal(room.state.creations.length,count);room=await call('/api/rooms/'+roomId,{action:'agent-accept',id:p.id,rev:room.rev,operationId:crypto.randomUUID()},'PATCH');assert(room.state.creations.some(x=>x.id===p.draft.id&&x.agent?.principal===world.user.userId));}
console.log(JSON.stringify({passed:true,matches:connections.length,agentFlowVerified:connections.length>0,checks:['unowned search inputs rejected','search does not mutate or share','matches use permitted source IDs',...(connections.length?['explicit sharing','agent draft awaits approval','approved draft persists with agent credit']:[])]}));
