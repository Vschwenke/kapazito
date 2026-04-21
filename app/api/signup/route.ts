// POST /api/signup — oeffentliche Registrierung.
// Rate-limited: 5 Signups pro IP pro Stunde.
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { signupTenantOwner } from '@/lib/services/signup.service';
import { rateLimit } from '@/lib/rate-limit';

const body = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2),
  companyName: z.string().min(2),
  companyLegalName: z.string().optional(),
  vatId: z.string().optional(),
  addressStreet: z.string().optional(),
  addressZip: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().length(2).optional(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const limited = await rateLimit(req, 'signup', 5, 3600);
  if (limited) return limited;

  const input = await parseJson(req, body);
  const res = await signupTenantOwner(input);
  return json(res, 201);
});
