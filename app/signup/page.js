'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #a855f7)', marginBottom: '1rem', fontSize: '1.5rem' }}>⚡</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f0f2ff, #8b8fa8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TeamFlow</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="name" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="signup-password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select id="role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>The first registered user is automatically promoted to Admin.</p>
            </div>
            <button id="signup-btn" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
