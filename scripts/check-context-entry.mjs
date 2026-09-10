import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../components/worlds-app.tsx',import.meta.url),'utf8');
const route=readFileSync(new URL('../app/api/[...path]/route.ts',import.meta.url),'utf8');
const allowed=JSON.parse(route.match(/if\(!(\['memory'[^\]]+\])\.includes\(value.kind\)/)[1].replaceAll("'",'"'));
const fn=source.split('\n').find(l=>l.includes('async function beginConnection(')).trim().replace('intention:string','intention');
for(const hasPieces of [false,true]){
 const calls=[],states=[];
 const context={profile:{pieces:hasPieces?[{id:'private'}]:[]},busy:'',requireUser:()=>true,task:async(_,f)=>f(),api:async(path,body)=>{assert.equal(path,'/api/world');assert.equal(body.action,'add');assert(allowed.includes(body.kind),'First context must use a server-supported piece type');calls.push(body);},refresh:async()=>{},history:{replaceState:()=>{}}};
 for(const name of ['setConnectionIntention','setEntry','setFocus','setSelected','setCommonsOpen','setDiscovering','setView'])context[name]=value=>states.push([name,value]);
 await vm.runInNewContext(fn+';beginConnection("Synthetic research question")',context);
 assert.equal(calls.length,hasPieces?0:1);
 assert(states.some(([name,value])=>name==='setConnectionIntention'&&value==='Synthetic research question'));
 assert(states.some(([name,value])=>name==='setDiscovering'&&value===true));
}
console.log('PASS: first context uses an accepted type; existing context is preserved; intention reaches discovery; no automatic sharing or paid request.');
const restore=source.match(/if\(openedRoom.current!==data.id\)\{.*?\}setError/)[0].replace(/setError$/,'').replace('(p:any)','(p)');
const openedRoom={current:''},restored=[];
const ctx={openedRoom,data:{id:'isolated-room',state:{agentProposals:[{id:'saved-draft',status:'proposed'}],creations:[]}},setCommonsOpen:v=>restored.push(['open',v]),setOrbitCreation:v=>restored.push(['draft',v])};
vm.runInNewContext(restore,ctx);
assert.deepEqual(restored,[['open',true],['draft','saved-draft']]);
vm.runInNewContext(restore,ctx);
assert.equal(restored.length,2,'Polling must not steal the user’s current view');
console.log('PASS: saved agent draft reopens on room entry; later polls do not hijack navigation.');
const save=ts.transpile(source.split('\n').find(l=>l.includes('async function savePiece(')).trim(),{target:ts.ScriptTarget.ES2022});
for(const review of [false,true]){
 const calls=[],states=[];
 const context={requireUser:()=>true,task:async(_,f)=>f(),file:null,title:'Synthetic context',body:'This is isolated test context.',pieceKind:'curiosity',room:{id:'isolated-room'},api:async(path,body)=>{calls.push([path,body]);return{id:'new-piece'};},refresh:async()=>{}};
 for(const name of ['setModal','setTitle','setBody','setFile','setFocus','setSelected','setMessage'])context[name]=value=>states.push([name,value]);
 await vm.runInNewContext(save+`;savePiece(${review})`,context);
 assert.equal(calls.length,1);assert.equal(calls[0][0],'/api/world');assert.equal(calls[0][1].action,'add');
 assert.equal(states.filter(([k,v])=>k==='setModal'&&v==='selection').length,review?1:0);
 assert.equal(states.some(([k,v])=>k==='setFocus'&&v.id==='new-piece'),true);
}
console.log('PASS: saving keeps context private; optional room review opens without sharing; new piece remains visible.');
