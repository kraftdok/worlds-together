import assert from 'node:assert/strict';
const origin='http://127.0.0.1:8787',room=process.argv[2],owner='local_seedy',other='agent-review-'+crypto.randomUUID().slice(0,8);
if(!room)throw new Error('Pass a local rehearsal room containing an agent proposal.');
async function call(user,path,body,method=body?'POST':'GET',expected=200){const r=await fetch(origin+path,{method,headers:{origin,'content-type':'application/json','oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'},body:body?JSON.stringify(body):undefined});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;}
let state=await call(owner,'/api/rooms/'+room);const proposal=state.state.agentProposals?.at(-1);assert(proposal);
const invitation=await call(owner,'/api/rooms/'+room,{action:'invite',rev:state.rev,operationId:crypto.randomUUID()},'PATCH');
await call(other,'/api/rooms/'+room+'/join',{invite:invitation.invite});
state=await call(owner,'/api/rooms/'+room,{action:'approve',user:other},'PATCH');
await call(other,'/api/rooms/'+room,{action:'agent-accept',id:proposal.id,rev:state.rev,operationId:crypto.randomUUID()},'PATCH',403);
await call(other,'/api/rooms/'+room,{action:'agent-decline',id:proposal.id,rev:state.rev,operationId:crypto.randomUUID()},'PATCH',403);
await call(owner,'/api/rooms/'+room,{action:'revoke',user:other},'PATCH');
await call(other,'/api/rooms/'+room,undefined,'GET',404);
console.log('PASS: second member cannot approve/decline another person’s agent proposal; revoked account cannot read it.');
