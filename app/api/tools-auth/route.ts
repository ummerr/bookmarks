import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!process.env.TOOLS_PASSWORD) {
    return NextResponse.json({ error: 'TOOLS_PASSWORD env var not set' }, { status: 500 })
  }

  if (password !== process.env.TOOLS_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('tools_session', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // No maxAge = session cookie (expires when browser closes)
  })
  return response
}
