import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, KeyRound, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { requestRecommendations } from '../api/llm'
import { enrichRecommendations } from '../api/recommendations'
import { RecommendationCard } from '../components/recommendations/RecommendationCard'
import { useBooksStore } from '../store/booksStore'
import { useSettingsStore } from '../store/settingsStore'
import type { EnrichedRecommendation } from '../types/book'
import type { ReadStatus } from '../types/book'

export function RecommendationsPage() {
  const books = useBooksStore((state) => state.books)
  const addBook = useBooksStore((state) => state.addBook)
  const llmSettings = useSettingsStore((state) => state.llm)
  const setLLMSettings = useSettingsStore((state) => state.setLLMSettings)

  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const trackedIds = useMemo(() => new Set(books.map((b) => b.id)), [books])

  async function handleGenerate() {
    setStatus('loading')
    setError(null)
    try {
      const result = await requestRecommendations(llmSettings, books)
      if (result.model !== llmSettings.model) {
        setLLMSettings({ ...llmSettings, model: result.model })
      }
      const enriched = await enrichRecommendations(result.recommendations)
      setRecommendations(enriched)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong generating recommendations.')
      setStatus('error')
    }
  }

  function handleAdd(recommendation: EnrichedRecommendation, status: ReadStatus) {
    if (recommendation.metadata) void addBook(recommendation.metadata, status)
  }

  return (
    <section className="discover-page">
      <header className="page-heading">
        <p className="eyebrow">Reader intelligence</p>
        <h1 className="page-title">Find your next favourite</h1>
        <p className="page-subtitle">Gemini looks across your full library: ratings, notes, tropes, and the things you would rather avoid.</p>
      </header>

      {books.length === 0 ? (
        <div className="empty-state"><BookOpen aria-hidden="true" /><h2>Start with your own shelf</h2><p>Add a few books first. Ratings and notes help Gemini make more personal suggestions.</p><Link className="button button-primary" to="/search">Add books</Link></div>
      ) : !llmSettings.apiKey ? (
        <div className="discover-setup"><KeyRound aria-hidden="true" /><div><h2>Connect your Gemini key</h2><p>Your key is needed to generate recommendations.</p></div><Link className="button button-primary" to="/settings">Open Settings</Link></div>
      ) : (
        <div className="discover-controls">
          <button type="button" className="button button-primary generate-button" onClick={handleGenerate} disabled={status === 'loading'}>
            {status === 'loading' ? <><LoaderCircle className="spin" /> Finding your next read...</> : <><Sparkles /> Generate fresh picks</>}
          </button>
          <p className="data-sharing-note"><ShieldCheck aria-hidden="true" /> Your book ratings, notes and tropes are sent directly to Google Gemini for this request.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="discover-error" role="alert"><AlertCircle aria-hidden="true" /><p>{error}</p><Link to="/settings">Review Gemini settings</Link></div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendation-list" aria-live="polite">
          <div className="recommendation-list-heading"><h2>Your picks</h2><span>{recommendations.length} recommendations</span></div>
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={`${recommendation.title}:${recommendation.author}`}
              recommendation={recommendation}
              tracked={recommendation.metadata ? trackedIds.has(recommendation.metadata.id) : false}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}
    </section>
  )
}
