import type { BookMetadata } from '../types/book'
import { searchGoogleBooks } from './googleBooks'
import { searchOpenLibrary, searchOpenLibraryTitlePrefix } from './openLibrary'

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function relevance(book: BookMetadata, query: string): number {
  const normalizedQuery = normalize(query)
  const title = normalize(book.title)
  const authors = book.authors.map(normalize)
  if (title === normalizedQuery) return 0
  if (title.startsWith(normalizedQuery)) return 1
  if (title.includes(normalizedQuery)) return 2
  if (authors.some((author) => author.startsWith(normalizedQuery))) return 3
  if (authors.some((author) => author.includes(normalizedQuery))) return 4
  return 5
}

/** Search Google Books first (better cover quality); fall back to / merge in
 *  Open Library results so users still get hits when Google has none or is
 *  missing a cover. Results are de-duplicated by normalized title+author. */
export async function searchBooks(query: string): Promise<BookMetadata[]> {
  const [googleResults, openLibraryResults] = await Promise.allSettled([
    searchGoogleBooks(query),
    searchOpenLibrary(query),
  ])

  const google = googleResults.status === 'fulfilled' ? googleResults.value : []
  const openLibrary = openLibraryResults.status === 'fulfilled' ? openLibraryResults.value : []
  const normalizedQuery = normalize(query)
  const hasTitleMatch = [...google, ...openLibrary].some((book) =>
    normalize(book.title).startsWith(normalizedQuery),
  )
  let titlePrefixResults: BookMetadata[] = []

  if (!hasTitleMatch && normalizedQuery.split(' ').length > 1) {
    const titlePrefix = await searchOpenLibraryTitlePrefix(query).catch(() => [])
    titlePrefixResults = titlePrefix
  }

  const seen = new Set<string>()
  const merged: BookMetadata[] = []

  for (const book of [...google, ...titlePrefixResults, ...openLibrary]) {
    const key = `${book.title.trim().toLowerCase()}::${book.authors[0]?.trim().toLowerCase() ?? ''}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(book)
  }

  return merged.sort((first, second) => relevance(first, query) - relevance(second, query))
}
