'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/projects', icon: '📁', label: 'Projects' },
  { href: '/tasks', icon: '✓', label: 'My Tasks' },
];

const ADMIN_ITEMS = [
  { href: '/admin', icon: '⚙', label: 'Admin Panel' },
];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.0625rem' }}>TeamFlow</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.625rem', marginBottom: '0.5rem' }}>Navigation</div>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.25rem',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-hover)' : 'transparent',
              fontWeight: active ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.15s',
              borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
            }}>
              <span style={{ fontSize: '1.1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.625rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Admin</div>
            {ADMIN_ITEMS.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.25rem',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-hover)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  borderLeft: active ? '3px solid var(--purple)' : '3px solid transparent',
                }}>
                  <span style={{ fontSize: '1.1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)' }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}>{initials(user?.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" disabled={loggingOut} title="Logout" style={{ padding: '0.375rem', flexShrink: 0 }}>
            {loggingOut ? '…' : '→'}
          </button>
        </div>
      </div>
    </aside>
  );
}
