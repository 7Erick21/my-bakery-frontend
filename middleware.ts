import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const dashboardRoutes = ['/dashboard'];
const authRoutes = ['/orders'];

function isDashboardRoute(pathname: string) {
  return dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        }
      }
    }
  );

  // Refresh session — IMPORTANT: do not remove this
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users from protected routes
  if (!user && (isDashboardRoute(pathname) || isAuthRoute(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (user && pathname === '/auth') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Dashboard role-based access check
  if (user && isDashboardRoute(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'user';

    // Only admin, marketing, and super_admin can access dashboard
    if (role === 'user') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Marketing-only routes
    const marketingRoutes = ['/dashboard/content', '/dashboard/languages'];
    const adminOnlyRoutes = [
      '/dashboard/products',
      '/dashboard/categories',
      '/dashboard/orders',
      '/dashboard/inventory',
      '/dashboard/production',
      '/dashboard/reviews',
      '/dashboard/coupons'
    ];
    const superAdminRoutes = ['/dashboard/audit', '/dashboard/users'];

    const isMarketingRoute = marketingRoutes.some(
      r => pathname === r || pathname.startsWith(`${r}/`)
    );
    const isAdminOnlyRoute = adminOnlyRoutes.some(
      r => pathname === r || pathname.startsWith(`${r}/`)
    );
    const isSuperAdminRoute = superAdminRoutes.some(
      r => pathname === r || pathname.startsWith(`${r}/`)
    );

    if (isSuperAdminRoute && role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isAdminOnlyRoute && !['admin', 'super_admin'].includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isMarketingRoute && !['marketing', 'admin', 'super_admin'].includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)'
  ]
};
