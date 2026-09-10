import type {Creation,Piece} from './domain';

export const deliverables=[
 {id:'brief',label:'A one-page project brief',detail:'A clear problem, a small first test, and what each person could contribute.',instruction:'Write a decision-ready one-page project brief: the specific problem; evidence from each contributor; one small first test; a concrete deliverable; proposed contributions (not assigned commitments); assumptions and the next decision.'},
 {id:'research',label:'Questions we can test',detail:'Turn complementary knowledge into a focused research starting point.',instruction:'Write five specific non-clinical research questions grounded in the shared context. For each give its rationale, an appropriate exploratory method, and what answer would change a decision. End with the most important missing information. This is research scoping, not clinical advice, a validated protocol or evidence of efficacy.'},
 {id:'experience',label:'An experience people could join',detail:'A specific participation idea, what it needs, and a useful follow-up.',instruction:'Write one concrete hosted experience concept: who it serves, what guests actually do, what each contribution changes, a short sequence, required resources marked confirmed or unknown, and a follow-up that gives guests value. Include one measurable signal of success. No invented bookings, costs, attendance or endorsement.'},
] as const;
export function firstDeliverable(id:string,intention:string){
 const d=deliverables.find(d=>d.id===id)||deliverables[0];
 return (d.instruction+'\nUse only the selected shared pieces. Produce the actual draft now, not instructions to write it. Separate supplied facts from proposals and unknowns. Explain why this needs these people together. Do not invent expertise, evidence, consent, deadlines or commitments.\nOur starting point: '+intention.slice(0,900)).slice(0,1800);
}
export function exportContribution(creation:Creation,pieces:Piece[],pending:boolean){
 return '# '+creation.title+'\n\n'+(pending?'UNAPPROVED AI PROPOSAL — not a commitment.':'Saved contribution — not evidence of external action.')+'\n\n'+creation.body+'\n\n## Why these contributions matter\n\n'+creation.reason+'\n\n## Sources and credit\n\n'+creation.sources.map(id=>{const p=pieces.find(p=>p.id===id);return p?'- '+p.title+' — '+(p.author||'Shared source')+(p.sample?' (fictional sample)':''):'- Withdrawn source';}).join('\n')+'\n\nBy: '+creation.by+'\n'+(creation.agent?'Agent contribution approved by: '+creation.agent.approvedBy+'\n':'');
}
