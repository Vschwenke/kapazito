// Rate-Limiting via Upstash (falls konfiguriert) oder no-op im Dev.
// Usage: `const ok = await rateLimit(req, 'signup'); if (!ok) return 429`

import { NextRequest, NextResponse } from 'next/server';

let limiter: { check(key: string, limit: number, windowSec: number): Promise<boolean> };

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // dynamic import to avoid bundling if unused
  const { Ratelimit } = require('@upstash/ratelimit');
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  limiter = {
    async check(key, limit, windowSec) {
      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: 'kapazito',
      });
      const res = await rl.limit(key);
      return res.success;
    },
  };
} else {
  limiter = { async check() { return true; } };
}

export async function rateLimit(
  req: NextRequest,
  bucket: string,
  limit = 10,
  windowSec = 60
): Promise<NextResponse | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const ok = await limiter.check(`${bucket}:${ip}`, limit, windowSec);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Zu viele Anfragen. Bitte warten.' } },
      { status: 429 }
    );
  }
  return null;
}
