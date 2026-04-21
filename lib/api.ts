// Kleine Helper fuer API-Route-Handler:
// - zod-Validierung
// - Error-Wrapping (AuthError, ValidationError, Prisma-Fehler → JSON)
// - konsistentes Error-Format { error: { code, message } }

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { logger } from './errors';
import { AuthError } from './auth';
import { Prisma } from '@prisma/client';

export class ValidationError extends Error {
  status = 400;
  details?: unknown;
  constructor(msg: string, details?: unknown) {
    super(msg);
    this.details = details;
  }
}

export async function parseJson<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Ungueltiges JSON im Request-Body');
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Validierung fehlgeschlagen', result.error.format());
  }
  return result.data;
}

export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const obj = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    throw new ValidationError('Query-Parameter ungueltig', result.error.format());
  }
  return result.data;
}

export type RouteHandler = (req: NextRequest, ctx?: { params: any }) => Promise<Response> | Response;

/** Wrapper fuer einheitliches Error-Handling. */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e: any) {
      if (e instanceof AuthError) {
        return NextResponse.json({ error: { code: 'unauthorized', message: e.message } }, { status: e.status });
      }
      if (e instanceof ValidationError) {
        return NextResponse.json(
          { error: { code: 'validation_error', message: e.message, details: e.details } },
          { status: 400 }
        );
      }
      if (e instanceof ZodError) {
        return NextResponse.json(
          { error: { code: 'validation_error', message: 'Ungueltige Eingabe', details: e.format() } },
          { status: 400 }
        );
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return NextResponse.json({ error: { code: 'duplicate', message: 'Datensatz existiert bereits' } }, { status: 409 });
        }
        if (e.code === 'P2025') {
          return NextResponse.json({ error: { code: 'not_found', message: 'Datensatz nicht gefunden' } }, { status: 404 });
        }
      }
      if (e?.status) {
        return NextResponse.json({ error: { code: 'request_error', message: e.message } }, { status: e.status });
      }
      logger.error({ err: e }, 'Unbehandelter Fehler in API-Route');
      return NextResponse.json({ error: { code: 'internal_error', message: 'Interner Fehler' } }, { status: 500 });
    }
  };
}

/** Convenience fuer erfolgreiche JSON-Antworten. */
export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
