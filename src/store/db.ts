import Dexie, { type EntityTable } from 'dexie'
import type { TrackedBook } from '../types/book'

/** Local IndexedDB database for the tracked book library. */
class BookTrackerDB extends Dexie {
  books!: EntityTable<TrackedBook, 'id'>

  constructor() {
    super('book-tracker')
    this.version(1).stores({
      // Indexed fields: primary key id, tier/dateAdded for sort, *authors for multi-entry author lookup.
      books: 'id, tier, dateAdded, *authors',
    })
    this.version(2)
      .stores({
        books: 'id, tier, status, dateAdded, *authors',
      })
      .upgrade((tx) =>
        // Pre-existing rows predate the want-to-read feature and were only ever
        // added once already graded/gradable, so treat them as already read.
        tx
          .table('books')
          .toCollection()
          .modify((book) => {
            if (!book.status) book.status = 'read'
          }),
      )
    this.version(3)
      .stores({
        books: 'id, tier, status, dateAdded, *authors',
      })
      .upgrade((tx) =>
        tx
          .table('books')
          .toCollection()
          .modify((book) => {
            if (typeof book.dislikeReason !== 'string') book.dislikeReason = ''
          }),
      )
  }
}

export const db = new BookTrackerDB()
