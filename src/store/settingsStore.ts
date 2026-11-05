import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LLMSettings {
  apiKey: string
  model: string
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  apiKey: '',
  model: 'gemini-3.8-flash',
}

interface SettingsState {
  llm: LLMSettings
  setLLMSettings: (settings: LLMSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      llm: DEFAULT_LLM_SETTINGS,
      setLLMSettings: (llm) => set({ llm }),
    }),
    { name: 'book-tracker-gemini-settings' },
  ),
)
