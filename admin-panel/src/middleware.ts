import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_ROLES } from './lib/auth/rbac';
import type { UserRole } from './store/useAuthStore';

function getRoleFromToken(token: string, hasRefreshToken: boolean): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired, but ONLY if we don't have a refresh token
    // If we have a refresh token, we let the client-side axios interceptor handle the refresh process
    if (!hasRefreshToken && payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
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

  const hasRefreshToken = request.cookies.has('refreshToken');

  if (isAdminPath) {
    if (!token && !hasRefreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If we only have a refresh token but no access token, we still let it pass to the client
    // so that the client-side axios interceptor can attempt a refresh.
    // If we have an access token, we check its role.
    if (token) {
      const role = getRoleFromToken(token, hasRefreshToken);
      if (!role || !ADMIN_ROLES.includes(role as UserRole)) {
        // Not an admin, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken');
        return response;
      }
    }
  }

  if (token && isAuthRoute) {
    const role = getRoleFromToken(token, hasRefreshToken);
    if (role && ADMIN_ROLES.includes(role as UserRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      const response = NextResponse.next();
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

