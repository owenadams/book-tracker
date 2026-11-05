import { useMemo, useState } from 'react'
import { Layers3 } from 'lucide-react'
import { TierRow } from '../components/tierboard/TierRow'
import { WantToReadShelf } from '../components/tierboard/WantToReadShelf'
import { BookDetailModal } from '../components/tierboard/BookDetailModal'
import { useBooksStore } from '../store/booksStore'
import { TIERS } from '../types/book'
import type { AnyTier, TrackedBook } from '../types/book'

const ALL_TIERS: AnyTier[] = [...TIERS, 'dislike', 'unranked']

export function TierBoardPage() {
  const books = useBooksStore((state) => state.books)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const wantToRead = useMemo(() => books.filter((b) => b.status === 'want_to_read'), [books])

  const grouped = useMemo(() => {
    const map = new Map<AnyTier, TrackedBook[]>(ALL_TIERS.map((tier) => [tier, []]))
    for (const book of books) {
      if (book.status === 'read') map.get(book.tier)?.push(book)
    }
    return map
  }, [books])

  // Look up the live book by id (rather than holding a stale object) so the modal
  // always reflects the latest tier/notes even as the store updates.
  const selectedBook = selectedId ? (books.find((b) => b.id === selectedId) ?? null) : null

  return (
    <section className="tier-board-page">
      <header className="page-heading">
        <p className="eyebrow">Your personal canon</p>
        <h1 className="page-title">Ranked Shelf</h1>
        <p className="page-subtitle">A considered reading record, from all-time favourites to books that missed the mark.</p>
      </header>

      {books.length === 0 ? (
        <div className="empty-state"><Layers3 aria-hidden="true" /><h2>Your ranked shelf is empty</h2><p>Add books to your library, then mark them read to start rating.</p></div>
      ) : (
        <>
          <WantToReadShelf books={wantToRead} onSelectBook={(b) => setSelectedId(b.id)} />
          <div className="space-y-3">
            {ALL_TIERS.map((tier) => (
              <TierRow
                key={tier}
                tier={tier}
                books={grouped.get(tier) ?? []}
                onSelectBook={(b) => setSelectedId(b.id)}
              />
            ))}
          </div>
        </>
      )}

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedId(null)} />}
    </section>
  )
}

