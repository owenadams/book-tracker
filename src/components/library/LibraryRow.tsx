import { Star, Trash2 } from 'lucide-react'
import { BookCover } from '../ui/BookCover'
import { TIER_STYLES } from '../../utils/tierStyles'
import type { TrackedBook } from '../../types/book'

interface LibraryRowProps {
  book: TrackedBook
  onEdit: (book: TrackedBook) => void
  onRemove: (book: TrackedBook) => void
}

export function LibraryRow({ book, onEdit, onRemove }: LibraryRowProps) {
  const tierStyle = TIER_STYLES[book.tier]
  const sourceName = book.source === 'google-books' ? 'Google Books' : 'Open Library'

  return (
    <article className="book-row">
      <BookCover coverUrl={book.coverUrl} title={book.title} className="book-cover" />
      <div className="book-row-main">
        <div className="book-row-labels">
          <span className={`status-badge ${book.status === 'want_to_read' ? 'want' : 'read'}`}>
            {book.status === 'want_to_read' ? 'Want to read' : 'Read'}
          </span>
          {book.status === 'read' && <span className={`tier-badge tier-${book.tier}`}>{tierStyle.label}</span>}
        </div>
        <h2 className="book-row-title">{book.title}</h2>
        <p className="book-row-author">{book.authors.join(', ') || 'Unknown author'}{book.publishedYear ? ` · ${book.publishedYear}` : ''}</p>
        <div className="book-row-footer">
          <span className="book-genres">{book.genres.slice(0, 2).join(' · ') || 'Genre not listed'}</span>
          {book.averageRating != null && (
            <span className="catalogue-rating" title={`${sourceName} rating from ${book.ratingCount?.toLocaleString() ?? 'an unknown number of'} readers`}>
              <Star aria-hidden="true" fill="currentColor" /> {book.averageRating.toFixed(1)}
              <small>{sourceName}{book.ratingCount ? ` · ${book.ratingCount.toLocaleString()}` : ''}</small>
            </span>
          )}
        </div>
        {book.tier === 'dislike' && book.dislikeReason && <p className="dislike-summary">Disliked because: {book.dislikeReason}</p>}
      </div>
      <div className="book-row-actions">
          <button className="button button-secondary row-rate-button" type="button" onClick={() => onEdit(book)} aria-label={`${book.status === 'read' ? 'Rate' : 'View details for'} ${book.title}`}>
            {book.status === 'read' ? <><Star aria-hidden="true" /> Rate</> : 'Details'}
          </button>
        <button className="icon-button remove-action" type="button" onClick={() => onRemove(book)} aria-label={`Remove ${book.title}`} title="Remove book"><Trash2 /></button>
      </div>
    </article>
  )
}
