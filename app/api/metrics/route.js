import { database } from '../../../lib/mongo.js';
import { requireIdentity } from '../../../lib/auth.js';
export const runtime='nodejs';
export async function GET(req){const {error}=await requireIdentity(req,['admin','reviewer']);if(error)return error;
 try{const db=await database();const data=await db.collection('requests').aggregate([{$group:{_id:'$status',count:{$sum:1}}},{$sort:{_id:1}}]).toArray();return Response.json(data,{headers:{'Cache-Control':'no-store'}})}
 catch{return Response.json({error:'Database unavailable'},{status:503})}}
