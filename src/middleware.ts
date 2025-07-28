import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/admin/login');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin') && !isAuthPage;

  // For admin pages, let the client-side Firebase Auth handle authentication
  // This is simpler and more reliable than trying to verify tokens in middleware
  if (isAuthPage || isAdminPage) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};