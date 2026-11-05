import { z } from 'zod'
import type { LLMSettings } from '../store/settingsStore'
import type { RawRecommendation, TrackedBook } from '../types/book'

const RecommendationSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  reason: z.string().min(1),
})

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema).min(1).max(5),
})

const MODELS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL_PREFERENCE = ['gemini-3.8-flash', 'gemini-2.0-flash']
const SYSTEM_PROMPT = `You are a thoughtful personal book recommender. Use the reader's complete library as preference data. S and A tier books are strongest positive signals; B books are positive with reservations; C and D books are cautionary signals; Dislike books and their required reasons are strong negative signals. Want-to-read books are positive-interest signals but must never be recommended again. Consider every personal note and trope, including notes on lower-rated and unread books. Avoid books already in the library. Recommend 3 to 5 distinct books and explain specifically why each fits, while respecting stated dislikes. Return only JSON in this shape: {"recommendations":[{"title":"...","author":"...","reason":"..."}]}.`

interface GeminiModel {
  name?: string
  baseModelId?: string
  supportedGenerationMethods?: string[]
}

interface GeminiModelsResponse {
  models?: GeminiModel[]
  error?: { message?: string }
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { message?: string }
}

let modelCache: { apiKey: string; models: string[]; expiresAt: number } | null = null
let successfulModel = ''

async function getModels(apiKey: string): Promise<string[]> {
  if (modelCache?.apiKey === apiKey && modelCache.expiresAt > Date.now()) {
    return modelCache.models
  }
  if (modelCache?.apiKey !== apiKey || modelCache.expiresAt <= Date.now()) {
    modelCache = null
    successfulModel = ''
  }

  const response = await fetch(`${MODELS_ENDPOINT}?pageSize=1000`, {
    headers: { 'x-goog-api-key': apiKey },
    signal: AbortSignal.timeout(10000),
  })
  const data = (await response.json()) as GeminiModelsResponse
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Could not check Gemini models (${response.status}).`)
  }
  const availableModels = (data.models ?? [])
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => model.baseModelId ?? model.name?.replace(/^models\//, '') ?? '')
    .filter((model) => model.startsWith('gemini-'))
    .filter((model) => !/(image|audio|tts|embedding|aqa|robotics|computer-use)/i.test(model))
    .filter((model) => !/^gemini-2\.5-flash(?:-|$)/i.test(model))
  const uniqueModels = [...new Set(availableModels)]
  const preferredModels = MODEL_PREFERENCE.filter((model) => uniqueModels.includes(model))
  const remainingModels = uniqueModels
    .filter((model) => !preferredModels.includes(model))
    .sort((first, second) => {
      const firstFlash = /flash/i.test(first) ? 0 : 1
      const secondFlash = /flash/i.test(second) ? 0 : 1
      return firstFlash - secondFlash || first.localeCompare(second)
    })
  const models = [...preferredModels, ...remainingModels].slice(0, 5)
  if (models.length) modelCache = { apiKey, models, expiresAt: Date.now() + 10 * 60 * 1000 }
  return models
}

export async function testGeminiConnection(settings: Pick<LLMSettings, 'apiKey' | 'model'>): Promise<string> {
  if (!settings.apiKey.trim()) throw new Error('Add your Gemini API key first.')
  const models = await getModels(settings.apiKey.trim())
  if (!models.length) throw new Error('This API key has no Gemini models that support generateContent.')
  const configuredModel = settings.model.trim().replace(/^models\//, '')
  return models.includes(configuredModel) ? configuredModel : models[0]
}

function describeBook(book: TrackedBook): string {
  const parts = [
    `"${book.title}" by ${book.authors.join(', ') || 'Unknown author'}`,
    `status: ${book.status === 'read' ? 'read' : 'want to read'}`,
    `rating: ${book.tier === 'unranked' ? 'not yet rated' : book.tier}`,
  ]
  if (book.genres.length) parts.push(`genres: ${book.genres.join(', ')}`)
  if (book.tropes.length) parts.push(`tropes: ${book.tropes.join(', ')}`)
  if (book.dislikeReason.trim()) parts.push(`reason for dislike: ${book.dislikeReason.trim()}`)
  if (book.notes.trim()) parts.push(`personal notes: ${book.notes.trim()}`)
  return `- ${parts.join(' | ')}`
}

function buildUserPrompt(books: TrackedBook[]): string {
  const library = books.map(describeBook).join('\n')
  return `Use this complete library as taste data. S/A are strong positives, B is positive with reservations, C/D are cautionary, and Dislike plus its reason is a strong negative. Want-to-read titles are positive interest but must not be suggested again. Consider every personal note and trope, including notes from lower-rated books.\n\n${library}\n\nRecommend 3 to 5 books not already listed above.`
}

function extractJson(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenced) return fenced[1]
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  return start !== -1 && end > start ? content.slice(start, end + 1) : content.trim()
}

export async function requestRecommendations(
  settings: LLMSettings,
  books: TrackedBook[],
): Promise<{ recommendations: RawRecommendation[]; model: string }> {
  const apiKey = settings.apiKey.trim()
  if (!apiKey) throw new Error('Add your Gemini API key in Settings to get recommendations.')
  if (!books.length) throw new Error('Add books and notes to your library before requesting recommendations.')

  const models = await getModels(apiKey)
  if (!models.length) throw new Error('This API key has no Gemini models that support generateContent.')

  const configuredModel = settings.model.trim().replace(/^models\//, '')
  const orderedModels = [
    ...(successfulModel && models.includes(successfulModel) ? [successfulModel] : []),
    ...(models.includes(configuredModel) ? [configuredModel] : []),
    ...models,
  ].filter((model, index, list) => list.indexOf(model) === index)
  const errors: string[] = []

  for (const model of orderedModels) {
    try {
      const response = await fetch(`${MODELS_ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: buildUserPrompt(books) }] }],
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
        }),
      })
      const data = (await response.json()) as GeminiResponse
      if (!response.ok) {
        errors.push(`${model}: ${data.error?.message ?? `Request failed (${response.status}).`}`)
        if (response.status === 404) {
          modelCache = null
          successfulModel = ''
        }
        if (response.status === 401 || response.status === 403) break
        continue
      }

      const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
      if (!content) {
        errors.push(`${model}: Gemini returned no generated text.`)
        continue
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(extractJson(content))
      } catch {
        errors.push(`${model}: Gemini returned unreadable JSON.`)
        continue
      }
      const result = RecommendationsResponseSchema.safeParse(parsed)
      if (!result.success) {
        errors.push(`${model}: Gemini returned an invalid recommendation format.`)
        continue
      }

      successfulModel = model
      return { recommendations: result.data.recommendations, model }
    } catch (error) {
      if (model === successfulModel) successfulModel = ''
      errors.push(`${model}: ${error instanceof Error && error.name === 'TimeoutError' ? 'Request timed out.' : 'Request could not reach Gemini.'}`)
    }
  }

  const details = errors.join('\n')
  if (errors.some((message) => message.includes('429'))) {
    throw new Error(`Gemini rate limit reached. Wait a little and try again, or check your Google AI Studio quota.\n${details}`)
  }
  throw new Error(`All available Gemini models failed.\n${details}`)
}
