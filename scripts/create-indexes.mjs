import { MongoClient } from 'mongodb';
const uri=process.env.MONGODB_URI;if(!uri)throw Error('MONGODB_URI missing');
const client=new MongoClient(uri);try{await client.connect();const db=client.db(process.env.MONGODB_DB||'research_operations_demo');
await db.collection('requests').createIndexes([{key:{ownerId:1,createdAt:-1}},{key:{status:1,createdAt:-1}}]);
await db.collection('audit_events').createIndex({requestId:1,at:-1});
await db.collection('webhook_events').createIndex({eventId:1},{unique:true});
console.log('Indexes ready');}finally{await client.close()}
