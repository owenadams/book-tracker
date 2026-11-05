import { TIER_STYLES } from '../../utils/tierStyles'
import { TierBookCard } from './TierBookCard'
import type { AnyTier, TrackedBook } from '../../types/book'

interface TierRowProps {
  tier: AnyTier
  books: TrackedBook[]
  onSelectBook: (book: TrackedBook) => void
}

export function TierRow({ tier, books, onSelectBook }: TierRowProps) {
  const style = TIER_STYLES[tier]
  const sectionName = tier === 'unranked' ? 'Not yet graded' : tier === 'dislike' ? 'Dislike' : `${tier} tier`
  return (
    <section className={`tier-section tier-${tier}`}>
      <header className="tier-section-heading">
        <span className={`tier-letter tier-${tier}`}>{tier === 'unranked' ? '·' : style.label}</span>
        <div>
          <h2>{sectionName}</h2>
          <p>{books.length} {books.length === 1 ? 'book' : 'books'}{tier === 'dislike' ? ' · reason saved for each' : ''}</p>
        </div>
      </header>
      {books.length ? (
        <div className={`tier-book-grid${tier === 'dislike' || tier === 'unranked' ? ' text-list' : ''}`}>
          {books.map((book) => <TierBookCard key={book.id} book={book} onClick={onSelectBook} />)}
        </div>
      ) : <p className="tier-empty">No books here yet.</p>}
    </section>
  )
}
