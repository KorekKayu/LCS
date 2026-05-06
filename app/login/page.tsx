'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Email atau password salah');
      }
    } catch {
      setError('Gagal konek ke server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card fade-in">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <div className="login-title">IKONA Panel</div>
          <div className="login-sub">License Management System</div>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="login-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email Admin</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="admin@ikona.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required autoFocus autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            className="btn-login"
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span className="text-muted text-sm">IKONA ONI © 2025 — Secured Panel</span>
        </div>
      </div>
    </div>
  );
}
