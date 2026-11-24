import { readJsonBody } from '../../../lib/http.mjs';
import { database, mongoClient } from '../../../lib/mongo.js';
import { requestSchema,canPerform } from '../../../lib/validation.mjs';
import { requireIdentity } from '../../../lib/auth.js';
import { parsePage, requestFilter } from '../../../lib/query.mjs';
export const runtime='nodejs';
export async function GET(req){
 const {user,error}=await requireIdentity(req);if(error)return error;
 let pagination,filter;
 try { const params=new URL(req.url).searchParams;pagination=parsePage(params);filter=requestFilter(user.role,user.sub,params.get('status')); }
 catch {return Response.json({error:'Invalid query parameters'},{status:400});}
 try {const db=await database();const collection=db.collection('requests');
 const [items,total]=await Promise.all([
 collection.find(filter).sort({createdAt:-1,_id:-1}).skip(pagination.skip).limit(pagination.pageSize).toArray(),
 collection.countDocuments(filter)
 ]);
 return Response.json({items,total,page:pagination.page,pageSize:pagination.pageSize},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Database unavailable'},{status:503});}
}
export async function POST(req){
 const {user,error}=await requireIdentity(req,['requester','admin']);if(error)return error;
 if(!canPerform(user.role,'create'))return Response.json({error:'Forbidden'},{status:403});
 const bodyResult=await readJsonBody(req);if(!bodyResult.ok)return Response.json({error:bodyResult.error},{status:bodyResult.status});const body=bodyResult.data;
 const parsed=requestSchema.safeParse(body);if(!parsed.success)return Response.json({error:'Validation failed',details:parsed.error.flatten()},{status:400});
 // Creation and its audit event are committed together, including on retryable errors.
 let session;
 try {
  session=(await mongoClient()).startSession();
  const db=await database();const now=new Date();
  const doc={...parsed.data,ownerId:user.sub,status:'draft',version:1,createdAt:now,updatedAt:now};
  await session.withTransaction(async()=>{
   const result=await db.collection('requests').insertOne(doc,{session});
   doc._id=result.insertedId;
   await db.collection('audit_events').insertOne({requestId:result.insertedId,actor:user.sub,from:null,to:'draft',at:now,version:1,action:'created'},{session});
  });
  return Response.json(doc,{status:201,headers:{'Cache-Control':'no-store'}});
 } catch(err) {
  console.error('Transactional request creation failed',err);
  return Response.json({error:'Database transaction unavailable'},{status:503});
 } finally {if(session)await session.endSession();}
}
