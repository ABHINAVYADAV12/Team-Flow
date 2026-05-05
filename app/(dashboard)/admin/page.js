'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [tab, setTab] = useState('users');

  const load = useCallback(async () => {
    const [uRes, pRes, meRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/projects'),
      fetch('/api/auth/me'),
    ]);
    const [uData, pData, meData] = await Promise.all([uRes.json(), pRes.json(), meRes.json()]);
    if (meData.user?.role !== 'admin') { router.push('/dashboard'); return; }
    setUsers(uData.users || []);
    setProjects(pData.projects || []);
    setCurrentUser(meData.user);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (res.ok) setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
    setUpdatingRole(null);
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading admin panel…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙ Admin Panel</h1>
          <p className="page-subtitle">Manage users, roles and projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>👥</div>
          <div className="stat-info"><div className="stat-value" style={{ color: '#6366f1' }}>{users.length}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>🛡</div>
          <div className="stat-info"><div className="stat-value" style={{ color: '#a855f7' }}>{users.filter(u => u.role === 'admin').length}</div><div className="stat-label">Admins</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>📁</div>
          <div className="stat-info"><div className="stat-value" style={{ color: '#22d3ee' }}>{projects.length}</div><div className="stat-label">Projects</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ key: 'users', label: '👥 Users' }, { key: 'projects', label: '📁 Projects' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}>{t.label}</button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}>{initials(u.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        {u._id === currentUser?.id && <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u._id !== currentUser?.id ? (
                      <button
                        id={`role-btn-${u._id}`}
                        className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => changeRole(u._id, u.role === 'admin' ? 'member' : 'admin')}
                        disabled={updatingRole === u._id}
                      >
                        {updatingRole === u._id ? '…' : u.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Projects Tab */}
      {tab === 'projects' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.owner?.name}</td>
                  <td><span style={{ color: 'var(--text-secondary)' }}>{p.members?.length || 0}</span></td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button id={`del-proj-${p._id}`} className="btn btn-danger btn-sm" onClick={() => deleteProject(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
