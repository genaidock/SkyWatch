import { NextResponse } from 'next/server';
import { getApiKeys } from '@/lib/redis';

const ALLOWED_HOSTS = new Set([
  'api.airplanes.live',
  'api.adsb.lol',
  'api.aviationstack.com',
  'airlabs.co',
]);

const HOST_KEY_PARAM = {
  'api.aviationstack.com': 'access_key',
  'airlabs.co': 'api_key',
};

function isPrivateHost(host) {
  const h = host.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === 'metadata.google.internal') return true;
  if (h === '169.254.169.254' || h.startsWith('169.254.')) return true;
  const ipMatch = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [a, b] = [Number(ipMatch[1]), Number(ipMatch[2])];
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 0) return true;
  }
  return false;
}

function buildUrl(targetUrl, keys) {
  const u = new URL(targetUrl);
  const param = HOST_KEY_PARAM[u.hostname];
  if (param && keys && keys[param === 'access_key' ? 'aviationStack' : 'airLabs']) {
    u.searchParams.set(param, keys[param === 'access_key' ? 'aviationStack' : 'airLabs']);
  }
  return u;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname) || isPrivateHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Blocked host' }, { status: 403 });
  }

  let finalUrl = parsed;
  try {
    if (HOST_KEY_PARAM[parsed.hostname]) {
      const keys = await getApiKeys();
      finalUrl = buildUrl(parsed, keys);
    }
  } catch (e) {
    console.error('Key injection failed:', e.message);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      redirect: 'error',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    console.error('Proxy error:', error.message);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
