'use client';
import { useState, useEffect, useCallback } from 'react';

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const [tRes, uRes] = await Promise.all([
      fetch('/api/tasks?mine=true'),
      fetch('/api/auth/me'),
    ]);
    const [tData, uData] = await Promise.all([tRes.json(), uRes.json()]);
    setTasks(tData.tasks || []);
    setUser(uData.user);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (taskId, newStatus) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
  };

  const now = new Date();
  const filtered = filter === 'all' ? tasks : tasks.filter(t => {
    if (filter === 'overdue') return t.dueDate && new Date(t.dueDate) < now && t.status !== 'done';
    return t.status === filter;
  });

  if (loading) return (
    <div>
      <div className="skeleton" style={{ width: 200, height: 36, marginBottom: '2rem' }} />
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius)', marginBottom: '0.75rem' }} />)}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${tasks.length})` },
          { key: 'todo', label: `To Do (${tasks.filter(t => t.status === 'todo').length})` },
          { key: 'in-progress', label: `In Progress (${tasks.filter(t => t.status === 'in-progress').length})` },
          { key: 'done', label: `Done (${tasks.filter(t => t.status === 'done').length})` },
          { key: 'overdue', label: `Overdue (${tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">✓</div><h3>No tasks here</h3><p>Tasks matching this filter will appear here.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
            return (
              <div key={task._id} className="card" style={{ padding: '1.25rem', borderLeft: `3px solid ${task.project?.color || 'var(--accent)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{task.title}</div>
                    {task.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                      {task.project && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>📁 {task.project.name}</span>}
                      {task.dueDate && <span style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--red)' : 'var(--text-muted)' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                    <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)} style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
