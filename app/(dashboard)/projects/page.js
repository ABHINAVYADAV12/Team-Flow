'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#f97316'];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onCreated(data.project);
      onClose();
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📁 New Project</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input id="proj-name" placeholder="My Awesome Project" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea placeholder="What is this project about?" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', transition: 'all 0.15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="create-proj-btn" type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, uRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/auth/me'),
    ]);
    const [pData, uData] = await Promise.all([pRes.json(), uRes.json()]);
    setProjects(pData.projects || []);
    setUser(uData.user);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return (
    <div>
      <div className="page-header"><div className="skeleton" style={{ width: 200, height: 36 }} /></div>
      <div className="grid-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you&apos;re part of</p>
        </div>
        {user?.role === 'admin' && (
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem' }}>
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>{user?.role === 'admin' ? 'Create your first project to get started.' : 'An admin needs to add you to a project.'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(project => (
            <div key={project._id} className="project-card" style={{ '--project-color': project.color }} onClick={() => router.push(`/projects/${project._id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 className="project-name">{project.name}</h3>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
              </div>
              <p className="project-desc">{project.description || 'No description provided.'}</p>
              <div className="project-footer">
                <div className="project-members">
                  {project.members?.slice(0, 4).map(m => (
                    <div key={m._id} className="avatar avatar-sm" title={m.name} style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}>{initials(m.name)}</div>
                  ))}
                  {project.members?.length > 4 && <div className="avatar avatar-sm" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>+{project.members.length - 4}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{project.members?.length} members</span>
                  {user?.role === 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(project._id); }} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
}
