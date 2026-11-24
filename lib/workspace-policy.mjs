export function filterVisibleRequests(rows, { live, role, demoRole, profileSub, search }) {
  const activeRole = live ? role : demoRole;
  const query = search.trim().toLocaleLowerCase();

  return rows.filter((request) => {
    const canView = activeRole !== 'requester' || (live
      ? request.ownerId === profileSub
      : request.ownerId === 'demo-user');
    if (!canView) return false;
    if (!query) return true;
    return [request.title, request.category, request.status]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query);
  });
}

export function summarizeRequests(rows) {
  return {
    total: rows.length,
    open: rows.filter(({ status }) => !['approved', 'rejected'].includes(status)).length,
    approved: rows.filter(({ status }) => status === 'approved').length,
  };
}
