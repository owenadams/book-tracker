import type { BookMetadata } from '../types/book'

const OPEN_LIBRARY_SEARCH_ENDPOINT = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_COVERS_BASE = 'https://covers.openlibrary.org/b/id'

interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  subject?: string[]
  first_publish_year?: number
  cover_i?: number
  first_sentence?: string[]
  ratings_average?: number
  ratings_count?: number
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[]
}

function toMetadata(doc: OpenLibraryDoc): BookMetadata {
  return {
    id: `open-library:${doc.key}`,
    source: 'open-library',
    title: doc.title,
    authors: doc.author_name ?? [],
    genres: doc.subject?.slice(0, 5) ?? [],
    publishedYear: doc.first_publish_year ?? null,
    coverUrl: doc.cover_i ? `${OPEN_LIBRARY_COVERS_BASE}/${doc.cover_i}-L.jpg` : null,
    description: doc.first_sentence?.[0] ?? null,
    averageRating: doc.ratings_average ?? null,
    ratingCount: doc.ratings_count ?? null,
  }
}

async function searchQuery(query: string, limit: number): Promise<BookMetadata[]> {
  const url = new URL(OPEN_LIBRARY_SEARCH_ENDPOINT)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('fields', 'key,title,author_name,subject,first_publish_year,cover_i,first_sentence,ratings_average,ratings_count')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`)

  const data: OpenLibraryResponse = await res.json()
  return data.docs.map(toMetadata)
}

/** Search Open Library for a free-text query. Used as a fallback source
 *  when Google Books has no result or is missing a cover image. */
export async function searchOpenLibrary(query: string, limit = 20): Promise<BookMetadata[]> {
  return searchQuery(query, limit)
}

/** Recover partial multi-word titles when broad catalogue search is noisy. */
export async function searchOpenLibraryTitlePrefix(query: string, limit = 10): Promise<BookMetadata[]> {
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ')
  if (normalizedQuery.split(' ').length < 2) return []

  const results = await searchQuery(`title:${normalizedQuery}*`, limit)
  return results.filter((book) => book.title.trim().toLowerCase().startsWith(normalizedQuery))
}
