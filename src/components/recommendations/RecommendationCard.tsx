import { Sparkles, Star } from 'lucide-react'
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
        <div className="recommendation-actions">
          {metadata ? (
            <AddBookStatusPicker tracked={tracked} onAdd={(status) => onAdd(recommendation, status)} />
          ) : <p className="catalogue-hint">No catalogue match found; this suggestion cannot be added yet.</p>}
          {metadata?.averageRating != null && <span className="catalogue-rating"><Star aria-hidden="true" fill="currentColor" /> {metadata.averageRating.toFixed(1)} <small>{metadata.source === 'google-books' ? 'Google Books' : 'Open Library'}</small></span>}
        </div>
      </div>
    </article>
  )
}
