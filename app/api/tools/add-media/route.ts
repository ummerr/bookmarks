import { NextRequest, NextResponse } from 'next/server'
import { getPromptsWithoutMedia, addMediaToPrompt } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? 50)
    const offset = Number(url.searchParams.get('offset') ?? 0)

    const data = await getPromptsWithoutMedia(limit, offset)
    return NextResponse.json(data)
  } catch (err) {
    console.error('add-media GET error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, url } = body as { id?: string; url?: string }

    if (!id || !url) {
      return NextResponse.json({ error: 'id and url are required' }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    await addMediaToPrompt(id, url)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('add-media PATCH error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
