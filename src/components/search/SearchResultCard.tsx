import { Star } from 'lucide-react'
import { BookCover } from '../ui/BookCover'
import { AddBookStatusPicker } from '../library/AddBookStatusPicker'
import type { BookMetadata } from '../../types/book'
import type { ReadStatus } from '../../types/book'

interface SearchResultCardProps {
  book: BookMetadata
  tracked: boolean
  onAdd: (book: BookMetadata, status: ReadStatus) => void
}

export function SearchResultCard({ book, tracked, onAdd }: SearchResultCardProps) {
  const sourceName = book.source === 'google-books' ? 'Google Books' : 'Open Library'
  return (
    <article className="catalogue-result">
      <BookCover coverUrl={book.coverUrl} title={book.title} className="catalogue-cover" />
      <div className="catalogue-copy">
        <h2 title={book.title}>{book.title}</h2>
        <p>{book.authors.join(', ') || 'Unknown author'}{book.publishedYear ? ` · ${book.publishedYear}` : ''}</p>
        {book.averageRating != null && (
          <p className="catalogue-rating"><Star aria-hidden="true" fill="currentColor" /> {book.averageRating.toFixed(1)} <small>{sourceName}{book.ratingCount ? ` · ${book.ratingCount.toLocaleString()}` : ''}</small></p>
        )}
        {book.description && <p className="catalogue-description">{book.description}</p>}
        <AddBookStatusPicker tracked={tracked} onAdd={(status) => onAdd(book, status)} />
      </div>
    </article>
  )
}
