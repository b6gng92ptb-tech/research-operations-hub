import { MongoClient } from 'mongodb';
let clientPromise;
export async function mongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw Error('MONGODB_URI missing');
  if (!clientPromise) clientPromise = new MongoClient(uri).connect().catch(err => { clientPromise = undefined; throw err; });
  return clientPromise;
}
export async function database() {
  return (await mongoClient()).db(process.env.MONGODB_DB || 'research_operations_demo');
}
