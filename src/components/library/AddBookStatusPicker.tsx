import { Bookmark, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import type { ReadStatus } from '../../types/book'

interface AddBookStatusPickerProps {
  tracked: boolean
  onAdd: (status: ReadStatus) => void
}

export function AddBookStatusPicker({ tracked, onAdd }: AddBookStatusPickerProps) {
  const [choosingStatus, setChoosingStatus] = useState(false)

  if (tracked) {
    return <span className="button button-added"><Check aria-hidden="true" /> In library</span>
  }

  if (!choosingStatus) {
    return (
      <button className="button button-secondary" type="button" onClick={() => setChoosingStatus(true)}>
        <Plus aria-hidden="true" /> Add to library
      </button>
    )
  }

  return (
    <div className="add-status-picker" role="group" aria-label="Choose reading status">
      <span>Have you read it?</span>
      <button type="button" onClick={() => onAdd('read')}><Check aria-hidden="true" /> I've read it</button>
      <button type="button" onClick={() => onAdd('want_to_read')}><Bookmark aria-hidden="true" /> Want to read</button>
      <button className="add-status-cancel" type="button" onClick={() => setChoosingStatus(false)}>Cancel</button>
    </div>
  )
}