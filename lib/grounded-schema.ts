// Keep source references inside the permission boundary at generation time,
// not merely after the model has written a draft with invented references.
export function groundedSchema(schema:any, context:any) {
 if(!schema.properties?.sources)return schema;
 const pieces=context.pieces||context.sharedPieces;
 if(!Array.isArray(pieces)||pieces.length<2)return schema;
 const ids=pieces.map((p:any)=>p.id);
 const properties={...schema.properties,sources:{type:'array',minItems:2,maxItems:ids.length,items:{type:'string',enum:ids}}};
 if(properties.frames){
  const frame=properties.frames.items;
  properties.frames={...properties.frames,items:{...frame,properties:{...frame.properties,
   image:{type:['string','null'],enum:[null,...pieces.filter((p:any)=>(p.hasMedia||p.media)&&p.kind!=='sound').map((p:any)=>p.id)]},
   sound:{type:['string','null'],enum:[null,...pieces.filter((p:any)=>(p.hasMedia||p.media)&&p.kind==='sound').map((p:any)=>p.id)]}
  }}};
 }
 return {...schema,properties};
}
