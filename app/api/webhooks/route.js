import { validEventId } from '../../../lib/security.mjs';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { database } from '../../../lib/mongo.js';
import { readRawBody } from '../../../lib/raw-body.mjs';
export const runtime='nodejs';
export async function POST(req){
 const secret=process.env.WEBHOOK_SECRET;if(!secret||secret.length<32)return Response.json({error:'Webhook disabled'},{status:503});
 const result=await readRawBody(req,100000);if(!result.ok)return Response.json({error:result.error},{status:result.status});
 const raw=result.body;
 const signature=req.headers.get('x-hub-signature-256')||'';const expected='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
 const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return Response.json({error:'Invalid signature'},{status:401});
 let payload;try{payload=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400})}
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||!validEventId(payload.eventId))return Response.json({error:'Invalid eventId'},{status:400});
 try{const db=await database();await db.collection('webhook_events').updateOne({eventId:payload.eventId},{$setOnInsert:{eventId:payload.eventId,payload,receivedAt:new Date()}},{upsert:true});return Response.json({accepted:true})}
 catch{return Response.json({error:'Database unavailable'},{status:503})}
}
