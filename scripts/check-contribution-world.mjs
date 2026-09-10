import assert from 'node:assert/strict';
const origin='http://localhost:5173';
async function call(path,body,expected=200,method=body?'POST':'GET'){
 const r=await fetch(origin+path,{method,headers:{origin,cookie:'__sites_local_auth=1','content-type':'application/json'},body:body?JSON.stringify(body):undefined});
 const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;
}
const rooms=[];
for(const kind of ['fan','story']){
 let room=(await call('/api/rooms',{kind,withSample:true,invitation:'create'})).room;
 const patch=(body,status=200)=>call('/api/rooms/'+room.id,{...body,rev:room.rev,operationId:crypto.randomUUID()},status,'PATCH');
 const before=room.state.pieces[0].body;
 room=await patch({action:'contribute',title:kind==='fan'?'Three breaths before the starting line':'The station listens back',body:kind==='fan'?'Original fictional demo response: I take three slow breaths before stepping onto the track. A second fan could answer with their own starting ritual.':'Original fictional demo branch: the station was built around a room that remembers every goodbye. Someone could draw the room or give its memories a sound.',sources:['source']});
 const root=room.state.creations.at(-1);
 assert.equal(root.mode,'human');assert.equal(root.parent,undefined);assert.deepEqual(root.sources,['source']);
 room=await patch({action:'contribute',parent:root.id,title:kind==='fan'?'An answer from the stands':'A different memory of the room',body:kind==='fan'?'Fictional rehearsal branch: a supporter taps the same three-beat rhythm from the stands. This is a fan contribution, not an athlete endorsement.':'Fictional rehearsal branch: a drawing could show two doors opening onto the same lake, one at dawn and one at dusk.',sources:['source']});
 assert.equal(room.state.creations.at(-1).parent,root.id);assert.equal(room.state.pieces[0].body,before);
 await patch({action:'contribute',title:'Invalid private reference',body:'Must fail',sources:['not-shared']},400);
 await patch({action:'assemble',title:'Unknown media',note:'Must fail',frames:[{image:'not-shared',sound:null,caption:'Test',seconds:6}]},400);
 room=await patch({action:'assemble',title:kind==='fan'?'How we begin — a fan response':'Two doors to the lake',note:'Original demo arrangement using the invitation image and a community response.',parent:root.id,frames:[{image:'source',sound:null,caption:kind==='fan'?'Three breaths. One beginning.':'One room. Two memories.',seconds:4},{image:'source',sound:null,caption:kind==='fan'?'What is your starting ritual?':'Which door would you open?',seconds:4}]});
 const arrangement=room.state.creations.at(-1);assert.equal(arrangement.frames.length,2);assert.equal(arrangement.parent,root.id);
 const persisted=await call('/api/rooms/'+room.id);assert.deepEqual(persisted.state.creations.at(-1),arrangement);
 await call('/api/rooms/'+room.id,{action:'assemble',title:'Stale',note:'No overwrite',frames:arrangement.frames,rev:room.rev-1,operationId:crypto.randomUUID()},409,'PATCH');
 rooms.push({kind,id:room.id});
}
console.log(JSON.stringify({passed:true,rooms,checks:['root responses without an AI prerequisite','credited fan and fiction branches','original invitation unchanged','private sources rejected','unshared media rejected','playable arrangements persisted','stale writes rejected']}));
