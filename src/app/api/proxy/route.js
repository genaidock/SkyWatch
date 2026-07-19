import { NextResponse } from 'next/server';
import { getApiKeys, getRedis, rateLimit } from '@/lib/redis';

const ALLOWED_HOSTS = new Set([
  'api.airplanes.live',
  'api.adsb.lol',
  'airlabs.co',
  'api.adsbdb.com',
]);

const HOST_KEY_PARAM = {
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
  if (param && keys && keys.airLabs) {
    u.searchParams.set(param, keys.airLabs);
  }
  return u;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `ratelimit:proxy:${clientIp}`;
  const { allowed, count } = await rateLimit(rateLimitKey, 60, 60); // 60 requests per minute
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
    );
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

  const redis = getRedis();
  let cacheKey = null;
  const isAdsbdbAircraftOrAirline = parsed.hostname === 'api.adsbdb.com' && 
                                   (parsed.pathname.startsWith('/v0/aircraft/') || parsed.pathname.startsWith('/v0/airline/'));
  
  if (isAdsbdbAircraftOrAirline && redis) {
    cacheKey = `proxy:adsbdb:${parsed.pathname}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
      }
    } catch (e) {
      console.error('Redis cache error:', e);
    }
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
    
    if (isAdsbdbAircraftOrAirline && redis && cacheKey) {
      try {
        await redis.setex(cacheKey, 24 * 60 * 60, JSON.stringify(data)); // Cache for 24 hours
      } catch (e) {
        console.error('Redis set error:', e);
      }
    }

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
