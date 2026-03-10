import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  if (hostname.startsWith('prompts.') && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/prompts', request.url))
  }
}

export const config = {
  matcher: '/',
}
