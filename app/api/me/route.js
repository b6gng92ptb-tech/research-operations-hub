import { requireIdentity } from '../../../lib/auth.js';
export const runtime = 'nodejs';
export async function GET(request) {
  const { user, error } = await requireIdentity(request);
  if (error) return error;
  return Response.json({ sub: user.sub, role: user.role }, { headers: { 'Cache-Control': 'no-store' } });
}
