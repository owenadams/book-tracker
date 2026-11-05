import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, LoaderCircle, Search } from 'lucide-react'
import { Link } from 'react-router'
import { searchBooks } from '../api/bookSearch'
import { SearchResultCard } from '../components/search/SearchResultCard'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useBooksStore } from '../store/booksStore'
import type { BookMetadata } from '../types/book'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<{ query: string; books: BookMetadata[]; error: boolean }>({
    query: '',
    books: [],
    error: false,
  })
  const debouncedQuery = useDebouncedValue(query)
  const activeQuery = debouncedQuery.trim()
  const hasResponse = response.query === activeQuery
  const status = !activeQuery ? 'idle' : !hasResponse ? 'loading' : response.error ? 'error' : 'idle'
  const results = hasResponse ? response.books : []

  const addBook = useBooksStore((state) => state.addBook)
  // Subscribe to `books` (not the stable `isTracked` function) so this page re-renders on add.
  const books = useBooksStore((state) => state.books)
  const trackedIds = useMemo(() => new Set(books.map((b) => b.id)), [books])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) return

    let cancelled = false

    searchBooks(trimmed)
      .then((books) => {
        if (cancelled) return
        setResponse({ query: trimmed, books, error: false })
      })
      .catch(() => {
        if (cancelled) return
        setResponse({ query: trimmed, books: [], error: true })
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  return (
    <section className="search-page">
      <header className="page-heading">
        <Link className="back-link" to="/"><ArrowLeft aria-hidden="true" /> My Library</Link>
        <p className="eyebrow">Discover a new favourite</p>
        <h1 className="page-title">Add a book</h1>
        <p className="page-subtitle">Search Google Books and Open Library. Add a title to your Want to Read shelf.</p>
      </header>
      <label className="search-control catalogue-search">
        <Search aria-hidden="true" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or ISBN..." />
      </label>

      {status === 'loading' && (
        <div className="search-status"><LoaderCircle className="spin" /> Searching catalogues...</div>
      )}

      {status === 'error' && (
        <p className="search-status error" role="alert">Catalogue search failed. Check your connection and try again.</p>
      )}

      {status === 'idle' && debouncedQuery.trim() && results.length === 0 && (
        <div className="empty-state compact-empty"><Search aria-hidden="true" /><h2>No results found</h2><p>Try a different title, author, or ISBN.</p></div>
      )}

      {status === 'idle' && !debouncedQuery.trim() && (
        <p className="catalogue-hint">Start typing to search Google Books and Open Library.</p>
      )}

      {results.length > 0 && (
        <div className="catalogue-grid">
          {results.map((book) => (
            <SearchResultCard key={book.id} book={book} tracked={trackedIds.has(book.id)} onAdd={(metadata, status) => { void addBook(metadata, status) }} />
          ))}
        </div>
      )}
    </section>
  )
}

