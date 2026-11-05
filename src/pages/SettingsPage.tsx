import { useState, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  PlugZap,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { testGeminiConnection } from '../api/llm'
import { useSettingsStore } from '../store/settingsStore'
import type { LLMSettings } from '../store/settingsStore'

export function SettingsPage() {
  const llm = useSettingsStore((state) => state.llm)
  const setLLMSettings = useSettingsStore((state) => state.setLLMSettings)
  const [form, setForm] = useState<LLMSettings>(llm)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [connection, setConnection] = useState<{ ok: boolean; message: string } | null>(null)

  function update<K extends keyof LLMSettings>(key: K, value: LLMSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(false)
    setConnection(null)
  }

  function saveSettings(event: FormEvent) {
    event.preventDefault()
    setLLMSettings({ apiKey: form.apiKey.trim(), model: form.model.trim() })
    setForm((current) => ({ ...current, apiKey: current.apiKey.trim(), model: current.model.trim() }))
    setSaved(true)
  }

  async function checkConnection() {
    setChecking(true)
    setConnection(null)
    try {
      const model = await testGeminiConnection(form)
      const verifiedSettings = { apiKey: form.apiKey.trim(), model }
      setForm(verifiedSettings)
      setLLMSettings(verifiedSettings)
      setSaved(true)
      setConnection({ ok: true, message: `Connected to ${model}.` })
    } catch (error) {
      setConnection({ ok: false, message: error instanceof Error ? error.message : 'Connection check failed.' })
    } finally {
      setChecking(false)
    }
  }

  function removeKey() {
    const empty = { ...form, apiKey: '' }
    setForm(empty)
    setLLMSettings(empty)
    setConnection(null)
    setSaved(false)
  }

  return (
    <section className="settings-page">
      <header className="page-heading">
        <p className="eyebrow">Your preferences</p>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Connect Gemini for recommendations. Your library stays on this device.</p>
      </header>

      <div className="settings-section">
        <div className="section-heading">
          <KeyRound aria-hidden="true" />
          <div>
            <h2>Gemini API</h2>
            <p>Use your own Google AI Studio key.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={saveSettings}>
          <div className="field-group">
            <label htmlFor="api-key">API key</label>
            <div className="input-with-action">
              <input
                id="api-key"
                className="text-field"
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(event) => update('apiKey', event.target.value)}
                placeholder="Paste your Gemini API key"
                autoComplete="off"
                spellCheck={false}
              />
              <button className="icon-button" type="button" onClick={() => setShowKey((shown) => !shown)} aria-label={showKey ? 'Hide API key' : 'Show API key'}>
                {showKey ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="model">Gemini model</label>
            <input
              id="model"
              className="text-field"
              value={form.model}
              onChange={(event) => update('model', event.target.value)}
              placeholder="gemini-3.8-flash"
            />
          </div>

          {connection && (
            <p className={`connection-message ${connection.ok ? 'success' : 'failure'}`} role="status">
              {connection.ok ? <CheckCircle2 /> : <AlertCircle />}
              {connection.message}
            </p>
          )}

          <div className="settings-actions">
            <button className="button button-primary" type="submit">
              <Save /> {saved ? 'Saved' : 'Save key'}
            </button>
            <button className="button button-secondary" type="button" onClick={checkConnection} disabled={checking || !form.apiKey.trim()}>
              {checking ? <LoaderCircle className="spin" /> : <PlugZap />}
              {checking ? 'Checking' : 'Test connection'}
            </button>
            <button className="button button-quiet" type="button" onClick={removeKey} disabled={!form.apiKey}>
              <Trash2 /> Remove key
            </button>
          </div>
        </form>

        <div className="privacy-note">
          <ShieldCheck aria-hidden="true" />
          <p>
            The key is saved in this browser's local storage and sent directly to Google. When you generate recommendations, your book ratings, tropes and notes are sent to Gemini too.
            {' '}<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get a key from Google AI Studio <ExternalLink aria-hidden="true" /></a>
          </p>
        </div>
      </div>

      <p className="settings-footnote">This library is stored only in this browser on this device. It is not synced or backed up online.</p>
    </section>
  )
}

