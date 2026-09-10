import type {Creation,Frame,Piece,Room} from './domain';

export type ScenePiece=Piece&{credits:string[];creation?:string};
export function scenePieces(room:Room):ScenePiece[]{
 return [...room.state.pieces.map(p=>({...p,credits:[p.id]})),...room.state.creations.filter(c=>!c.media&&!c.frames).map(c=>({id:'version:'+c.id,title:c.title,body:c.body,kind:'words',author:c.by,credits:c.sources,creation:c.id}))];
}
export function openingScene(room:Room):{frames:Frame[];parent?:Creation;credits:string[]}{
 const latest=room.state.creations.filter(c=>c.frames?.length).at(-1);
 if(latest)return {frames:latest.frames!.map(f=>({...f})),parent:latest,credits:[...latest.sources]};
 const image=room.state.pieces.find(p=>p.media&&p.kind!=='sound'),sound=room.state.pieces.find(p=>p.media&&p.kind==='sound');
 return {frames:[{image:image?.id||null,sound:sound?.id||null,caption:'',seconds:8}],credits:[image?.id,sound?.id].filter((id):id is string=>!!id)};
}
export function applyScenePiece(frame:Frame,piece:ScenePiece):Frame{
 return {...frame,...(piece.media?piece.kind==='sound'?{sound:piece.id}:{image:piece.id}:{caption:piece.body.slice(0,500)})};
}
export function sceneSources(frames:Frame[],credits:string[]):string[]{return [...new Set([...credits,...frames.flatMap(f=>[f.image,f.sound].filter((id):id is string=>!!id))])];}
export function sceneHasMissingSources(room:Room,frames:Frame[],credits:string[],parent?:Creation){
 const ids=new Set(room.state.pieces.map(p=>p.id));
 return sceneSources(frames,credits).some(id=>!ids.has(id))||!!parent&&!room.state.creations.some(c=>c.id===parent.id);
}
