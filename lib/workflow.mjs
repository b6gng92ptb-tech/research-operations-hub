/** Pure business rules, independent of database and HTTP. */
export const STATES=Object.freeze(['draft','submitted','in_review','approved','rejected']);
const EDGES=Object.freeze({draft:['submitted'],submitted:['in_review'],in_review:['approved','rejected'],approved:[],rejected:[]});
export function canTransition(from,to){return (EDGES[from]||[]).includes(to)}
export function canPerform(role,action,owner=false){
 if(role==='admin')return true;
 if(action==='create')return role==='requester';
 if(action==='read')return role==='reviewer'||(role==='requester'&&owner);
 if(action==='submit')return role==='requester'&&owner;
 if(action==='review')return role==='reviewer';
 return false;
}
export function authorizeTransition({role,ownerId,actorId,from,to}){
 if(!canTransition(from,to))return {ok:false,reason:'invalid_transition'};
 const action=to==='submitted'?'submit':'review';
 if(!canPerform(role,action,ownerId===actorId))return {ok:false,reason:'forbidden'};
 return {ok:true};
}
