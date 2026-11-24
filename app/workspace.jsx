'use client';

import { useEffect, useMemo, useState } from 'react';
import { applyDemoTransition, createDemoRequest } from '../lib/demo-workflow.mjs';
import { emptyRequestDraft, hasUnsavedRequestDraft, validateRequestDraft } from '../lib/form-state.mjs';
import { liveModeEnabled } from '../lib/security.mjs';
import { filterVisibleRequests, summarizeRequests } from '../lib/workspace-policy.mjs';

const allowLive = liveModeEnabled(process.env.NEXT_PUBLIC_ENABLE_LIVE_MODE);
const seed = [
  { _id: 'demo-1', title: 'Climate data access request', description: 'Access to a synthetic observational dataset', category: 'research', priority: 'high', status: 'in_review', ownerId: 'demo-user', version: 2 },
  { _id: 'demo-2', title: 'Compute resource allocation', description: 'Request a scheduled computational job', category: 'infrastructure', priority: 'medium', status: 'submitted', ownerId: 'demo-user', version: 1 },
  { _id: 'demo-3', title: 'Research equipment purchase', description: 'Equipment approval for a demonstration project', category: 'procurement', priority: 'low', status: 'approved', ownerId: 'demo-user', version: 3 },
];

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function ErrorNotice({ children, onReload }) {
  if (!children) return null;
  return (
    <div className="notice" role="alert">
      <span>{children}</span>
      {onReload && <button className="text-button" type="button" onClick={onReload}>Reload requests</button>}
    </div>
  );
}

export default function Workspace() {
  const [rows, setRows] = useState(seed);
  const [demoRole, setDemoRole] = useState('requester');
  const [token, setToken] = useState('');
  const [live, setLive] = useState(false);
  const [role, setRole] = useState('requester');
  const [profileSub, setProfileSub] = useState('');
  const [audit, setAudit] = useState(null);
  const [demoEvents, setDemoEvents] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingRequest, setPendingRequest] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...emptyRequestDraft });
  const [showValidation, setShowValidation] = useState(false);

  const formDirty = hasUnsavedRequestDraft(form);
  const validation = useMemo(() => validateRequestDraft(form), [form]);
  const visible = useMemo(() => filterVisibleRequests(rows, {
    live, role, demoRole, profileSub, search,
  }), [rows, live, role, demoRole, profileSub, search]);
  const counts = useMemo(() => summarizeRequests(visible), [visible]);

  useEffect(() => {
    if (!formDirty) return undefined;
    const warnBeforeLeave = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [formDirty]);

  async function reloadRequests() {
    if (!live) return;
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20' });
      if (token) {
        const data = await readJson(await fetch(`/api/requests?${params}`, {
          headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
        }));
        if (!Array.isArray(data.items)) throw new Error('The server returned an unexpected request list.');
        setRows(data.items);
      }
    } catch (cause) {
      setError(cause.message || 'Could not reload requests.');
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20' });
      const headers = { Authorization: `Bearer ${token}` };
      const data = await readJson(await fetch(`/api/requests?${params}`, { headers, cache: 'no-store' }));
      const profile = await readJson(await fetch('/api/me', { headers, cache: 'no-store' }));
      if (!Array.isArray(data.items) || typeof profile.sub !== 'string' || typeof profile.role !== 'string') {
        throw new Error('The server returned an unexpected response.');
      }
      setRows(data.items);
      setRole(profile.role);
      setProfileSub(profile.sub);
      setAudit(null);
      setLive(true);
    } catch (cause) {
      setError(cause.message || 'Could not connect to the workspace.');
      setLive(false);
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    setLive(false);
    setRows(seed);
    setToken('');
    setProfileSub('');
    setAudit(null);
    setDemoEvents([]);
    setRole('requester');
    setError('');
  }

  async function createRequest(event) {
    event.preventDefault();
    setShowValidation(true);
    setError('');
    if (!validation.success) {
      setError('Review the highlighted fields before creating the request.');
      return;
    }

    if (!live) {
      const result = createDemoRequest(rows, demoEvents, validation.data, { id: `demo-${crypto.randomUUID()}` });
      if (!result.ok) {
        setError('The request could not be created in the demonstration.');
        return;
      }
      setRows(result.rows);
      setDemoEvents(result.events);
      setForm({ ...emptyRequestDraft });
      setShowValidation(false);
      return;
    }

    setBusy(true);
    try {
      const data = await readJson(await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(validation.data),
      }));
      setRows((current) => [data, ...current]);
      setForm({ ...emptyRequestDraft });
      setShowValidation(false);
    } catch (cause) {
      setError(cause.message || 'The request could not be created.');
    } finally {
      setBusy(false);
    }
  }

  function discardDraft() {
    if (formDirty && !window.confirm('Discard the unsaved request draft?')) return;
    setForm({ ...emptyRequestDraft });
    setShowValidation(false);
    setError('');
  }

  async function showAudit(request) {
    setError('');
    if (!live) {
      setAudit({ title: request.title, events: demoEvents.filter((event) => event.requestId === request._id) });
      return;
    }
    try {
      const events = await readJson(await fetch(`/api/requests/${request._id}/audit`, {
        headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
      }));
      if (!Array.isArray(events)) throw new Error('The server returned an unexpected audit history.');
      setAudit({ title: request.title, events });
    } catch (cause) {
      setError(cause.message || 'Audit history is unavailable.');
    }
  }

  async function transition(request, status) {
    setError('');
    if (!live) {
      const result = applyDemoTransition(rows, demoEvents, { id: request._id, to: status, role: demoRole });
      if (!result.ok) {
        setError('This role cannot perform the selected action.');
        return;
      }
      setRows(result.rows);
      setDemoEvents(result.events);
      return;
    }

    setPendingRequest(request._id);
    try {
      const data = await readJson(await fetch(`/api/requests/${request._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ version: request.version, status }),
      }));
      setRows((current) => current.map((row) => row._id === request._id ? data : row));
    } catch (cause) {
      setError(cause.status === 409
        ? 'This request changed since it was loaded. Reload the list before trying again.'
        : cause.message || 'The workflow update failed.');
    } finally {
      setPendingRequest('');
    }
  }

  const showCreateForm = live ? role !== 'reviewer' : demoRole !== 'reviewer';

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Research Operations Hub home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>RESEARCH OPERATIONS <span className="brand-muted">/ HUB</span></span>
        </a>
        <div className="header-meta">
          <span className="pill">Independent portfolio prototype</span>
          <span className={`connection-state ${live ? 'is-live' : ''}`}><span aria-hidden="true" />{live ? `Connected · ${role}` : 'Synthetic demo'}</span>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">REQUEST LIFECYCLE · AUDITABLE BY DESIGN</p>
            <h1>Research workflows,<br />without the friction.</h1>
            <p className="hero-description">A focused workspace for intake, review and traceable decisions.</p>
            <div className="capability-list" aria-label="Application capabilities">
              <span>Role-aware workflow</span><span>Versioned updates</span><span>Audit history</span>
            </div>
          </div>
          <aside className="mode-card" aria-label="Workspace mode">
            <div className="mode-icon" aria-hidden="true">{live ? '✓' : '◈'}</div>
            <div>
              <strong>{live ? 'Live API workspace' : 'Interactive showcase'}</strong>
              <p>{live ? 'Server-side authentication and authorization are active.' : 'Fictional records and in-memory changes; nothing is sent to a server.'}</p>
            </div>
            {!live && (
              <label className="role-picker">Explore permissions
                <select id="demo-role" value={demoRole} onChange={(event) => setDemoRole(event.target.value)} aria-label="Choose a demonstration role">
                  <option value="requester">Requester</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
            )}
            {allowLive && (
              <div className="live-controls">
                {!live && <label htmlFor="oidc-token">OIDC access token</label>}
                {!live && <input id="oidc-token" type="password" autoComplete="off" placeholder="Paste a test access token" value={token} onChange={(event) => setToken(event.target.value)} />}
                <div className="actions">
                  {!live
                    ? <button className="button-primary" type="button" disabled={busy || !token} onClick={connect}>{busy ? 'Connecting…' : 'Connect to API'}</button>
                    : <button className="button-secondary" type="button" onClick={disconnect}>Disconnect</button>}
                </div>
                {!live && <p className="field-note">Live mode requires a configured OIDC provider and MongoDB. Do not use a personal production token.</p>}
              </div>
            )}
          </aside>
        </section>

        <section className="metrics-grid" aria-label="Request summary">
          <article className="metric-card"><span>Total requests</span><strong>{counts.total}</strong><small>Visible in this workspace</small></article>
          <article className="metric-card"><span>Active workflow</span><strong>{counts.open}</strong><small>Awaiting a decision</small></article>
          <article className="metric-card"><span>Approved</span><strong>{counts.approved}</strong><small>Completed requests</small></article>
        </section>

        <ErrorNotice onReload={error.includes('Reload the list') ? reloadRequests : null}>{error}</ErrorNotice>

        <div className={`workspace-grid ${showCreateForm ? '' : 'reviewer-layout'}`}>
          {showCreateForm && (
            <section className="surface request-form-surface" aria-labelledby="new-request-heading">
              <div className="section-heading">
                <div><p className="eyebrow">INTAKE</p><h2 id="new-request-heading">New request</h2></div>
                {formDirty && <span className="draft-state"><span aria-hidden="true" /> Unsaved draft</span>}
              </div>
              <p className="section-description">Provide enough detail for the right person to review it.</p>
              <form onSubmit={createRequest} noValidate>
                <div className="field-group">
                  <label htmlFor="title">Request title</label>
                  <input id="title" name="title" required minLength={5} maxLength={140} value={form.title}
                    aria-invalid={showValidation && Boolean(validation.fieldErrors.title)} aria-describedby={showValidation && validation.fieldErrors.title ? 'title-error' : undefined}
                    onChange={(event) => setForm({ ...form, title: event.target.value })} />
                  {showValidation && validation.fieldErrors.title && <span id="title-error" className="field-error">{validation.fieldErrors.title}</span>}
                  <span className="field-hint">5–140 characters</span>
                </div>
                <div className="field-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" required minLength={10} maxLength={3000} rows={4} value={form.description}
                    aria-invalid={showValidation && Boolean(validation.fieldErrors.description)} aria-describedby={showValidation && validation.fieldErrors.description ? 'description-error' : undefined}
                    onChange={(event) => setForm({ ...form, description: event.target.value })} />
                  {showValidation && validation.fieldErrors.description && <span id="description-error" className="field-error">{validation.fieldErrors.description}</span>}
                  <span className="field-hint">10–3,000 characters</span>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                      <option value="research">Research</option><option value="data">Data</option><option value="infrastructure">Infrastructure</option><option value="procurement">Procurement</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="priority">Priority</label>
                    <select id="priority" name="priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create request'}</button>
                  {formDirty && <button className="button-secondary" type="button" disabled={busy} onClick={discardDraft}>Discard draft</button>}
                </div>
                <p className="privacy-note">{live ? 'The API validates this request again before saving it.' : 'This demonstration stores changes only in this page and resets when reloaded.'}</p>
              </form>
            </section>
          )}

          <section className="surface request-list-surface" aria-labelledby="pipeline-heading">
            <div className="section-heading pipeline-heading">
              <div><p className="eyebrow">WORK QUEUE</p><h2 id="pipeline-heading">Request pipeline</h2></div>
              <span className={`mode-tag ${live ? 'mode-tag-live' : ''}`}>{live ? 'LIVE DATA' : 'SYNTHETIC DATA'}</span>
            </div>
            <p className="section-description">Search requests and follow their review history.</p>
            <label className="search-field" htmlFor="request-search"><span aria-hidden="true">⌕</span><input id="request-search" type="search" placeholder="Search by title, category or status" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <div className="table-scroll" role="region" aria-label="Requests. Scroll horizontally to see all columns." tabIndex="0">
              <table>
                <thead><tr><th scope="col">Request</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
                <tbody>
                  {visible.map((request) => (
                    <tr key={request._id}>
                      <td><strong>{request.title}</strong><span className="table-subtitle">{request.category}</span></td>
                      <td><span className={`priority priority-${request.priority}`}>{request.priority}</span></td>
                      <td><span className={`status status-${request.status}`}>{request.status.replace('_', ' ')}</span></td>
                      <td><div className="table-actions">
                        <button className="button-quiet" type="button" onClick={() => showAudit(request)}>History</button>
                        {request.status === 'draft' && (live
                          ? role === 'admin' || (role === 'requester' && request.ownerId === profileSub)
                          : demoRole === 'admin' || (demoRole === 'requester' && request.ownerId === 'demo-user'))
                          ? <button className="button-quiet" type="button" disabled={pendingRequest === request._id} onClick={() => transition(request, 'submitted')}>Submit</button>
                          : request.status === 'submitted' && (live ? role === 'admin' || role === 'reviewer' : demoRole === 'admin' || demoRole === 'reviewer')
                            ? <button className="button-quiet" type="button" disabled={pendingRequest === request._id} onClick={() => transition(request, 'in_review')}>Review</button>
                            : request.status === 'in_review' && (live ? role === 'admin' || role === 'reviewer' : demoRole === 'admin' || demoRole === 'reviewer')
                              ? <><button className="button-quiet" type="button" disabled={pendingRequest === request._id} onClick={() => transition(request, 'approved')}>Approve</button><button className="button-quiet button-danger" type="button" disabled={pendingRequest === request._id} onClick={() => transition(request, 'rejected')}>Reject</button></>
                              : null}
                      </div></td>
                    </tr>
                  ))}
                  {!visible.length && <tr><td className="empty-state" colSpan="4">No requests match this search.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="table-footnote">Showing {visible.length} {visible.length === 1 ? 'request' : 'requests'}{live && rows.length === 20 ? ' · first page' : ''}</p>
          </section>
        </div>

        {audit && (
          <section className="surface audit-surface" aria-labelledby="audit-heading">
            <div className="section-heading"><div><p className="eyebrow">TRACEABILITY</p><h2 id="audit-heading">History · {audit.title}</h2></div><button className="button-secondary" type="button" onClick={() => setAudit(null)}>Close history</button></div>
            {audit.events.length
              ? <ol className="audit-list">{audit.events.map((event) => <li key={event._id}><span className="audit-dot" aria-hidden="true" /><div><strong>{event.from || 'Created'} <span aria-hidden="true">→</span> {event.to}</strong><span className="audit-meta">{event.actor} · {new Date(event.at).toLocaleString()}</span></div></li>)}</ol>
              : <p className="empty-state">No workflow transitions have been recorded for this request.</p>}
          </section>
        )}

        <footer className="page-footer">
          <span>Independent portfolio prototype · fictional data</span>
          <span>Demo roles are simulated; server permissions are independently enforced in live mode.</span>
        </footer>
      </main>
    </>
  );
}
