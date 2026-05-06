# 🚀 Deploy IKONA Panel ke Vercel

## Langkah 1 — Install dependencies

```bash
cd license-panel
npm install
```

## Langkah 2 — Push ke GitHub

1. Buat repo baru di GitHub (private)
2. Upload folder `license-panel/` ke repo tersebut

## Langkah 3 — Deploy ke Vercel

1. Buka https://vercel.com → **New Project**
2. Import repo GitHub yang baru dibuat
3. Vercel akan otomatis detect Next.js

## Langkah 4 — Tambahkan Vercel KV (Database)

1. Di dashboard Vercel project → tab **Storage**
2. Klik **Create Database** → pilih **KV**
3. Connect ke project → env vars akan auto-terisi

## Langkah 5 — Set Environment Variables

Di Vercel project → **Settings** → **Environment Variables**, tambahkan:

| Variable | Value |
|---|---|
| `ADMIN_EMAIL` | email login admin (contoh: admin@ikona.com) |
| `ADMIN_PASSWORD` | password admin (buat yang kuat!) |
| `JWT_SECRET` | random string panjang (min 32 char) |
| `HMAC_SECRET` | **HARUS SAMA** dengan yang di `src/license.js` |
| `NEXT_PUBLIC_BASE_URL` | URL panel Anda (contoh: https://ikona-panel.vercel.app) |

## Langkah 6 — Update URL di Bot

Edit `src/license.js` baris:
```js
const PANEL_HOST = 'ikona-panel.vercel.app';  // ganti dengan URL Anda
```

Dan pastikan `HMAC_SECRET` di `src/license.js` **sama persis** dengan env var `HMAC_SECRET` di Vercel.

## Langkah 7 — Redeploy & Test

1. Redeploy di Vercel
2. Buka `https://your-panel.vercel.app/login`
3. Login dengan email & password yang sudah di-set
4. Buat license baru, copy key-nya
5. Paste ke `license.key` di folder bot
6. Jalankan `npm start` → bot akan verify license dulu

---

## Build Bot untuk Distribusi

```bash
cd "ChatGPT Ikona"
node build.js
```

Folder `dist/` berisi bot yang sudah ter-obfuscate. **Hanya bagikan `dist/`** — JANGAN bagikan `src/`.

---

## Keamanan Tambahan

- Ganti `HMAC_SECRET` dengan string unik Anda sendiri (bukan default!)
- Gunakan password admin yang kuat
- Setelah deploy, test di 2 PC berbeda untuk verifikasi HWID lock berfungsi

---

## Reset HWID User

Jika user ganti hardware, reset HWID via API:
```
POST /api/admin/licenses/{key}
Body: { "_action": "reset_hwid" }
```
Atau tambahkan tombol di panel (fitur sudah tersedia di API).
