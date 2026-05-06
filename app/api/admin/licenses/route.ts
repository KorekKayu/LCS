import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createLicense, listLicenses } from '@/lib/license';

// GET /api/admin/licenses — list all
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const licenses = await listLicenses();
  return NextResponse.json(licenses);
}

// POST /api/admin/licenses — create new
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  let body: { email?: string; note?: string; expiresAt?: string | null };
  try { body = await req.json(); }
  catch { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }

  if (!body.email) return NextResponse.json({ message: 'Email wajib diisi' }, { status: 400 });

  const lic = await createLicense({
    email: body.email,
    note: body.note || '',
    expiresAt: body.expiresAt || null,
  });

  return NextResponse.json(lic, { status: 201 });
}
