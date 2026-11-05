import { useState } from 'react'
import { BookMarked, Star, Trash2, X } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { BookCover } from '../ui/BookCover'
import { TIER_STYLES } from '../../utils/tierStyles'
import { TIERS } from '../../types/book'
import type { AnyTier, TrackedBook } from '../../types/book'
import { useBooksStore } from '../../store/booksStore'

interface BookDetailModalProps {
  book: TrackedBook
  onClose: () => void
}

const ALL_TIERS: AnyTier[] = [...TIERS, 'dislike', 'unranked']

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const setTier = useBooksStore((s) => s.setTier)
  const markAsRead = useBooksStore((s) => s.markAsRead)
  const updateNotes = useBooksStore((s) => s.updateNotes)
  const removeBook = useBooksStore((s) => s.removeBook)

  const [notes, setNotes] = useState(book.notes)
  const [tropeInput, setTropeInput] = useState('')
  const [tropes, setTropes] = useState<string[]>(book.tropes)
  const [dislikeReason, setDislikeReason] = useState(book.dislikeReason)
  const [showDislikeForm, setShowDislikeForm] = useState(book.tier === 'dislike')
  const [tierError, setTierError] = useState('')

  function commitNotesAndTropes(nextNotes: string, nextTropes: string[]) {
    updateNotes(book.id, nextNotes, nextTropes)
  }

  function addTrope() {
    const trope = tropeInput.trim()
    if (!trope || tropes.includes(trope)) {
      setTropeInput('')
      return
    }
    const next = [...tropes, trope]
    setTropes(next)
    setTropeInput('')
    commitNotesAndTropes(notes, next)
  }

  function removeTrope(trope: string) {
    const next = tropes.filter((t) => t !== trope)
    setTropes(next)
    commitNotesAndTropes(notes, next)
  }

  function handleRemoveBook() {
    removeBook(book.id)
    onClose()
  }

  async function saveDislike() {
    if (!dislikeReason.trim()) {
      setTierError('Add a reason so your recommendations can learn from this rating.')
      return
    }
    try {
      await setTier(book.id, 'dislike', dislikeReason)
      setTierError('')
      setShowDislikeForm(true)
    } catch (error) {
      setTierError(error instanceof Error ? error.message : 'Could not save this rating.')
    }
  }

  function chooseTier(tier: AnyTier) {
    if (tier === 'dislike') {
      setShowDislikeForm(true)
      setTierError('')
      return
    }
    setShowDislikeForm(false)
    setTierError('')
    void setTier(book.id, tier)
  }

  return (
    <Modal title="Grade & notes" onClose={onClose}>
      <div className="detail-book-head">
        <BookCover coverUrl={book.coverUrl} title={book.title} className="detail-cover" />
        <div className="detail-book-copy">
          <h3>{book.title}</h3>
          <p>{book.authors.join(', ') || 'Unknown author'}{book.publishedYear ? ` · ${book.publishedYear}` : ''}</p>
          {book.genres.length > 0 && <p className="detail-genres">{book.genres.join(' · ')}</p>}
          {book.averageRating != null && <p className="detail-rating"><Star fill="currentColor" /> {book.averageRating.toFixed(1)} from {book.source === 'google-books' ? 'Google Books' : 'Open Library'}{book.ratingCount ? ` (${book.ratingCount.toLocaleString()} ratings)` : ''}</p>}
        </div>
      </div>

      <div className="detail-section">
        <p className="detail-label">Your rating</p>
        {book.status === 'want_to_read' ? (
          <div className="read-prompt">
            <p>
              On your want-to-read list. Mark it as read once you've finished it to grade it.
            </p>
            <button
              type="button"
              onClick={() => markAsRead(book.id)}
              className="button button-primary"
            >
              <BookMarked /> Mark as read
            </button>
          </div>
        ) : (
          <div className="rating-choices">
            {ALL_TIERS.map((tier) => {
              const style = TIER_STYLES[tier]
              const active = book.tier === tier
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => chooseTier(tier)}
                  className={`rating-choice tier-${tier}${active || (tier === 'dislike' && showDislikeForm) ? ' active' : ''}`}
                >
                  {style.label}
                </button>
              )
            })}
          </div>
        )}
        {showDislikeForm && book.status === 'read' && (
          <div className="dislike-form">
            <label className="detail-label" htmlFor="dislike-reason">What put you off this book? <span>Required</span></label>
            <textarea id="dislike-reason" className="text-area" value={dislikeReason} onChange={(event) => setDislikeReason(event.target.value)} placeholder="For example: slow pacing, unlikeable characters, too much romance..." />
            <button type="button" className="button button-danger" onClick={saveDislike} disabled={!dislikeReason.trim()}>
              Save Dislike reason
            </button>
            {tierError && <p className="field-error" role="alert">{tierError}</p>}
          </div>
        )}
      </div>

      <div className="detail-section">
        <label className="detail-label" htmlFor="book-notes">Your notes</label>
        <textarea
          id="book-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => commitNotesAndTropes(notes, tropes)}
          rows={3}
          placeholder="What stood out? What would you want a future recommendation to know?"
          className="text-area"
        />
      </div>

      <div className="detail-section">
        <p className="detail-label">Tropes and themes</p>
        <div className="trope-list">
          {tropes.map((trope) => (
            <span key={trope} className="trope-chip">
              {trope}
              <button className="trope-remove" type="button" onClick={() => removeTrope(trope)} aria-label={`Remove ${trope}`}>
                <X />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tropeInput}
          onChange={(e) => setTropeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTrope()
            }
          }}
          onBlur={addTrope}
          placeholder="Add a trope or theme, press Enter"
          className="text-field"
        />
      </div>

      <button
        type="button"
        onClick={handleRemoveBook}
        className="remove-book-button"
      >
        <Trash2 /> Remove from library
      </button>
    </Modal>
  )
}
