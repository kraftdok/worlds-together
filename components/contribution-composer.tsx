'use client';
import {useEffect,useRef,useState} from 'react';
import {ImagePlus,ArrowUpRight,X} from 'lucide-react';
import EditableText from './editable-text';
export default function ContributionComposer({parent,sources,change,initialFile}:{initialFile?:File|null;parent?:string;sources?:string[];change:(v:Record<string,unknown>)=>Promise<unknown>}){
 const [title,setTitle]=useState(''),[body,setBody]=useState(''),[file,setFile]=useState<File|null>(initialFile||null),[preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const picker=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 async function submit(){setBusy(true);setError('');try{let media:string|undefined;if(file){if(file.size>8*1024*1024)throw Error('Choose a file under 8 MB.');const form=new FormData();form.set('file',file);const response=await fetch('/api/media',{method:'POST',body:form});const result=await response.json() as {id:string;error:string};if(!response.ok)throw Error(result.error);media=result.id;}await change({action:'contribute',parent,sources,title:title.trim()||body.slice(0,60),body,media});setTitle('');setBody('');setFile(null);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="contribution-composer direct-contribution" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}>
  {preview&&(file?.type.startsWith('audio/')?<audio controls src={preview}/>:<img className="contribution-preview" src={preview} alt="Your unsaved contribution"/>)}
  <EditableText value={title} onChange={setTitle} label="Contribution title" placeholder="Give this a name…" maxLength={80} multiline={false} className="direct-title"/>
  <EditableText value={body} onChange={setBody} label="Your contribution" placeholder="Add your perspective. An idea, a memory, another way this could go…" className="direct-body"/>
  <input ref={picker} hidden type="file" accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/ogg,audio/webm" onChange={e=>setFile(e.target.files?.[0]||null)}/>
  <div className="direct-tools"><button onClick={()=>picker.current?.click()}><ImagePlus size={18}/>{file?'Replace attachment':'Bring an image or sound'}</button>{file&&<button aria-label="Remove attachment" onClick={()=>setFile(null)}><X size={16}/></button>}<button disabled={busy||!body.trim()} onClick={submit}>{busy?'Sharing…':'Share this contribution'}<ArrowUpRight size={17}/></button></div>
  <small>Shared with this room, credited to you. Use your own or permitted material. Up to 8 MB; no commercial rights granted.</small>{error&&<p role="alert">{error}</p>}
 </section>;
}
