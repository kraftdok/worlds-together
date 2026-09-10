'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,GitBranch,Play,Pause,Plus,Sparkles,X,Music} from 'lucide-react';
import type {Creation,Room} from '@/lib/domain';
import ContributionComposer from './contribution-composer';
import EditableText from './editable-text';
import ActivityActions from './activity-actions';
import {mediaUrl} from './encounter-scene';
import {deliverables,firstDeliverable,exportContribution} from '@/lib/first-deliverable';

export default function OrbitCollaboration({room,user,current,onSelect,onClose,onSource,onContext,change,run}:{onContext:()=>void;room:Room;user:string;current:string|null;onSelect:(id:string|null)=>void;onClose:()=>void;onSource:(ids:string[])=>void;change:(v:Record<string,unknown>)=>Promise<Room>;run:(task:string,ids:string[],arrange:boolean,parent?:string)=>Promise<void>}){
 const [mode,setMode]=useState<'view'|'respond'|'agent'|'trace'>('view'),[brief,setBrief]=useState(''),[ids,setIds]=useState<string[]>(['source']),[error,setError]=useState(''),[busy,setBusy]=useState(false),[playing,setPlaying]=useState(false),[frame,setFrame]=useState(0);
 const audio=useRef<HTMLAudioElement>(null);
 const previousRevision=useRef(room.rev),[update,setUpdate]=useState(''),[followThrough,setFollowThrough]=useState(false);
 useEffect(()=>{if(room.rev>previousRevision.current){setUpdate(room.state.events.at(-1)?.text||'New work arrived.');previousRevision.current=room.rev;}},[room.rev]);
 const work=room.state.creations.find(c=>c.id===current),proposal=room.state.agentProposals?.find(p=>p.id===current&&p.status==='proposed');
 const shown=work||proposal?.draft,source=room.state.pieces.find(p=>p.id==='source');
 const practical=room.state.invitation==='connect'||room.state.invitation==='experience';
 function downloadDraft(){if(!shown)return;const url=URL.createObjectURL(new Blob([exportContribution(shown,room.state.pieces,!!proposal)],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='worlds-together-draft.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const parent=work?.parent?room.state.creations.find(c=>c.id===work.parent):undefined;
 const frames=shown?.frames,shot=frames?.[frame];
 function beginAgent(){
  const picked=[...new Set([...(shown?.sources||[]),...room.state.pieces.filter(p=>p.id!=='source').map(p=>p.id),'source'])].filter(id=>room.state.pieces.some(p=>p.id===id)).slice(0,12);
  setIds(picked);
  setBrief(source?.kind==='shared intention'?source.body.slice(0,1800):shown?'Build on “'+shown.title+'” using the selected contributions. Make one concrete new version and explain what each person changed.':room.kind==='story'?'Create a vivid original scene from these perspectives. Preserve the original and make this a separate community branch.':room.kind==='fan'||room.kind==='athlete'?'Create a short collective fan ritual using these contributions: a sound, image or movement response people could actually add to. No endorsement.':room.kind==='music'?'Shape a short sound-and-image response from our original contributions. Give each person a concrete part to build.':'Create a useful first draft from what each of us brings. Make the next step specific; do not claim any booking or agreement.');
  setMode('agent');
 }
 const picture=shot?.image?room.state.pieces.find(p=>p.id===shot.image):undefined;
 const sound=shot?.sound?room.state.pieces.find(p=>p.id===shot.sound):undefined;
 const image=picture?mediaUrl(picture,room):shown?.media&&shown.mediaKind!=='sound'?'/api/media/'+shown.media.slice(6)+'?room='+room.id:!shown&&source?mediaUrl(source,room):undefined;
 const soundUrl=sound?mediaUrl(sound,room):shown?.mediaKind==='sound'?'/api/media/'+shown.media!.slice(6)+'?room='+room.id:undefined;
 const nodes=[...room.state.creations.map(c=>({id:c.id,title:c.title,by:c.by})),...(room.state.agentProposals||[]).filter(p=>p.status==='proposed').map(p=>({id:p.id,title:p.draft.title,by:p.name+' · pending'}))];
 useEffect(()=>{if(!current&&source?.kind==='shared intention'&&!room.state.creations.length&&!room.state.agentProposals?.length)beginAgent();else setMode('view');setPlaying(false);setFrame(0);setError('');},[current]);
 useEffect(()=>{onSource(mode==='agent'?ids:shown?.sources||['source']);},[mode,ids,shown?.id]);
 useEffect(()=>{if(!playing||!shot)return;const timer=setTimeout(()=>{if(frame<(frames?.length||0)-1)setFrame(f=>f+1);else{setPlaying(false);setFrame(0);}},shot.seconds*1000);return()=>clearTimeout(timer);},[playing,frame,shot]);
 useEffect(()=>{const a=audio.current;if(!a)return;a.currentTime=0;if(playing)a.play().catch(()=>{setPlaying(false);setError('Press play again to enable audio.');});else a.pause();},[playing,frame,soundUrl]);
 async function act(fn:()=>Promise<void>){setBusy(true);setError('');try{await fn();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 const invitation=room.kind==='story'?'An original world · community branches are not canon':room.kind==='fan'||room.kind==='athlete'?'An athlete invitation · fan responses are not endorsement':room.state.invitation==='create'?'A shared invitation · original contributions':'A shared invitation · no commitment implied';
 return <section className="orbit-creation" aria-label="Create inside the worlds">
  <div className="orbit-creation-top"><small>{proposal?proposal.name+' · awaiting approval':shown?shown.by:invitation}</small><button aria-label="Return to private pieces" onClick={onClose}><X size={17}/></button></div>
  <div className="journey-path">{room.state.invitation==='create'?<><span className={!shown&&mode==='view'?'current':''}>An invitation</span><i/><span className={mode==='respond'?'current':''}>Your response</span><i/><span className={mode==='agent'||proposal?'current':''}>An agent can help</span><i/><span className={work?'current':''}>Build on each other</span></>:<><span>Pieces shared</span><i/><span className={mode==='agent'?'current':''}>Prepare the work</span><i/><span className={proposal?'current':''}>You approve</span><i/><span className={work?'current':''}>Take it forward</span></>}</div>
  {update&&<p className="journey-update" role="status">{update}</p>}
  {mode==='trace'?<><button className="orbit-back" onClick={()=>setMode('view')}><ArrowLeft size={16}/> Back to the creation</button><h2>What each piece changed.</h2><p className="orbit-work-text">{shown?.reason}</p>{room.state.pieces.filter(p=>shown?.sources.includes(p.id)).map(p=><article className="spatial-piece-review" key={p.id}><h3>{p.title}</h3><small>{p.author}</small><p>{p.body}</p></article>)}</>:mode==='respond'?<><button className="orbit-back" onClick={()=>setMode('view')}><ArrowLeft size={14}/> {shown?'Back to this contribution':'Back to the invitation'}</button><ContributionComposer parent={work?.id} sources={work?.sources||['source']} change={async v=>{const next=await change(v);setMode('view');onSelect(next.state.creations.at(-1)!.id);return next;}}/></>:mode==='agent'?<>
   <div className="orbit-agent-heading"><Sparkles size={25}/><span>Ask your agent to help</span></div><p className="orbit-disclosure">Your agent uses the shared pieces below—not your whole private world.</p><button className="text-button" disabled={busy} onClick={onContext}><Plus size={16}/> Choose from my context</button>
   {practical&&<div className="deliverable-choices"><h3>What would make this connection useful today?</h3>{deliverables.map(d=><button key={d.id} disabled={busy} onClick={()=>setBrief(firstDeliverable(d.id,source?.body||''))}><strong>{d.label}</strong><span>{d.detail}</span><ArrowRight size={17}/></button>)}</div>}
   <EditableText value={brief} onChange={setBrief} label="Brief your agent" placeholder={room.kind==='story'?'What could exist just beyond this scene?':room.kind==='fan'?'What could these fan contributions become together?':'What could we make from these pieces?'} maxLength={1800} className="direct-body"/>
   <div className="orbit-source-pieces">{room.state.pieces.map(p=><button key={p.id} aria-pressed={ids.includes(p.id)} onClick={()=>setIds(s=>s.includes(p.id)?s.filter(id=>id!==p.id):[...s,p.id])}>{p.media&&p.kind!=='sound'?<img src={mediaUrl(p,room)} alt=""/>:<Music size={16}/>}<span>{p.title}</span>{ids.includes(p.id)&&<Check size={12}/>}</button>)}</div>
   <p className="orbit-disclosure">Only these selected shared pieces and source-covered versions go to the model. The room sees its proposal; you decide whether to accept it.</p>
   <p className="agent-readiness" role="status">{ids.length<2?'Choose at least two pieces so this is genuinely made together.':ids.length>12?'Choose no more than twelve pieces.':!brief.trim()?'Tell your agent what to make.':ids.length+' pieces selected. Ready for your permission to draft.'}</p>
   {busy&&<div className="journey-working" role="status"><Sparkles size={18}/><span>Request sent · drafting from these {ids.length} pieces. Nothing is accepted or acted on yet.</span></div>}
   <div className="orbit-inline-actions"><button disabled={busy||ids.length<2||ids.length>12||!brief.trim()} onClick={()=>act(async()=>{await run(brief,ids,false,work?.id);setMode('view');setBrief('');})}><Sparkles size={15}/>{busy?'Your agent is working…':'Propose a contribution'}</button><button disabled={busy||ids.length<2||ids.length>12||!brief.trim()} onClick={()=>act(async()=>{await run(brief,ids,true,work?.id);setMode('view');setBrief('');})}><Play size={14}/> Arrange the media</button><button onClick={()=>setMode('view')}>Back</button></div>
  </>:<>
   {image&&<div className="orbit-work-image"><img src={image} alt={shown?.title||source?.title||'Shared invitation'}/>{shot?.caption&&<p>{shot.caption}</p>}</div>}
   {soundUrl&&<audio ref={audio} controls={!frames} src={soundUrl} onError={()=>{setPlaying(false);setError('This audio could not load.');}}/>}
   {frames&&<div className="orbit-play"><button aria-label={playing?'Pause creation':'Play creation'} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={18}/>:<Play size={18}/>}</button><span>Moment {frame+1} of {frames.length} · {frames.reduce((n,f)=>n+f.seconds,0)} seconds</span><button aria-label="Next moment" onClick={()=>{setPlaying(false);setFrame(f=>(f+1)%frames.length);}}><ArrowRight size={15}/></button></div>}
   <h2>{shown?.title||source?.title}</h2><p className="orbit-work-text">{shown?.body||source?.body}</p>
   {parent&&<button className="orbit-parent" onClick={()=>onSelect(parent.id)}><GitBranch size={14}/> Grew from {parent.title}</button>}
   {shown&&<div className="orbit-credit">{shown.sources.map(id=><span key={id}>{room.state.pieces.find(p=>p.id===id)?.title||'Withdrawn source'}</span>)}</div>}
   {shown&&<><button className="orbit-parent" onClick={()=>setMode("trace")}><GitBranch size={15}/> See what each piece changed</button><button className="orbit-parent" onClick={downloadDraft}>Download {proposal?'unapproved proposal':'draft'} with source credits <ArrowRight size={15}/></button></>}
   {proposal?<><p className="orbit-disclosure">Your agent’s draft is saved. Keep it to build on it together, or decline it. Agent credit is retained.</p>{proposal.principal===user?<div className="orbit-inline-actions"><button disabled={busy} onClick={()=>act(async()=>{await change({action:'agent-accept',id:proposal.id});onSelect(proposal.draft.id);})}><Check size={15}/> Keep this draft</button><button disabled={busy} onClick={()=>act(async()=>{await change({action:'agent-decline',id:proposal.id});onSelect(null);})}>Decline</button></div>:<small>Waiting for {proposal.name}’s owner to decide.</small>}</>:<div className="orbit-inline-actions"><button onClick={()=>setMode('respond')}><Plus size={16}/>{shown?'Build on this':'Answer this invitation'}</button><button onClick={onContext}>Choose from my context</button><button onClick={()=>{beginAgent();}}><Sparkles size={16}/> Ask your agent</button></div>}
  </>}
  {mode==='view'&&work&&room.state.invitation&&room.state.invitation!=='create'&&<><button className="orbit-back" onClick={()=>setFollowThrough(!followThrough)}>{followThrough?'Return to the creation':'Take this into the real world'} <ArrowRight size={14}/></button>{followThrough&&<ActivityActions room={room} creation={work} user={user} change={change}/>}</>}
  {error&&<p className="orbit-error" role="alert">{error}</p>}
  {mode==='view'&&nodes.length>0&&<nav className="orbit-branches" aria-label="Contributions in this world"><button onClick={()=>onSelect(null)} className={!current?'active':''}>The invitation</button>{nodes.map(n=><button key={n.id} className={current===n.id?'active':''} onClick={()=>onSelect(n.id)}><GitBranch size={12}/><span>{n.title}<small>{n.by}</small></span></button>)}</nav>}
 </section>;
}
