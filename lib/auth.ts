// NextAuth-Konfiguration mit Multi-Tenant-Claims im JWT.
//
// Flow:
//   1. User logged sich mit email+password (optional: tenantSlug) ein
//   2. Authorize prueft Credentials, laedt Memberships
//   3. Wenn nur 1 Membership: dieses direkt in JWT; sonst: User waehlt Tenant
//   4. JWT enthaelt: userId, email, tenantId, role, scopes
//
// Wichtig: tenantId ist immer im Token, alle API-Routes lesen ihn per
//   `await getServerAuth()` und NIEMALS aus Query-Params oder Body.

import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
        tenantSlug: { label: 'Organisation', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            memberships: {
              include: { tenant: { select: { id: true, slug: true, name: true, plan: true } } },
            },
          },
        });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        // Wenn tenantSlug angegeben: passenden Membership suchen
        let active = user.memberships[0];
        if (credentials.tenantSlug) {
          const found = user.memberships.find((m) => m.tenant.slug === credentials.tenantSlug);
          if (found) active = found;
        }
        if (!active) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: active.tenantId,
          tenantSlug: active.tenant.slug,
          tenantName: active.tenant.name,
          role: active.role,
          scopes: active.scopes,
        } as any;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 /* 7 Tage */ },
  jwt: { maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.userId = u.id;
        token.tenantId = u.tenantId;
        token.tenantSlug = u.tenantSlug;
        token.tenantName = u.tenantName;
        token.role = u.role;
        token.scopes = u.scopes;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantSlug = token.tenantSlug;
        (session.user as any).tenantName = token.tenantName;
        (session.user as any).role = token.role;
        (session.user as any).scopes = token.scopes;
      }
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: Role;
  scopes: string[];
};

export async function getServerAuth(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as any;
  if (!u.tenantId) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    tenantId: u.tenantId,
    tenantSlug: u.tenantSlug,
    tenantName: u.tenantName,
    role: u.role,
    scopes: u.scopes || [],
  };
}

/**
 * Fordert eine eingeloggte Session. Wirft 401 wenn keine.
 * Use in API-Routes:
 *   const session = await requireAuth();
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getServerAuth();
  if (!session) {
    throw new AuthError('Nicht autorisiert', 401);
  }
  return session;
}

/**
 * Fordert eine bestimmte Rolle. Wirft 403 wenn Nutzer sie nicht hat.
 */
export async function requireRole(allowed: Role | Role[]): Promise<SessionUser> {
  const session = await requireAuth();
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(session.role)) {
    throw new AuthError(`Rolle ${session.role} darf nicht auf diese Ressource zugreifen`, 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(msg: string, status = 401) {
    super(msg);
    this.status = status;
  }
}
