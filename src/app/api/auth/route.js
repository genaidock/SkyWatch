import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/redis';

const MAX_ATTEMPTS = 5;
const WINDOW_SEC = 60;

function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return ba.equals(bb);
}

export async function POST(request) {
  const ip = getClientIp(request);
  const { allowed, count } = await rateLimit(`auth:${ip}`, MAX_ATTEMPTS, WINDOW_SEC);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(WINDOW_SEC) } }
    );
  }

  try {
    const { password } = await request.json();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD || !safeEqual(password, ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
