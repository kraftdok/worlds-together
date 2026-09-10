import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const origin='http://localhost:5173';
const headers={origin,cookie:'__sites_local_auth=1'};
async function call(path,body,method='POST'){const r=await fetch(origin+path,{method,headers:{...headers,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
const form=new FormData();form.set('file',new Blob([await readFile(new URL('../public/lake-dawn.png',import.meta.url))],{type:'image/png'}),'original-demo-lake.png');
const upload=await fetch(origin+'/api/media',{method:'POST',headers,body:form});assert.equal(upload.status,200);const media=await upload.json();
const piece=await call('/api/world',{action:'add',title:'The city before it wakes',body:'Original generated demo photograph, not a personal memory. For this rehearsal I imagine pairing the still water with an original rhythm, leaving a quiet beginning before the sound enters.',kind:'imagination',media:media.id});
const {room}=await call('/api/rooms',{kind:'music',title:'Morning sounds',invitation:'create',withSample:true});
assert(!room.state.pieces.some(x=>x.id===piece.id));
const privateWorld=await call('/api/world',undefined,'GET');assert(privateWorld.pieces.some(x=>x.id===piece.id));
const file=await fetch(origin+'/api/media/'+media.id,{headers});assert.equal(file.status,200);
console.log(JSON.stringify({passed:true,checks:['original image upload','private persistence','new room excludes private image','owner can read image'],room:room.id,piece:piece.id}));
