import { NextResponse } from 'next/server';
import { getSettings, saveSettings, invalidateKeyCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  radius: 100,
  refreshInterval: 60,
  enabledAPIs: {
    airplaneslive: true,
    adsblol: true,
    adsbfi: true,
    opensky: true,
    airlabs: false,
  },
  apiKeys: {
    airLabs: '',
  },
};

export async function GET() {
  try {
    const stored = await getSettings();
    const s = stored || DEFAULT_SETTINGS;

    const publicSettings = {
      radius: s.radius ?? DEFAULT_SETTINGS.radius,
      refreshInterval: s.refreshInterval ?? DEFAULT_SETTINGS.refreshInterval,
      enabledAPIs: { ...DEFAULT_SETTINGS.enabledAPIs, ...(s.enabledAPIs || {}) },
      apiKeysConfigured: {
        airLabs: !!(s.apiKeys && s.apiKeys.airLabs),
      },
    };

    return NextResponse.json({ settings: publicSettings });
  } catch (error) {
    console.error('Settings GET error:', error.message);
    return NextResponse.json({ settings: DEFAULT_SETTINGS }, { status: 500 });
  }
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return ba.equals(bb);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, settings } = body;

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD || !safeEqual(password, ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Unauthorized. Invalid or missing Admin Password.' }, { status: 401 });
    }

    const current = (await getSettings()) || DEFAULT_SETTINGS;

    const mergedKeys = { ...(current.apiKeys || {}) };
    const incomingKeys = settings?.apiKeys || {};
    if (incomingKeys.airLabs) mergedKeys.airLabs = String(incomingKeys.airLabs).trim();

    const merged = {
      radius: settings?.radius ?? current.radius,
      refreshInterval: settings?.refreshInterval ?? current.refreshInterval,
      enabledAPIs: { ...DEFAULT_SETTINGS.enabledAPIs, ...current.enabledAPIs, ...(settings?.enabledAPIs || {}) },
      apiKeys: mergedKeys,
    };

    await saveSettings(merged);
    invalidateKeyCache();

    return NextResponse.json({
      success: true,
      settings: {
        radius: merged.radius,
        refreshInterval: merged.refreshInterval,
        enabledAPIs: merged.enabledAPIs,
        apiKeysConfigured: {
          airLabs: !!mergedKeys.airLabs,
        },
      },
    });
  } catch (error) {
    console.error('Settings POST error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
