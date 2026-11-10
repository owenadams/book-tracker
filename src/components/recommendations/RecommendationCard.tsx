import { ExternalLink, Search, Sparkles, Star } from 'lucide-react'
import { BookCover } from '../ui/BookCover'
import { AddBookStatusPicker } from '../library/AddBookStatusPicker'
import type { EnrichedRecommendation } from '../../types/book'
import type { ReadStatus } from '../../types/book'

interface RecommendationCardProps {
  recommendation: EnrichedRecommendation
  tracked: boolean
  onAdd: (recommendation: EnrichedRecommendation, status: ReadStatus) => void
}

export function RecommendationCard({ recommendation, tracked, onAdd }: RecommendationCardProps) {
  const { metadata } = recommendation
  const searchQuery = encodeURIComponent(`${recommendation.title} ${recommendation.author}`)
  const googleBooksSearchUrl = `https://books.google.com/books?q=${searchQuery}`
  const openLibrarySearchUrl = `https://openlibrary.org/search?q=${searchQuery}`
  const sourceName = metadata?.source === 'google-books' ? 'Google Books' : 'Open Library'

  return (
    <article className="recommendation-row">
      <BookCover coverUrl={metadata?.coverUrl ?? null} title={recommendation.title} className="recommendation-cover" />
      <div className="recommendation-copy">
        <div className="recommendation-title-line">
          <div><h3>{recommendation.title}</h3><p>by {recommendation.author}</p></div>
          <Sparkles aria-hidden="true" />
        </div>
        {metadata?.genres.length ? <div className="recommendation-tags">{metadata.genres.slice(0, 3).map((genre) => <span key={genre}>{genre}</span>)}</div> : null}
        {metadata?.description && <p className="recommendation-description">{metadata.description}</p>}
        <blockquote>{recommendation.reason}</blockquote>
        {metadata ? (
          <a
            className="recommendation-source-link"
            href={metadata.sourceUrl ?? (metadata.source === 'google-books' ? googleBooksSearchUrl : openLibrarySearchUrl)}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink aria-hidden="true" /> View source: {sourceName}
          </a>
        ) : (
          <div className="recommendation-unverified">
            <p><strong>Unverified:</strong> no exact title and author match was found in the book catalogues.</p>
            <div>
              <a href={googleBooksSearchUrl} target="_blank" rel="noreferrer"><Search aria-hidden="true" /> Search Google Books</a>
              <a href={openLibrarySearchUrl} target="_blank" rel="noreferrer"><Search aria-hidden="true" /> Search Open Library</a>
            </div>
          </div>
        )}
        <div className="recommendation-actions">
          {metadata ? (
            <AddBookStatusPicker tracked={tracked} onAdd={(status) => onAdd(recommendation, status)} />
          ) : <p className="catalogue-hint">This suggestion can't be added until a matching catalogue record is found.</p>}
          {metadata?.averageRating != null && <span className="catalogue-rating"><Star aria-hidden="true" fill="currentColor" /> {metadata.averageRating.toFixed(1)} <small>{metadata.source === 'google-books' ? 'Google Books' : 'Open Library'}</small></span>}
        </div>
      </div>
    </article>
  )
}
