import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {type State,type Kind,type Room,type Piece} from './domain';

type Bindings={DB:D1Database;BUCKET:R2Bucket;OPENAI_API_KEY?:string;OPENAI_MODEL?:string;DEMO_AI_BUDGET_USD?:string};
export const runtime=()=>env as unknown as Bindings;
export const db=()=>runtime().DB;
export class Problem extends Error { constructor(message:string,public status=400){super(message);} }
export function fail(message:string,status=400):never{throw new Problem(message,status);}
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function boundary(fn:()=>Promise<Response>){try{return await fn();}catch(e){if(e instanceof Problem)return json({error:e.message},e.status);console.error('Worlds request failed:',e instanceof Error?e.name:'unknown');return json({error:'This action could not finish. Your draft is still here. Please retry.'},503);}}
export async function identity(required=true){const u=await getChatGPTUser();if(!u&&required)fail('Sign in to continue.',401);return u?{userId:u.userId,displayName:u.fullName||u.email.split('@')[0]}:null;}
export async function input(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)fail('Please make changes from this site.',403);if(!request.headers.get('content-type')?.includes('application/json'))fail('JSON required.',415);const text=await limitedBody(request,40000);let value;try{value=JSON.parse(new TextDecoder().decode(text));}catch{fail('Invalid request.');}if(!value||typeof value!=='object'||Array.isArray(value))fail('Invalid request.');return value as Record<string,any>;}
export async function limitedBody(request:Request,max:number){if(Number(request.headers.get('content-length'))>max)fail('This file or request is too large.',413);const reader=request.body?.getReader();if(!reader)fail('Empty request.');const chunks:Uint8Array[]=[];let total=0;while(true){const {done,value}=await reader!.read();if(done)break;total+=value.length;if(total>max){await reader!.cancel();fail('This file or request is too large.',413);}chunks.push(value);}const result=new Uint8Array(total);let offset=0;for(const c of chunks){result.set(c,offset);offset+=c.length;}return result;}
export function string(v:unknown,max:number,label:string){if(typeof v!=='string'||!v.trim()||v.length>max)fail(`Please provide ${label} (up to ${max} characters).`);return (v as string).trim();}
export async function hash(v:string){const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return [...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export const token=()=>crypto.randomUUID()+crypto.randomUUID();
export type Row={id:string;owner:string;kind:Kind;state:string;rev:number;invite_hash:string};
export async function roomRow(id:string,user:string){const row=await db().prepare('SELECT r.* FROM rooms r JOIN members m ON r.id=m.room WHERE r.id=? AND m.user=?').bind(id,user).first<Row>();if(!row)fail('This room is unavailable to your account. Join with an invitation first.',404);return row!;}
export async function roomView(row:Row,user:string):Promise<Room>{const {results}=await db().prepare('SELECT user,name FROM members WHERE room=? ORDER BY rowid').bind(row.id).all<{user:string;name:string}>();const requests=row.owner===user?(await db().prepare('SELECT user,name FROM join_requests WHERE room=?').bind(row.id).all<{user:string;name:string}>()).results:undefined;return {id:row.id,kind:row.kind,owner:row.owner===user,rev:row.rev,state:JSON.parse(row.state),members:results,requests};}

// Conservative prepaid allowance, not an invoice. Never refunds timed-out or
// failed requests: they may still have been billed. Only bounds this app's calls.
export async function reserveCost(inputBytes:number){
 const dollars=Number(runtime().DEMO_AI_BUDGET_USD||'25');if(!Number.isFinite(dollars)||dollars<=0||dollars>100)fail('AI is paused until the demo budget is configured.',503);
 const cap=Math.floor(dollars*1_000_000);
 // Standard Astra pricing: conservatively price every UTF-8 byte as an input
 // token at the cache-write rate; include schema/wrapper headroom and max output.
 const reserve=Math.ceil((inputBytes+4096)*12.5+3500*50);
 const result=await db().prepare('INSERT INTO budgets (user,window,count) SELECT ?,0,? WHERE ?<=? ON CONFLICT(user) DO UPDATE SET count=budgets.count+excluded.count WHERE budgets.count+excluded.count<=? RETURNING count').bind('spend:lifetime',reserve,reserve,cap,cap).first();
 if(!result)fail('The demo’s total AI allowance has been reached. Paid requests are paused; you can still share and write together.',429);
}
export async function ownPieces(user:string):Promise<Piece[]>{return (await db().prepare('SELECT id,title,body,kind,media FROM pieces WHERE owner=? ORDER BY created').bind(user).all<Piece>()).results;}
export function event(state:State,text:string){state.events.push({text,at:new Date().toISOString()});state.events=state.events.slice(-100);}
export async function saveState(row:Row,state:State,revision:unknown,operation:string,inviteHash?:string){if(revision!==row.rev)fail('Someone changed this world. Your draft is safe; review the refreshed version and try again.',409);if(state.pieces.length>40||state.creations.length>40)fail('This demo room is full. Open another shared world.');state.operations=[...state.operations,operation].slice(-100);const next=await db().prepare('UPDATE rooms SET state=?,rev=rev+1,invite_hash=? WHERE id=? AND rev=? RETURNING *').bind(JSON.stringify(state),inviteHash||row.invite_hash,row.id,row.rev).first<Row>();if(!next)fail('Someone changed this world while you were working. Review the refreshed version and try again.',409);return next!;}
export function configured(){return Boolean(runtime().OPENAI_API_KEY);}
export async function consumeBudget(user:string){const window=Math.floor(Date.now()/3600000);for(const [id,limit] of [[`person:${user}`,20],['site:ai',100]] as const){const result=await db().prepare('INSERT INTO budgets (user,window,count) VALUES (?,?,1) ON CONFLICT(user) DO UPDATE SET window=excluded.window,count=CASE WHEN budgets.window=excluded.window THEN budgets.count+1 ELSE 1 END WHERE budgets.window<>excluded.window OR budgets.count<? RETURNING count').bind(id,window,limit).first();if(!result)fail(id==='site:ai'?'This demo has reached its shared hourly AI limit. You can still write and collaborate.':'Your 20 AI requests for this hour are used. You can still write and collaborate.',429);}}
