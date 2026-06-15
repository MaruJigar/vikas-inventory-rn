import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_ROLES } from './lib/auth/rbac';
import type { UserRole } from './store/useAuthStore';

function getRoleFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('accessToken');
  const token = tokenCookie?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login');

  const adminPaths = [
    '/dashboard',
    '/approvals',
    '/manufacturers',
    '/distributors',
    '/products',
    '/shops',
    '/orders',
    '/inventory',
    '/salesmen',
    '/visits',
    '/backorders',
    '/notifications',
  ];

  const isAdminPath = adminPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = getRoleFromToken(token);
    if (!role || !ADMIN_ROLES.includes(role as UserRole)) {
      // Not an admin, redirect to login to avoid infinite loop with / -> /dashboard
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      return response;
    }
  }

  if (token && isAuthRoute) {
    const role = getRoleFromToken(token);
    if (role && ADMIN_ROLES.includes(role as UserRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

