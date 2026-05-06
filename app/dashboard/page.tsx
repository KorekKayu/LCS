import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getStats } from '@/lib/license';

export const dynamic = 'force-dynamic';

async function LogoutBtn() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button className="btn btn-ghost btn-sm" type="submit">🚪 Logout</button>
    </form>
  );
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/login');

  let stats = { total: 0, active: 0, revoked: 0, expired: 0, bound: 0 };
  try { stats = await getStats(); } catch {}

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">
            <div className="logo-icon">⚡</div>
            <div>
              <div>IKONA</div>
              <div className="logo-sub">License Panel</div>
            </div>
          </div>
        </div>
        <nav className="nav">
          <Link href="/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span> Dashboard
          </Link>
          <Link href="/licenses" className="nav-item">
            <span className="nav-icon">🔑</span> Licenses
          </Link>
          <Link href="/licenses/new" className="nav-item">
            <span className="nav-icon">➕</span> Buat License
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">Logged in as</div>
          <div className="sidebar-email">{session.email}</div>
          <div style={{ marginTop: '12px' }}>
            <form action="/api/auth/logout" method="POST">
              <button className="btn btn-ghost btn-sm" style={{ width:'100%' }}>🚪 Logout</button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content fade-in">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">Dashboard <span>Overview</span></h1>
            <p className="page-subtitle">Statistik license IKONA ONI Bot</p>
          </div>
          <Link href="/licenses/new" className="btn btn-primary">
            ➕ Buat License Baru
          </Link>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total License</div>
            <div className="stat-value blue">{stats.total}</div>
            <div className="stat-glow" style={{ background: 'var(--blue)' }} />
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-value green">{stats.active}</div>
            <div className="stat-glow" style={{ background: 'var(--green)' }} />
          </div>
          <div className="stat-card">
            <div className="stat-label">Revoked</div>
            <div className="stat-value red">{stats.revoked}</div>
            <div className="stat-glow" style={{ background: 'var(--red)' }} />
          </div>
          <div className="stat-card">
            <div className="stat-label">Expired</div>
            <div className="stat-value yellow">{stats.expired}</div>
            <div className="stat-glow" style={{ background: 'var(--yellow)' }} />
          </div>
          <div className="stat-card">
            <div className="stat-label">Terikat HWID</div>
            <div className="stat-value purple">{stats.bound}</div>
            <div className="stat-glow" style={{ background: 'var(--purple)' }} />
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h2 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'16px' }}>🔑 Format License Key</h2>
            <div className="key-box">
              <div className="key-value">IKONA-NO_XXXXXXXXXXXXXXX</div>
              <div className="key-hint">Prefix tetap + 15 karakter random (A-Z0-9)</div>
            </div>
            <p className="text-muted text-sm">1 license hanya bisa digunakan di 1 hardware (HWID-locked). Tidak bisa dipindah setelah terikat.</p>
          </div>
          <div className="card">
            <h2 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'16px' }}>🛡 Keamanan Sistem</h2>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                ['✅','HWID Fingerprint Lock (1 bot / 1 hardware)'],
                ['✅','HMAC-SHA256 Response Signing'],
                ['✅','Anti-Debug Protection'],
                ['✅','Local cache encrypted (1 jam grace)'],
                ['✅','Code Obfuscation (RC4 + Control Flow)'],
              ].map(([icon,text]) => (
                <li key={text as string} className="flex flex-center gap-8 text-sm">
                  <span>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
