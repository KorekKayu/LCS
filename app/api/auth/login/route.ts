import { NextRequest, NextResponse } from 'next/server';
import { signSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 }); }

  const { email, password } = body;

  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@ikona.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'IkOnA@Admin2025!';

  if (email !== adminEmail || password !== adminPassword) {
    // Small delay to prevent brute force
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json({ ok: false, message: 'Email atau password salah' }, { status: 401 });
  }

  const token = await signSession(email);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  });
  return res;
}
