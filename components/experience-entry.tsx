'use client';
import {useState} from 'react';
import {ArrowRight,ArrowLeft,Lock,Sparkles} from 'lucide-react';
import WorldGlobe from './world-globe';
import EditableText from './editable-text';
import {samplePieces,type Kind} from '@/lib/domain';

const invitations = [
 {kind:'story' as Kind,label:'An imagined world',title:'The letter was never meant for you.',body:'A lake. The last train. A letter addressed to someone who disappeared. Add the other side of the story—or show us a place nobody has seen yet.',image:'/world-city.png',action:'Enter the night station',formats:'A scene · a character · a drawing · a soundscape'},
 {kind:'fan' as Kind,label:'An athlete’s world',title:'What happens before you begin?',body:'An original runner’s invitation: share your starting ritual. A footstep, a photograph, a movement. Build a collective response with other fans, without pretending to speak for the athlete.',image:'/track.png',action:'Answer the invitation',formats:'A ritual · a photograph · a movement · a design'},
 {kind:'music' as Kind,label:'A musician’s world',title:'What does this place sound like to you?',body:'Bring a sound you recorded, an image, or a memory. Let someone answer it in another medium. Together, shape an original response that none of you would have made alone.',image:'/lake-dawn.png',action:'Enter the listening world',formats:'Your recording · an image · a memory · a performance idea'},
];

export default function ExperienceEntry({initial,initialWorld,ready,signedIn,busy,hasPieces,connect,enter,signIn}:{initial:'choose'|'connect'|'create';initialWorld:Kind;ready:boolean;signedIn:boolean;busy:string;hasPieces:boolean;connect:(intention:string)=>Promise<void>;enter:(kind:Kind)=>Promise<void>;signIn:(path:string)=>string}){
 const [path,setPath]=useState(initial),[active,setActive]=useState(Math.max(0,invitations.findIndex(w=>w.kind===initialWorld))),[intention,setIntention]=useState('');
 const world=invitations[active];
 return <main className={'experience-entry entry-'+path}>
  {path==='choose'?<>
   <div className="entry-heading"><p className="eyebrow">DIFFERENT REASONS TO COME TOGETHER</p><h1>What brings<br/><em>you here?</em></h1><p>Find the person who can help something happen.<br/>Or step into a world and leave something of yourself.</p></div>
   <div className="entry-orbit"><WorldGlobe pieces={samplePieces} selected={[]} onSelect={()=>setPath('create')}/><span>ILLUSTRATIVE PIECES · NOT YOUR PRIVATE CONTEXT</span></div>
   <div className="entry-destinations"><button onClick={()=>setPath('connect')}><small>01 / A REAL-WORLD POSSIBILITY</small><h2>Find who<br/>can help.</h2><p>A question, a capability, a shared ambition.<br/>Discover a useful connection. Start the work.</p><span>Begin with what you need <ArrowRight size={20}/></span></button><button onClick={()=>setPath('create')}><small>02 / A WORLD TO PARTICIPATE IN</small><h2>Make your<br/>mark here.</h2><p>Fiction, music, sport, art.<br/>Respond. Riff. Build on what someone else brings.</p><span>Find an invitation <ArrowRight size={20}/></span></button></div>
  </>:<>
   <button className="entry-back" disabled={!!busy} onClick={()=>setPath('choose')}><ArrowLeft size={17}/> Another way to begin</button>
   {path==='connect'?<section className="entry-purpose"><div className="entry-purpose-art" aria-hidden="true"><img src="/sketchbook.png" alt=""/><i/><img src="/lake-dawn.png" alt=""/></div><div><p className="eyebrow">FIND WHO CAN HELP</p><h1>Something you know.<br/>Someone you<br/><em>haven’t met yet.</em></h1><p>Start with a real question or ambition. AI looks for relevant experience and complementary knowledge—not just people who like the same things.</p><EditableText value={intention} onChange={setIntention} label="What do you need help moving forward?" placeholder="I work in women’s health. I’m looking for a scientist to help turn a research question into a pilot…" maxLength={1800} className="entry-intention"/>
    {!signedIn?<a className="entry-action" href={signIn('connect')} target="_top">Sign in to find collaborators <ArrowRight size={18}/></a>:<button className="entry-action" disabled={!ready||!!busy||!intention.trim()} onClick={()=>connect(intention)}>{busy||'Find the relevant pieces of me'} <Sparkles size={18}/></button>}
    <p className="entry-permission"><Lock size={14}/>{hasPieces?'Next: review which private pieces may help. You decide what becomes discoverable.':'This first thought is saved privately. Next, choose what may be used to find a connection.'}</p><p className="entry-expectation">Selected context → a reason to connect → both people accept → a shared workspace. Agents prepare work only when asked. Real matches require other opted-in people.</p>
   </div></section>:<section className="entry-invitation" key={world.kind}><div className="entry-world-image"><img src={world.image} alt={world.label}/><div className="entry-image-traces" aria-hidden="true"><i/><i/><i/></div><span>ORIGINAL DEMO WORLD · FICTIONAL STARTING CONTRIBUTION</span></div><div className="entry-world-copy"><p className="eyebrow">{world.label}</p><h1>{world.title}</h1><p>{world.body}</p><p className="entry-formats">{world.formats}</p>{signedIn?<button className="entry-action" disabled={!ready||!!busy} onClick={()=>enter(world.kind)}>{busy||world.action}<ArrowRight size={18}/></button>:<a className="entry-action" href={signIn(world.kind)} target="_top">Sign in to contribute <ArrowRight size={18}/></a>}<p className="entry-permission">Opens your private version with a labelled sample response. Invite people, add your own media, and build together. No profile matching required.</p><div className="entry-world-switch" aria-label="Choose an invitation">{invitations.map((w,i)=><button key={w.kind} disabled={!!busy} aria-pressed={active===i} onClick={()=>setActive(i)}><img src={w.image} alt=""/><span>{w.label}</span></button>)}</div></div></section>}
  </>}
 </main>;
}
