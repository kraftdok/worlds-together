'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,Check,Sparkles,X} from 'lucide-react';
import {worlds,type Piece,type Room,type Kind} from '@/lib/domain';
import EditableText from './editable-text';
import ConnectionDiscovery from './connection-discovery';
type Person={user:string;name:string;pieces:Piece[];rev:number;enabled:boolean};
type Match={person:string;name:string;rev:number;reason:string;project:string;firstStep:string;yourPieces:string[];theirPieces:string[]};
type Invitation={id:string;sender:string;recipient:string;status:string;room:string|null;payload:{senderName?:string;recipientName?:string;project?:string;firstStep?:string;reason?:string;yours?:Piece[];theirs?:Piece[]}};
type Directory={me:Person|null;people:Person[];requests:Invitation[]};
export default function CrossWorldDiscovery({own,user,api,close,openRoom,onPieces,focus,onSelection,initialIntention,addContext}:{initialIntention?:string;addContext:()=>void;focus?:Piece|null;onSelection?:(ids:string[])=>void;own:Piece[];user:string;api:(path:string,body?:unknown,method?:string)=>Promise<any>;close:()=>void;openRoom:(r:Room)=>void;onPieces:(p:Piece[])=>void}){
 const [data,setData]=useState<Directory|null>(null),[ids,setIds]=useState<string[]>([]),[mode,setMode]=useState<'people'|'pieces'|'invitations'>('people');
 const [intention,setIntention]=useState(initialIntention||''),[reasons,setReasons]=useState<{id:string;reason:string}[]>([]),[matches,setMatches]=useState<Match[]|null>(null),[chosen,setChosen]=useState<Match|null>(null);
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[rehearsal,setRehearsal]=useState<Room|null>(null),[showExamples,setShowExamples]=useState(false);
 const [pieceIndex,setPieceIndex]=useState(0);
 const inspected=own[pieceIndex]||own[0];
 useEffect(()=>{onSelection?.(ids);},[ids]);
 useEffect(()=>{if(!focus)return;const index=own.findIndex(p=>p.id===focus.id);if(index>=0){setPieceIndex(index);setMode('pieces');}else{const match=matches?.find(m=>m.theirPieces.includes(focus.id));if(match)setChosen(match);}},[focus]);
 useEffect(()=>{let stopped=false;const update=(d:Directory)=>{if(!stopped)setData(d);};api('/api/discovery').then(d=>{update(d);if(!stopped)setIds(d.me?.pieces.map((p:Piece)=>p.id)||[]);}).catch(e=>{if(!stopped)setError(e.message);});const timer=setInterval(()=>api('/api/discovery').then(update).catch(()=>{}),2500);return()=>{stopped=true;clearInterval(timer);};},[]);
 useEffect(()=>{onPieces(rehearsal?rehearsal.state.pieces:chosen?data?.people.find(p=>p.user===chosen.person)?.pieces.filter(p=>chosen.theirPieces.includes(p.id))||[]:data?.people.flatMap(p=>p.pieces)||[]);},[data,chosen,rehearsal]);
 async function act(label:string,fn:()=>Promise<void>){setBusy(label);setError('');setNotice('');try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 const me=data?.me,recipient=data?.people.find(p=>p.user===chosen?.person),pending=data?.requests.filter(r=>r.status==='pending'&&r.recipient===user).length||0;
 const details=(pieces:Piece[])=>pieces.map(p=><article className="discovery-piece-text" key={p.id}><h3>{p.title}</h3><p>{p.body}</p>{reasons.find(r=>r.id===p.id)&&<small>{reasons.find(r=>r.id===p.id)?.reason}</small>}</article>);
 async function match(){const d=await api('/api/discovery',{action:'match',ids:me?.pieces.map(p=>p.id),intention});setMatches(d.connections);}
 if(rehearsal)return <><p className="journey-rehearsal">SOLO REHEARSAL · One real account, one fictional contribution. No human match or acceptance is simulated.</p><ConnectionDiscovery own={own} room={rehearsal} close={()=>setRehearsal(null)} highlight={ids=>onPieces(rehearsal.state.pieces.filter(p=>ids.includes(p.id)))} find={async ids=>(await api('/api/ai',{action:'connections',room:rehearsal.id,ids})).connections} start={async c=>{
  const shared=await api('/api/rooms/'+rehearsal.id,{action:'share',ids:c.yourPieces,rev:rehearsal.rev,operationId:crypto.randomUUID()},'PATCH');setRehearsal(shared);
  // Permission to start was given on the exact-piece review, separately from rehearsal setup.
  try{const d=await api('/api/ai',{action:'agent-propose',room:shared.id,rev:shared.rev,ids:[...new Set([...c.yourPieces,...c.theirPieces])],task:(c.project+'\n'+c.firstStep).slice(0,1800)});openRoom(d.room);}
  catch(e){throw Error('Your approved pieces are shared in this rehearsal. '+(e as Error).message);}
 }}/></>;
 return <section className="orbit-creation cross-world-discovery" aria-label="Discover people across worlds">
 <div className="orbit-creation-top"><small>A REASON TO BEGIN TOGETHER</small><button aria-label="Close discovery" disabled={!!busy} onClick={close}><X size={18}/></button></div>
 <div className="journey-path" aria-label="Connection journey"><span className={!chosen&&mode!=='invitations'?'current':''}>Your intention</span><i/><span className={chosen?'current':''}>A connection</span><i/><span className={mode==='invitations'?'current':''}>Both say yes</span><i/><span>Make together</span></div>
 <nav className="discovery-navigation" aria-label="Discovery"><button disabled={!!busy} onClick={()=>{setMode('people');setChosen(null);}}>Discover</button><button disabled={!!busy} onClick={()=>{setMode('pieces');setChosen(null);}}>Sharing permission</button><button disabled={!!busy} onClick={()=>{setMode('invitations');setChosen(null);}}>Invitations {pending>0&&`· ${pending} new`}</button></nav>
 {!data?<p role="status">{error||'Opening the space between worlds…'}</p>:mode==='pieces'?<>
  <small className="spatial-hint">Explore your globe · touch a piece to inspect it</small>
  {inspected&&<article className="spatial-piece-review" key={inspected.id}>
   {inspected.media&&inspected.kind!=='sound'&&<img src={inspected.media.startsWith('media:')?'/api/media/'+inspected.media.slice(6):inspected.media} alt={inspected.title}/>}
   <h2>{inspected.title}</h2><p>{inspected.body}</p>
   {reasons.find(r=>r.id===inspected.id)&&<p className="spatial-reason"><Sparkles size={16}/>{reasons.find(r=>r.id===inspected.id)?.reason}</p>}
   <div className="orbit-inline-actions"><button disabled={!!busy||(!ids.includes(inspected.id)&&ids.length>=8)} aria-pressed={ids.includes(inspected.id)} onClick={()=>setIds(s=>s.includes(inspected.id)?s.filter(id=>id!==inspected.id):[...s,inspected.id])}>{ids.includes(inspected.id)?<><Check size={16}/>Selected · keep private instead</>:<>Let this piece connect <ArrowRight size={16}/></>}</button><button aria-label="Inspect next private piece" onClick={()=>setPieceIndex(i=>(i+1)%own.length)}>Next piece · {pieceIndex+1}/{own.length} <ArrowRight size={15}/></button></div>
  </article>}
  {!own.length&&<button className="connection-find" onClick={addContext}>Add your first private piece <ArrowRight size={16}/></button>}
  <p className="orbit-disclosure">{ids.length} selected: {own.filter(p=>ids.includes(p.id)).map(p=>p.title).join(' · ')||'none yet'}. Approving makes their full text discoverable to signed-in people with app access and their AI matching. Image/audio files stay private.</p>
  <p className="orbit-disclosure">Changing this selection cancels pending invitations. Existing shared rooms and copies are not recalled.</p>
  <div className="orbit-inline-actions"><button disabled={!!busy||!ids.length} onClick={()=>act('Saving your sharing permission…',async()=>{setData(await api('/api/discovery',{action:'publish',ids,rev:me?.rev||0}));setMatches(null);setMode('people');setNotice('These pieces are discoverable. Now find a reason to connect.');})}>Approve these pieces for discovery <ArrowRight size={16}/></button>{me?.enabled&&<button disabled={!!busy} onClick={()=>act('Leaving discovery…',async()=>{setData(await api('/api/discovery',{action:'publish',enabled:false,rev:me.rev}));setIds([]);setMatches(null);setNotice('You are no longer discoverable.');})}>Stop being discoverable</button>}</div>
 </>:mode==='invitations'?<>
  <h2>Something could begin here.</h2>{!data.requests.length&&<p>No invitations yet. A shared world opens only when the invited person accepts.</p>}
  {data.requests.map(r=><article className="discovery-invitation" key={r.id}><small>{r.sender===user?'You invited '+(r.payload.recipientName||'someone'):(r.payload.senderName||'Someone')+' invited you'} · {r.status}</small><h3>{r.payload.project||'This invitation is closed'}</h3>
   {r.status==='pending'&&<><p>{r.payload.reason}</p><p>{r.payload.firstStep}</p><div className="connection-pair"><div><small>{r.payload.senderName}</small>{details(r.payload.yours||[])}</div><div><small>{r.payload.recipientName}</small>{details(r.payload.theirs||[])}</div></div>
    <p className="orbit-disclosure">Acceptance opens a room with only these text pieces and this intention. Agents wait for separate permission. No booking or outside contact. The inviter can approve additional members, who can see the shared work.</p>
    <div className="orbit-inline-actions">{r.recipient===user?<><button disabled={!!busy} onClick={()=>act('Opening your shared world…',async()=>openRoom((await api('/api/discovery',{action:'accept',id:r.id})).room))}>Accept & open our world <ArrowRight size={16}/></button><button disabled={!!busy} onClick={()=>act('Declining…',async()=>setData(await api('/api/discovery',{action:'decline',id:r.id})))}>Decline</button></>:<><p role="status">Waiting for their decision. This updates automatically.</p><button disabled={!!busy} onClick={()=>act('Cancelling…',async()=>setData(await api('/api/discovery',{action:'cancel',id:r.id})))}>Cancel invitation</button></>}</div>
   </>}
   {r.status==='accepted'&&r.room&&<button className="connection-find" onClick={()=>act('Opening your shared world…',async()=>openRoom(await api('/api/rooms/'+r.room)))}>Both said yes. Start making <ArrowRight size={15}/></button>}
  </article>)}
 </>:chosen?<>
  <small>A possibility with {chosen.name} · not yet agreed</small><h2>{chosen.project}</h2><p className="orbit-work-text">{chosen.reason}</p>
  <div className="connection-pair"><div><small>You bring</small>{details(own.filter(p=>chosen.yourPieces.includes(p.id)))}</div><div><small>{chosen.name} brings</small>{details(recipient?.pieces.filter(p=>chosen.theirPieces.includes(p.id))||[])}</div></div>
  <p className="connection-first">The first thing you could make: {chosen.firstStep}</p><p className="orbit-disclosure">Send this intention and the selected text above. They must accept before a room opens. Nothing commits either person to doing the project.</p>
  <div className="orbit-inline-actions"><button disabled={!!busy||!me?.enabled} onClick={()=>act('Sending your invitation…',async()=>{setData(await api('/api/discovery',{action:'request',person:chosen.person,recipientRev:chosen.rev,senderRev:me?.rev,project:chosen.project,firstStep:chosen.firstStep,reason:chosen.reason,yourPieces:chosen.yourPieces,theirPieces:chosen.theirPieces}));setChosen(null);setMode('invitations');})}>Invite {chosen.name} to begin</button><button onClick={()=>setChosen(null)}>Back</button></div>
 </>:<>
  <h2>Who could help this move forward?</h2>
  <EditableText value={intention} onChange={v=>{setIntention(v);setMatches(null);}} label="What do you want to make possible?" placeholder="A research question. A project that needs a collaborator. Something you can offer…" maxLength={1800} className="discovery-intention"/>
  {!own.length&&<button className="connection-find" onClick={addContext}>Start with a private question or capability <ArrowRight size={16}/></button>}
  <button className="connection-find" disabled={!!busy||!intention.trim()||!own.length} onClick={()=>act('Finding the pieces of you that could help…',async()=>{const d=await api('/api/discovery',{action:'suggest',intention});setReasons(d.selections);setIds(d.selections.map((s:any)=>s.id));setMode('pieces');})}><Sparkles size={18}/>Help me choose the pieces</button>
  <p className="orbit-disclosure">This asks AI to consider your saved text and media descriptions privately. You review its suggestions before sharing. No access to past chats or files outside this app.</p>
  {me?.enabled?<button className="connection-find" disabled={!!busy||!data.people.length} onClick={()=>act('Looking for what each of you could bring…',match)}>Find connections with my approved pieces <ArrowRight size={16}/></button>:<button className="orbit-back" onClick={()=>setMode('pieces')}>Choose pieces myself</button>}
  {!data.people.length&&<p className="orbit-disclosure">No other discoverable people yet. Another person needs app access, their own sign-in and approved pieces. For now, you can rehearse below.</p>}
  {matches?.length===0&&<p>No strong fit yet. Try a different intention or selection.</p>}
  {matches?.map(c=><button className="connection-result" key={c.person} onClick={()=>setChosen(c)}><small>{c.name}</small><h3>{c.project}</h3><p>{c.reason}</p><span>See exactly what connects <ArrowRight size={14}/></span></button>)}
  {matches===null&&data.people.length>0&&<p className="orbit-disclosure">{data.people.length} opted-in worlds available. Matching considers up to twenty recently updated worlds.</p>}
  <button className="orbit-back" onClick={()=>setShowExamples(!showExamples)}>Try the solo rehearsal {showExamples?'−':'+'}</button>
  {showExamples&&<div className="rehearsal-worlds"><p>Real AI, your selected pieces, one clearly fictional contribution. This creates a private rehearsal room—not a real match.</p>{(['purpose'] as Kind[]).map(kind=><button key={kind} disabled={!!busy||!own.length} onClick={()=>act('Opening a labelled rehearsal…',async()=>{const d=await api('/api/rooms',{kind,withSample:true,title:'Solo rehearsal · '+worlds[kind].title});setRehearsal(d.room);})}><span>{kind==='fan'?'A collective fan response':kind==='story'?'An imagined world':kind==='city'?'A shared discovery':'A useful collaboration'}</span><ArrowRight size={16}/></button>)}</div>}
 </>}
 {notice&&<p className="orbit-disclosure" role="status">{notice}</p>}{error&&data&&<p className="orbit-error" role="alert">{error}</p>}{busy&&<p className="journey-working" role="status"><Sparkles size={16}/>{busy}</p>}
 </section>;
}
