/** Strict, bounded pagination. Reject ambiguous or malformed inputs. */
export function parsePage(searchParams) {
  const raw = searchParams.get('page') ?? '1';
  const sizeRaw = searchParams.get('pageSize') ?? '20';
  if (!/^[1-9]\d*$/.test(raw) || !/^[1-9]\d*$/.test(sizeRaw)) throw new Error('Invalid pagination');
  const page = Number(raw), pageSize = Number(sizeRaw);
  if (!Number.isSafeInteger(page) || page > 10000 || !Number.isSafeInteger(pageSize) || pageSize > 100) throw new Error('Invalid pagination');
  return { page, pageSize, skip: (page - 1) * pageSize };
}
export function requestFilter(role, sub, status) {
  const filter = role === 'requester' ? { ownerId: sub } : {};
  if (status !== null) {
    if (!['draft','submitted','in_review','approved','rejected'].includes(status)) throw new Error('Invalid status');
    filter.status = status;
  }
  return filter;
}
