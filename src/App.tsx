import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/ui/Layout'
import { SearchPage } from './pages/SearchPage'
import { TierBoardPage } from './pages/TierBoardPage'
import { LibraryPage } from './pages/LibraryPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useBooksStore } from './store/booksStore'

function App() {
  const loadBooks = useBooksStore((state) => state.loadBooks)

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LibraryPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="tier-board" element={<TierBoardPage />} />
        <Route path="discover" element={<RecommendationsPage />} />
        <Route path="recommendations" element={<Navigate to="/discover" replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App

