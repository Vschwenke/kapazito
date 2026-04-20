import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: [
    '/finanzen/:path*',
    '/hr/:path*',
    '/sales/:path*',
    '/rechnungen/:path*',
    '/base/:path*',
    '/agent/:path*',
    '/api/finanzen/:path*',
    '/api/hr/:path*',
    '/api/sales/:path*',
    '/api/rechnungen/:path*',
    '/api/base/:path*',
    '/api/agent/:path*',
  ],
};
