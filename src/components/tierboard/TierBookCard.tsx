import { BookCover } from '../ui/BookCover'
import type { TrackedBook } from '../../types/book'

interface TierBookCardProps {
  book: TrackedBook
  onClick: (book: TrackedBook) => void
}

export function TierBookCard({ book, onClick }: TierBookCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(book)}
      title={book.title}
      className="tier-book-card"
    >
      <BookCover
        coverUrl={book.coverUrl}
        title={book.title}
        className="tier-book-cover"
      />
      <span className="tier-book-title">{book.title}</span>
      {book.tier === 'dislike' && <span className="tier-book-reason">{book.dislikeReason}</span>}
    </button>
  )
}
