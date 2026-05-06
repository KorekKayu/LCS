import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listLicenses, type LicenseData } from '@/lib/license';

export const dynamic = 'force-dynamic';

function StatusBadge({ lic }: { lic: LicenseData }) {
  const now = new Date();
  if (lic.status === 'revoked')
    return <span className="badge revoked"><span className="badge-dot" />Revoked</span>;
  if (lic.expiresAt && new Date(lic.expiresAt) <= now)
    return <span className="badge expired"><span className="badge-dot" />Expired</span>;
  return <span className="badge active"><span className="badge-dot" />Active</span>;
}

export default async function LicensesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let licenses: LicenseData[] = [];
  try { licenses = await listLicenses(); } catch {}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">
            <div className="logo-icon">⚡</div>
            <div><div>IKONA</div><div className="logo-sub">License Panel</div></div>
          </div>
        </div>
        <nav className="nav">
          <Link href="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span> Dashboard
          </Link>
          <Link href="/licenses" className="nav-item active">
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

      <main className="main-content fade-in">
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">🔑 <span>License Keys</span></h1>
            <p className="page-subtitle">{licenses.length} license terdaftar</p>
          </div>
          <Link href="/licenses/new" className="btn btn-primary">➕ Buat License</Link>
        </div>

        {licenses.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🔑</div>
            <p>Belum ada license. Buat license pertama!</p>
            <br />
            <Link href="/licenses/new" className="btn btn-primary">➕ Buat License</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th>HWID</th>
                  <th>Expires</th>
                  <th>Note</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(lic => (
                  <tr key={lic.key}>
                    <td><span className="mono">{lic.key}</span></td>
                    <td><StatusBadge lic={lic} /></td>
                    <td><span className="text-sm">{lic.email || '—'}</span></td>
                    <td>
                      {lic.hwid
                        ? <span className="mono text-sm" style={{ color:'var(--green)' }}>●&nbsp;{lic.hwid.substring(0,12)}…</span>
                        : <span className="text-muted text-sm">belum terikat</span>
                      }
                    </td>
                    <td className="text-sm">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString('id-ID') : '∞ Selamanya'}</td>
                    <td className="text-sm text-muted">{lic.note || '—'}</td>
                    <td className="text-sm text-muted">{new Date(lic.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>
                      <form action={`/api/admin/licenses/${encodeURIComponent(lic.key)}`} method="POST" style={{ display:'inline' }}>
                        <input type="hidden" name="_action" value={lic.status === 'revoked' ? 'activate' : 'revoke'} />
                        <button
                          className={`btn btn-sm ${lic.status === 'revoked' ? 'btn-ghost' : 'btn-danger'}`}
                          title={lic.status === 'revoked' ? 'Aktifkan kembali' : 'Revoke license'}
                        >
                          {lic.status === 'revoked' ? '✅ Aktifkan' : '🚫 Revoke'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
