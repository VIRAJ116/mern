import { http } from './axios'
import { getAccessToken } from './token-store'

export const sendChatMessage = async (messages) => {
  const response = await http.post('/chat', { messages })
  return response.data
}

/**
 * Stream chat via SSE.
 * Uses native fetch (not axios) because axios doesn't support ReadableStream.
 * Returns an async generator that yields text chunks.
 */
export async function* streamChatMessage(messages) {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const token = getAccessToken()

  const response = await fetch(`${baseURL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE messages are separated by double newlines
    const parts = buffer.split('\n\n')
    buffer = parts.pop() // keep the incomplete part

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data: ')) continue

      const data = line.slice(6) // remove "data: "
      if (data === '[DONE]') return

      try {
        const parsed = JSON.parse(data)
        if (parsed.text) {
          yield parsed.text
        }
        if (parsed.error) {
          throw new Error(parsed.error)
        }
      } catch (e) {
        if (e.message === 'Stream error') throw e
        // ignore JSON parse errors on partial data
      }
    }
  }
}
