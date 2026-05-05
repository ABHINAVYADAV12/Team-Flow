'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const COLUMNS = [
  { key: 'todo', label: 'To Do', dot: '#8b8fa8' },
  { key: 'in-progress', label: 'In Progress', dot: '#6366f1' },
  { key: 'done', label: 'Done', dot: '#10b981' },
];

function TaskModal({ task, project, user, users, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo?._id || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isNew = !task;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, data;
      if (isNew) {
        res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, projectId: project._id }),
        });
      } else {
        res = await fetch(`/api/tasks/${task._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onSave(data.task, isNew);
      onClose();
    } catch { setError('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    onDelete(task._id);
    onClose();
  };

  const canEdit = user?.role === 'admin' || task?.createdBy?._id === user?.id;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? '+ New Task' : 'Edit Task'}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isNew && user?.role === 'admin' && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            )}
            <button className="btn btn-ghost" onClick={onClose}>✕</button>
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="task-title" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required disabled={!canEdit && !isNew} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea rows={3} placeholder="Optional details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} disabled={!canEdit && !isNew} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="task-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} disabled={!canEdit && !isNew}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {user?.role === 'admin' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select id="task-assignee" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {(project.members || []).map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input id="task-due" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : isNew ? 'Create Task' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ project, onClose, onAdd }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => {
      const memberIds = project.members.map(m => m._id);
      setUsers((d.users || []).filter(u => !memberIds.includes(u._id)));
      setLoading(false);
    });
  }, [project.members]);

  const handleAdd = async (userId) => {
    setAdding(userId);
    const res = await fetch(`/api/projects/${project._id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok) { onAdd(data.project); onClose(); }
    setAdding(null);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading users…</p> : users.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>All users are already members.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)' }}>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}>{initials(u.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={`badge badge-${u.role}`}>{u.role}</span>
                <button className="btn btn-primary btn-sm" onClick={() => handleAdd(u._id)} disabled={adding === u._id}>{adding === u._id ? '…' : 'Add'}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const load = useCallback(async () => {
    const [pRes, uRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch('/api/auth/me'),
    ]);
    const [pData, uData] = await Promise.all([pRes.json(), uRes.json()]);
    setProject(pData.project);
    setTasks(pData.tasks || []);
    setUser(uData.user);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (task, isNew) => {
    if (isNew) setTasks(prev => [task, ...prev]);
    else setTasks(prev => prev.map(t => t._id === task._id ? task : t));
  };

  const handleDelete = (taskId) => setTasks(prev => prev.filter(t => t._id !== taskId));

  if (loading) return (
    <div>
      <div className="skeleton" style={{ width: 300, height: 40, marginBottom: '2rem' }} />
      <div className="kanban-board">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />)}</div>
    </div>
  );
  if (!project) return <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Project not found.</div>;

  const now = new Date();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <Link href="/projects" style={{ color: 'var(--accent)' }}>Projects</Link> / {project.name}
        </div>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: project.color }} />
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Members */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex' }}>
                {project.members?.slice(0, 4).map(m => (
                  <div key={m._id} className="avatar avatar-sm" title={m.name} style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', marginLeft: -6, border: '2px solid var(--bg-primary)' }}>{initials(m.name)}</div>
                ))}
              </div>
              {user?.role === 'admin' && (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(true)}>+ Member</button>
              )}
            </div>
            {user?.role === 'admin' && (
              <button id="add-task-btn" className="btn btn-primary btn-sm" onClick={() => setShowNewTask(true)}>+ Task</button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
                  {col.label}
                </div>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              {colTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No tasks</div>
              ) : (
                colTasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
                  return (
                    <div key={task._id} className="task-card" onClick={() => setSelectedTask(task)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div className="task-title" style={{ flex: 1 }}>{task.title}</div>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--green)', flexShrink: 0, marginTop: 4 }} />
                      </div>
                      {task.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>}
                      <div className="task-meta">
                        <div>
                          {isOverdue && <span className="badge badge-overdue" style={{ fontSize: '0.65rem' }}>Overdue</span>}
                          {task.dueDate && !isOverdue && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        {task.assignedTo ? (
                          <div className="task-assignee">
                            <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', width: 22, height: 22, fontSize: '0.6rem' }}>{initials(task.assignedTo.name)}</div>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unassigned</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showNewTask && (
        <TaskModal task={null} project={project} user={user} onClose={() => setShowNewTask(false)} onSave={handleSave} onDelete={handleDelete} />
      )}
      {selectedTask && (
        <TaskModal task={selectedTask} project={project} user={user} onClose={() => setSelectedTask(null)} onSave={handleSave} onDelete={handleDelete} />
      )}
      {showAddMember && (
        <AddMemberModal project={project} onClose={() => setShowAddMember(false)} onAdd={p => setProject(p)} />
      )}
    </div>
  );
}
