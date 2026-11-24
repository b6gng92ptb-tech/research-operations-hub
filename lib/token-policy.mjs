/** Pure access-token policy; the cryptographic signature is checked separately by jose. */
export function tokenIdentity(payload, audience) {
  if (!payload || typeof payload.sub !== 'string' || !payload.sub.trim()) return null;
  if (payload.token_use !== undefined && payload.token_use !== 'access') return null;
  if (payload.token_use === 'access') {
    if (payload.client_id !== audience) return null;
  } else if (payload.aud !== audience && !(Array.isArray(payload.aud) && payload.aud.includes(audience))) return null;
  const groups = Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'] : [];
  const role = groups.includes('admin') ? 'admin' : groups.includes('reviewer') ? 'reviewer' : 'requester';
  return { sub: payload.sub, role };
}
