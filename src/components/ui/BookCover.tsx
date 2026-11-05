import { useState } from 'react'
import { BookOpen } from 'lucide-react'

interface BookCoverProps {
  coverUrl: string | null
  title: string
  className?: string
}

/** Book cover image with a graceful fallback when no cover is available or fails to load. */
export function BookCover({ coverUrl, title, className = '' }: BookCoverProps) {
  const [failed, setFailed] = useState(false)

  if (!coverUrl || failed) {
    return (
      <div
        className={`cover-fallback ${className}`}
        title={title}
      >
        <BookOpen aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={coverUrl}
      alt={`Cover of ${title}`}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}

