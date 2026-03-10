import { NextResponse } from 'next/server'
import { getDistinctModels } from '@/lib/db'

export async function GET() {
  const models = await getDistinctModels()
  return NextResponse.json(models)
}
