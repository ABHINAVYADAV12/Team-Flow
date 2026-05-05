import { getAuthUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Project from '@/models/Project';
import Link from 'next/link';

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function priorityColor(p) {
  if (p === 'high') return 'var(--red)';
  if (p === 'medium') return 'var(--amber)';
  return 'var(--green)';
}

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  await dbConnect();

  const userProjects = await Project.find({ members: authUser.id }).lean();
  const projectIds = userProjects.map(p => p._id);

  const allTasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignedTo', 'name')
    .populate('project', 'name color')
    .lean();

  const myTasks = allTasks.filter(t => t.assignedTo?._id?.toString() === authUser.id);
  const now = new Date();
  const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
  const inProgress = allTasks.filter(t => t.status === 'in-progress');
  const done = allTasks.filter(t => t.status === 'done');

  const recentProjects = userProjects.slice(0, 4);

  const stats = [
    { icon: '📋', label: 'Total Tasks', value: allTasks.length, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: '🔄', label: 'In Progress', value: inProgress.length, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
    { icon: '✅', label: 'Completed', value: done.length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: '⚠️', label: 'Overdue', value: overdueTasks.length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {authUser.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects today.</p>
        </div>
        <Link href="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Projects */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>📁 Recent Projects</h2>
            <Link href="/projects" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Projects you're part of will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentProjects.map(p => (
                <Link key={p._id} href={`/projects/${p._id}`}>
                  <div className="card" style={{ padding: '1rem', cursor: 'pointer', borderLeft: `3px solid ${p.color || '#6366f1'}` }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || 'No description'}</div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.members?.length || 0} members</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>✓ My Tasks</h2>
            <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600 }}>View all →</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">✓</div>
              <h3>No tasks assigned</h3>
              <p>Tasks assigned to you will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myTasks.slice(0, 5).map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
                return (
                  <div key={task._id} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{task.title}</div>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor(task.priority), flexShrink: 0, marginTop: 4 }} />
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                      {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                      {task.project && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.project.name}</span>}
                    </div>
                    {task.dueDate && (
                      <div style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--red)' : 'var(--text-muted)', marginTop: '0.375rem' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Tasks Banner */}
      {overdueTasks.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {overdueTasks.slice(0, 3).map(t => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--red)' }}>•</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.project?.name}</span>
                <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>Due {new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
