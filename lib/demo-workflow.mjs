import {authorizeTransition} from './workflow.mjs';

/** Immutable browser-only showcase state. No authentication or server persistence. */
export function applyDemoTransition(rows, events, {id, to, role, actorId='demo-user', at=new Date().toISOString()}) {
  const current=rows.find(row=>row._id===id);
  if(!current) return {ok:false, reason:'not_found', rows, events};
  const decision=authorizeTransition({role, ownerId:current.ownerId, actorId, from:current.status, to});
  if(!decision.ok) return {...decision, rows, events};
  const updated={...current, status:to, version:current.version+1};
  const event={_id:`demo-event-${events.length+1}`, requestId:id, from:current.status, to, actor:role, at};
  return {ok:true, rows:rows.map(row=>row._id===id?updated:row), events:[...events,event]};
}
export function createDemoRequest(rows,events,request,{id,actorId='demo-user',at=new Date().toISOString()}={}){
  if(!id || rows.some(row=>row._id===id)) return {ok:false,reason:'duplicate_or_missing_id',rows,events};
  const created={...request,_id:id,status:'draft',version:1,ownerId:actorId};
  const event={_id:`demo-event-${events.length+1}`,requestId:id,from:null,to:'draft',actor:'requester',at};
  return {ok:true,rows:[created,...rows],events:[...events,event]};
}
