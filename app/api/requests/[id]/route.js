import { readJsonBody } from '../../../../lib/http.mjs';
import { ObjectId } from 'mongodb';
import { database, mongoClient } from '../../../../lib/mongo.js';
import { allowedStatuses } from '../../../../lib/validation.mjs';
import { authorizeTransition } from '../../../../lib/workflow.mjs';
import { requireIdentity } from '../../../../lib/auth.js';

export const runtime = 'nodejs';

export async function PATCH(req, { params }) {
  const { user, error } = await requireIdentity(req);
  if (error) return error;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return Response.json({ error: 'Invalid id' }, { status: 400 });
  const bodyResult = await readJsonBody(req);
  if (!bodyResult.ok) return Response.json({ error: bodyResult.error }, { status: bodyResult.status });
  const body = bodyResult.data;
  if (Object.keys(body).some(key => !['version','status'].includes(key)) || !Number.isSafeInteger(body.version) || body.version < 1 || !allowedStatuses.includes(body.status)) {
    return Response.json({ error: 'Invalid update' }, { status: 400 });
  }

  let session;
  try {
    session = (await mongoClient()).startSession();
    const db = await database();
    const requests = db.collection('requests');
    const _id = new ObjectId(id);
    let updated;
    await session.withTransaction(async () => {
      const current = await requests.findOne({ _id }, { session });
      if (!current) throw new DomainError('Not found', 404);
      if (current.version !== body.version) throw new DomainError('Version conflict', 409);
      const permission = authorizeTransition({ role: user.role, ownerId: current.ownerId, actorId: user.sub, from: current.status, to: body.status });
      if (!permission.ok) throw new DomainError(permission.reason === 'forbidden' ? 'Forbidden' : 'Invalid transition', permission.reason === 'forbidden' ? 403 : 422);
      const at = new Date();
      const result = await requests.updateOne(
        { _id, version: body.version, status: current.status },
        { $set: { status: body.status, updatedAt: at }, $inc: { version: 1 } },
        { session }
      );
      if (result.modifiedCount !== 1) throw new DomainError('Version conflict', 409);
      await db.collection('audit_events').insertOne(
        { requestId: _id, actor: user.sub, from: current.status, to: body.status, at, version: body.version + 1 },
        { session }
      );
      updated = await requests.findOne({ _id }, { session });
    });
    return Response.json(updated, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof DomainError) return Response.json({ error: err.message }, { status: err.status });
    // MongoDB transactions require a replica set or sharded cluster.
    console.error('Transactional request update failed', err);
    return Response.json({ error: 'Database transaction unavailable' }, { status: 503 });
  } finally {
    if (session) await session.endSession();
  }
}

class DomainError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
