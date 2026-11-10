import { searchBooks } from './bookSearch'
import type { EnrichedRecommendation, RawRecommendation } from '../types/book'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function isVerifiedMatch(
  recommendation: RawRecommendation,
  book: { title: string; authors: string[] },
): boolean {
  const expectedTitle = normalize(recommendation.title)
  const expectedAuthor = normalize(recommendation.author)
  return normalize(book.title) === expectedTitle &&
    book.authors.some((author) => normalize(author) === expectedAuthor)
}

/** Attach catalogue details only when both title and author match exactly. */
export async function enrichRecommendations(
  raw: RawRecommendation[],
): Promise<EnrichedRecommendation[]> {
  return Promise.all(
    raw.map(async (rec) => {
      try {
        const results = await searchBooks(`${rec.title} ${rec.author}`)
        const match = results.find((result) => isVerifiedMatch(rec, result)) ?? null
        return { ...rec, metadata: match }
      } catch {
        return { ...rec, metadata: null }
      }
    }),
  )
}
