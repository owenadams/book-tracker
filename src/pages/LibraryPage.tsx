import { useMemo, useState } from 'react'
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { BookDetailModal } from '../components/tierboard/BookDetailModal'
import { LibraryRow } from '../components/library/LibraryRow'
import { useBooksStore } from '../store/booksStore'
import { SORT_OPTIONS, sortBooks, type SortOption } from '../utils/sortBooks'
import type { TrackedBook } from '../types/book'

type StatusFilter = 'all' | 'want_to_read' | 'read'

export function LibraryPage() {
  const books = useBooksStore((state) => state.books)
  const removeBook = useBooksStore((state) => state.removeBook)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('date-desc')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    const matching = trimmed
      ? books.filter((book) =>
          [book.title, ...book.authors, ...book.genres, ...book.notes, ...book.tropes, book.dislikeReason]
            .some((value) => value.toLowerCase().includes(trimmed)),
        )
      : books
    const byStatus = filter === 'all' ? matching : matching.filter((book) => book.status === filter)
    return sortBooks(byStatus, sort)
  }, [books, filter, query, sort])

  const editingBook = editingId ? (books.find((book) => book.id === editingId) ?? null) : null
  const counts = {
    all: books.length,
    want_to_read: books.filter((book) => book.status === 'want_to_read').length,
    read: books.filter((book) => book.status === 'read').length,
  }

  function handleRemove(book: TrackedBook) {
    if (window.confirm(`Remove "${book.title}" from your library?`)) removeBook(book.id)
  }

  return (
    <section className="library-page">
      <header className="page-heading library-heading">
        <div>
          <p className="eyebrow">A home for every story</p>
          <h1 className="page-title">My Library</h1>
          <p className="page-subtitle">{books.length} {books.length === 1 ? 'book' : 'books'} in your collection</p>
        </div>
        <Link className="button button-primary library-add" to="/search"><BookOpen /> Add a book</Link>
      </header>

      <div className="library-tools">
        <label className="search-control">
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, authors, tropes, notes..." />
        </label>
        <div className="filter-sort-row">
          <div className="status-switch" aria-label="Filter by reading status">
            {([
              ['all', 'All', counts.all],
              ['want_to_read', 'Want to read', counts.want_to_read],
              ['read', 'Read', counts.read],
            ] as const).map(([value, label, count]) => (
              <button key={value} type="button" className={filter === value ? 'status-option active' : 'status-option'} onClick={() => setFilter(value)}>
                {label}<span>{count}</span>
              </button>
            ))}
          </div>
          <label className="sort-control">
            <SlidersHorizontal aria-hidden="true" />
            <span className="sr-only">Sort library</span>
            <select className="select-field" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <BookOpen aria-hidden="true" />
          <h2>Your shelf awaits</h2>
          <p>Find a book you love, add it to your library, and start shaping your reading list.</p>
          <Link className="button button-primary" to="/search">Find your first book</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state compact-empty"><Search aria-hidden="true" /><h2>No matches</h2><p>Try a different search or reading-status filter.</p></div>
      ) : (
        <div className="book-list" aria-live="polite">
          {filtered.map((book) => <LibraryRow key={book.id} book={book} onEdit={(selected) => setEditingId(selected.id)} onRemove={handleRemove} />)}
        </div>
      )}

      {editingBook && <BookDetailModal book={editingBook} onClose={() => setEditingId(null)} />}
    </section>
  )
}

