import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface LicenseData {
  key: string;
  hwid: string | null;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string | null;
  createdAt: string;
  note: string;
  email: string;
}

const PREFIX = 'license:';
const INDEX  = 'license_index'; // ZSET: key → createdAt timestamp

// ── Generate ───────────────────────────────────────────────────────────────
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  const bytes = crypto.randomBytes(15);
  for (let i = 0; i < 15; i++) suffix += chars[bytes[i] % chars.length];
  return `IKONA-NO_${suffix}`;
}

// ── CRUD ────────────────────────────────────────────────────────────────────
export async function createLicense(opts: {
  note?: string; email?: string; expiresAt?: string | null;
}): Promise<LicenseData> {
  const key = generateLicenseKey();
  const data: LicenseData = {
    key,
    hwid: null,
    status: 'active',
    expiresAt: opts.expiresAt || null,
    createdAt: new Date().toISOString(),
    note: opts.note || '',
    email: opts.email || '',
  };
  await kv.set(PREFIX + key, data);
  await kv.zadd(INDEX, { score: Date.now(), member: key });
  return data;
}

export async function getLicense(key: string): Promise<LicenseData | null> {
  return await kv.get<LicenseData>(PREFIX + key);
}

export async function updateLicense(key: string, patch: Partial<LicenseData>) {
  const existing = await getLicense(key);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await kv.set(PREFIX + key, updated);
  return updated;
}

export async function revokeLicense(key: string) {
  return updateLicense(key, { status: 'revoked', hwid: null });
}

export async function deleteLicense(key: string) {
  await kv.del(PREFIX + key);
  await kv.zrem(INDEX, key);
}

export async function listLicenses(): Promise<LicenseData[]> {
  const keys = await kv.zrange(INDEX, 0, -1, { rev: true }) as string[];
  if (!keys.length) return [];
  const results = await Promise.all(keys.map(k => getLicense(k)));
  return results.filter(Boolean) as LicenseData[];
}

export async function getStats() {
  const all = await listLicenses();
  const now = new Date();
  const active  = all.filter(l => l.status === 'active' && (!l.expiresAt || new Date(l.expiresAt) > now)).length;
  const revoked = all.filter(l => l.status === 'revoked').length;
  const expired = all.filter(l => l.status === 'active' && l.expiresAt && new Date(l.expiresAt) <= now).length;
  const bound   = all.filter(l => l.hwid !== null).length;
  return { total: all.length, active, revoked, expired, bound };
}

// ── License Validity ───────────────────────────────────────────────────────
export function isLicenseValid(lic: LicenseData): { valid: boolean; reason?: string } {
  if (lic.status === 'revoked') return { valid: false, reason: 'License sudah direvoke' };
  if (lic.expiresAt && new Date(lic.expiresAt) <= new Date())
    return { valid: false, reason: 'License sudah expired' };
  return { valid: true };
}
