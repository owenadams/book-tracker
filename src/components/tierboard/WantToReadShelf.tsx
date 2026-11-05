import { BookMarked } from 'lucide-react'
import { TierBookCard } from './TierBookCard'
import type { TrackedBook } from '../../types/book'

interface WantToReadShelfProps {
  books: TrackedBook[]
  onSelectBook: (book: TrackedBook) => void
}

export function WantToReadShelf({ books, onSelectBook }: WantToReadShelfProps) {
  return (
    <section className="want-shelf">
      <header className="want-shelf-heading">
        <BookMarked aria-hidden="true" />
        <div><h2>Want to read</h2><p>{books.length} {books.length === 1 ? 'book' : 'books'} queued</p></div>
      </header>
      {books.length === 0 ? (
        <p className="tier-empty">Books you add but haven't read yet land here.</p>
      ) : (
        <div className="want-shelf-books">
          {books.map((book) => (
            <TierBookCard key={book.id} book={book} onClick={onSelectBook} />
          ))}
        </div>
      )}
    </section>
  )
}
