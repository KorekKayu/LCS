import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getLicense, revokeLicense, updateLicense, deleteLicense } from '@/lib/license';

type Params = { params: { id: string } };

// GET /api/admin/licenses/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const lic = await getLicense(decodeURIComponent(params.id));
  if (!lic) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(lic);
}

// POST /api/admin/licenses/[id] — action: revoke | activate | reset_hwid
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const key = decodeURIComponent(params.id);
  let action: string;

  // Support both JSON body and form data
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    action = body._action || body.action || '';
  } else {
    const form = await req.formData().catch(() => new FormData());
    action = form.get('_action') as string || '';
  }

  if (action === 'revoke') {
    const updated = await revokeLicense(key);
    if (!updated) return NextResponse.json({ message: 'License not found' }, { status: 404 });
    return NextResponse.redirect(new URL('/licenses', req.nextUrl.origin));
  }

  if (action === 'activate') {
    const updated = await updateLicense(key, { status: 'active' });
    if (!updated) return NextResponse.json({ message: 'License not found' }, { status: 404 });
    return NextResponse.redirect(new URL('/licenses', req.nextUrl.origin));
  }

  if (action === 'reset_hwid') {
    const updated = await updateLicense(key, { hwid: null });
    if (!updated) return NextResponse.json({ message: 'License not found' }, { status: 404 });
    return NextResponse.json({ ok: true, message: 'HWID berhasil di-reset' });
  }

  return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
}

// DELETE /api/admin/licenses/[id] — hapus license
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await deleteLicense(decodeURIComponent(params.id));
  return NextResponse.json({ ok: true });
}
