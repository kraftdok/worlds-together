'use client';
import {useEffect,useRef} from 'react';
export default function EditableText({value,onChange,label,placeholder,maxLength=6000,className='',multiline=true}:{value:string;onChange:(v:string)=>void;label:string;placeholder:string;maxLength?:number;className?:string;multiline?:boolean}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current&&ref.current.innerText!==value)ref.current.innerText=value;},[value]);
 return <div ref={ref} role="textbox" aria-label={label} aria-multiline={multiline} contentEditable suppressContentEditableWarning className={'editable-text '+className} data-placeholder={placeholder} onInput={e=>{let text=e.currentTarget.innerText;if(text.length>maxLength){text=text.slice(0,maxLength);e.currentTarget.innerText=text;}onChange(text);}} onKeyDown={e=>{if(!multiline&&e.key==='Enter')e.preventDefault();}} onPaste={e=>{e.preventDefault();const text=e.clipboardData.getData('text/plain').slice(0,maxLength-(ref.current?.innerText.length||0));const selection=window.getSelection();if(!selection?.rangeCount)return;const range=selection.getRangeAt(0);range.deleteContents();const node=document.createTextNode(text);range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection.removeAllRanges();selection.addRange(range);onChange(ref.current?.innerText||'');}}/>;
}
