import { ObjectId } from 'mongodb';
import { database } from '../../../../../lib/mongo.js';
import { requireIdentity } from '../../../../../lib/auth.js';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const { user, error } = await requireIdentity(request);
  if (error) return error;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return Response.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const db = await database();
    const requestId = new ObjectId(id);
    const item = await db.collection('requests').findOne({ _id: requestId }, { projection: { ownerId: 1 } });
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    if (user.role === 'requester' && item.ownerId !== user.sub) return Response.json({ error: 'Not found' }, { status: 404 });
    const events = await db.collection('audit_events').find({ requestId }).sort({ at: -1 }).limit(100).toArray();
    return Response.json(events, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Database unavailable' }, { status: 503 }); }
}
