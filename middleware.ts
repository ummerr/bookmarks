import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/tools')) {
    // Allow the login page and auth API through
    if (
      request.nextUrl.pathname === '/tools/login' ||
      request.nextUrl.pathname.startsWith('/api/tools-auth')
    ) {
      return NextResponse.next()
    }

    const session = request.cookies.get('tools_session')
    if (!session || session.value !== 'ok') {
      return NextResponse.redirect(new URL('/tools/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tools', '/tools/:path*'],
}
