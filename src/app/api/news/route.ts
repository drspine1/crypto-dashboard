import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/utils/constants'

export async function GET() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ articles: [] }, { status: 200 })
  }

  try {
    const params = new URLSearchParams({
      q: API_CONFIG.NEWS.QUERY,
      sortBy: API_CONFIG.NEWS.SORT_BY,
      language: 'en',
      pageSize: '20',
      apiKey,
    })

    const response = await fetch(
      `${API_CONFIG.NEWS.BASE_URL}/everything?${params}`,
      {
        next: { revalidate: 300 }, // cache for 5 minutes
      }
    )

    if (!response.ok) {
      return NextResponse.json({ articles: [] }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ articles: [] }, { status: 200 })
  }
}
