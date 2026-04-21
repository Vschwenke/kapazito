// Schuetzt alle App-Bereiche ausser /login, /signup und oeffentlichen Assets.
// Authentifizierung via NextAuth JWT.
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    authorized: ({ token }) => !!token?.tenantId,
  },
});

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/finanzen/:path*',
    '/hr/:path*',
    '/sales/:path*',
    '/rechnungen/:path*',
    '/base/:path*',
    '/agent/:path*',
    '/stammdaten/:path*',
    '/zeiterfassung/:path*',
    '/import/:path*',
    '/projekte/:path*',
    '/abwesenheiten/:path*',
    '/settings/:path*',
    '/api/dashboard/:path*',
    '/api/finanzen/:path*',
    '/api/hr/:path*',
    '/api/sales/:path*',
    '/api/rechnungen/:path*',
    '/api/base/:path*',
    '/api/agent/:path*',
    '/api/stammdaten/:path*',
    '/api/zeiterfassung/:path*',
    '/api/projekte/:path*',
    '/api/abwesenheiten/:path*',
    '/api/import/:path*',
    '/api/kapi/:path*',
    '/api/settings/:path*',
  ],
};
