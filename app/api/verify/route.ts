import { NextRequest, NextResponse } from 'next/server';
import { getLicense, updateLicense, isLicenseValid } from '@/lib/license';
import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || 'IK0NA_H4X_S3CR3T_2025_XYZ';

// Rate limit (in-memory, resets on cold start — good enough for Vercel Edge)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

function signResponse(valid: boolean, key: string, ts: number) {
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(`${valid}|${key}|${ts}`)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ valid: false, message: 'Rate limit exceeded' }, { status: 429 });
    }

    let body: { key?: string; hwid?: string };
    try { body = await req.json(); }
    catch { return NextResponse.json({ valid: false, message: 'Invalid request' }, { status: 400 }); }

    const { key, hwid } = body;
    const KEY_REGEX = /^IKONA-NO_[A-Z0-9]{15}$/;

    if (!key || !hwid || !KEY_REGEX.test(key)) {
      return NextResponse.json({ valid: false, message: 'Format license tidak valid' }, { status: 400 });
    }

    const lic = await getLicense(key);
    if (!lic) {
      const ts = Date.now();
      return NextResponse.json({ valid: false, message: 'License tidak ditemukan', ts, sig: signResponse(false, key, ts) });
    }

    const { valid, reason } = isLicenseValid(lic);
    if (!valid) {
      const ts = Date.now();
      return NextResponse.json({ valid: false, message: reason, ts, sig: signResponse(false, key, ts) });
    }

    // HWID binding check
    if (lic.hwid && lic.hwid !== hwid) {
      const ts = Date.now();
      return NextResponse.json({
        valid: false,
        message: 'License sudah terikat ke hardware lain! Hubungi admin untuk reset HWID.',
        ts, sig: signResponse(false, key, ts)
      });
    }

    // Bind HWID if first use
    if (!lic.hwid) {
      await updateLicense(key, { hwid });
    }

    const ts = Date.now();
    return NextResponse.json({
      valid: true,
      expiry: lic.expiresAt,
      note: lic.note,
      hwid_bound: !lic.hwid,
      ts,
      sig: signResponse(true, key, ts),
    });
  } catch (err: any) {
    // Always return JSON even if Redis/DB is down
    const ts = Date.now();
    const sig = signResponse(false, '', ts);
    return NextResponse.json(
      { valid: false, message: 'Server error: ' + (err?.message || 'Database belum terkonfigurasi'), ts, sig },
      { status: 500 }
    );
  }
}
