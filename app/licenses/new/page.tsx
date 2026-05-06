'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function NewLicensePage() {
  const [email,     setEmail]     = useState('');
  const [note,      setNote]      = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<{ key: string } | null>(null);
  const [error,     setError]     = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, note, expiresAt: expiresAt || null }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.message || 'Gagal membuat license');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    if (result?.key) navigator.clipboard.writeText(result.key);
  }

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
          <Link href="/dashboard" className="nav-item"><span className="nav-icon">📊</span> Dashboard</Link>
          <Link href="/licenses" className="nav-item"><span className="nav-icon">🔑</span> Licenses</Link>
          <Link href="/licenses/new" className="nav-item active"><span className="nav-icon">➕</span> Buat License</Link>
        </nav>
        <div className="sidebar-footer">
          <form action="/api/auth/logout" method="POST">
            <button className="btn btn-ghost btn-sm" style={{ width:'100%' }}>🚪 Logout</button>
          </form>
        </div>
      </aside>

      <main className="main-content fade-in">
        <div className="page-header">
          <h1 className="page-title">➕ Buat <span>License Baru</span></h1>
          <p className="page-subtitle">Generate license key IKONA-NO_ untuk user</p>
        </div>

        <div style={{ maxWidth: '540px' }}>
          <div className="card">
            {error && <div className="alert alert-error">⚠ {error}</div>}

            {result ? (
              <div className="fade-in">
                <div className="alert alert-success">✅ License berhasil dibuat!</div>
                <div className="key-box">
                  <div className="key-value">{result.key}</div>
                  <div className="key-hint">Copy dan kirim ke user. Simpan baik-baik!</div>
                </div>
                <div style={{ display:'flex', gap:'12px', marginTop:'16px' }}>
                  <button className="btn btn-primary" onClick={copyKey}>📋 Copy Key</button>
                  <button className="btn btn-ghost" onClick={() => { setResult(null); setEmail(''); setNote(''); setExpiresAt(''); }}>
                    ➕ Buat Lagi
                  </button>
                  <Link href="/licenses" className="btn btn-ghost">📋 Lihat Semua</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Email Pembeli *</label>
                  <input
                    id="buyer-email"
                    className="form-input"
                    type="email"
                    placeholder="buyer@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <div className="form-hint">Email pembeli untuk keperluan identifikasi</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Kadaluarsa</label>
                  <input
                    id="expires-at"
                    className="form-input"
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <div className="form-hint">Kosongkan = tidak ada batas waktu (selamanya)</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan (Opsional)</label>
                  <input
                    id="note"
                    className="form-input"
                    type="text"
                    placeholder="e.g. Reseller A, Pembelian 1 bulan, dsb"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <hr className="divider" />

                <div className="card" style={{ background:'rgba(91,143,255,0.05)', marginBottom:'20px' }}>
                  <div className="flex-center gap-8 mb-16" style={{ fontWeight:600 }}>
                    <span>🔑</span> Preview Format Key
                  </div>
                  <div className="key-value" style={{ textAlign:'center', fontSize:'1rem' }}>
                    IKONA-NO_<span style={{ color:'var(--text-secondary)' }}>XXXXXXXXXXXXXXX</span>
                  </div>
                  <div className="key-hint" style={{ textAlign:'center', marginTop:'8px' }}>15 karakter random akan di-generate otomatis</div>
                </div>

                <button id="btn-create" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                  {loading ? '⏳ Generating...' : '⚡ Generate License Key'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
